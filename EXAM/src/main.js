import { CONFIG } from './config.js';
import { State } from './state.js';
import { setupUI, updateMissionText, showTemporaryMessage, showVictory, toggleActionPrompt } from './ui.js';
import { createScene, initializeGameAssets } from './environment.js';

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const startApp = async () => {
    const scene = await createScene(engine, canvas);

    const camera = new BABYLON.ArcRotateCamera("Cam", -Math.PI/2, Math.PI/3, 14, State.playerMesh.position, scene);
    camera.lockedTarget = State.playerMesh;
    camera.lowerRadiusLimit = 2; 
    camera.upperRadiusLimit = 20;
    camera.attachControl(canvas, true);
    
    State.camera = camera;

    const handleInput = (e, isPressed) => {
        const code = e.code.toLowerCase();
        State.keys[code] = isPressed; 
        if (code === 'space' || code === 'keye') State.actionPressed = isPressed;
    };
    
    window.addEventListener('keydown', (e) => {
        handleInput(e, true);
        if (e.code === 'KeyP') {
            const pos = State.playerMesh.position;
            console.log(`Pos: new BABYLON.Vector3(${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)}),`);
        }
    });

    window.addEventListener('keyup', (e) => handleInput(e, false));
    window.addEventListener('blur', () => { State.keys = {}; });

    initializeGameAssets(scene);
    setupUI(() => { 
        initializeGameAssets(scene); 
        State.isGameActive = true; 
        canvas.focus();
    });

    engine.runRenderLoop(() => {
        if (!scene.isReady() || !State.playerMesh) return;
        if (!State.isGameActive) { scene.render(); return; }

        const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);

        // --- 💡 DETECCIÓN DE SUELO (RAYCAST) ---
        // Lanzamos un rayo invisible desde el centro del jugador hacia abajo (0, -1, 0)
        // Longitud 0.6 (porque el personaje mide 1.0, el centro es 0.5, así que 0.6 toca el suelo)
        const ray = new BABYLON.Ray(State.playerMesh.position, new BABYLON.Vector3(0, -1, 0), 0.6);
        const groundHit = scene.pickWithRay(ray, (mesh) => mesh.checkCollisions);
        const isGrounded = groundHit.hit; // true si estamos tocando piso

        // 1. MECÁNICAS
        if (!State.carriedChest) {
            let nearest = null;
            State.chests.forEach(c => {
                if (c.metadata.isCollectible && !c.parent && c.position.subtract(State.playerMesh.position).length() < CONFIG.pickupRange) {
                    nearest = c;
                }
            });

            if (nearest) {
                toggleActionPrompt(true, "E: Recoger");
                if (State.actionPressed) {
                    nearest.checkCollisions = false;
                    nearest.rotationQuaternion = null; 
                    nearest.parent = State.visualMesh;
                    nearest.position = new BABYLON.Vector3(0, 3.5, 0); 
                    nearest.rotation = new BABYLON.Vector3(0, 0, 0);
                    nearest.scaling = new BABYLON.Vector3(2, 2, 2);
                    State.carriedChest = nearest;
                    State.actionPressed = false; 
                    showTemporaryMessage("¡Al barco!");
                }
            } else {
                toggleActionPrompt(false);
            }
        } else {
            if (State.playerMesh.position.subtract(State.shipZone.position).length() < CONFIG.deliverRange) {
                toggleActionPrompt(true, "E: Entregar");
                if (State.actionPressed) {
                    State.carriedChest.parent = null; 
                    const dropPos = State.shipZone.position.clone();
                    dropPos.x += (Math.random() - 0.5) * 1.5;
                    dropPos.z += (Math.random() - 0.5) * 1.5;
                    dropPos.y = -0.136; 
                    State.carriedChest.position = dropPos;
                    State.carriedChest.scaling = new BABYLON.Vector3(1, 1, 1);
                    State.carriedChest.rotation = new BABYLON.Vector3(0, Math.random() * Math.PI, 0);
                    State.carriedChest.metadata.isCollectible = false;
                    State.carriedChest = null;
                    State.chestsCollected++;
                    updateMissionText();
                    State.actionPressed = false;
                    if (State.chestsCollected >= CONFIG.totalChests) {
                        State.isGameActive = false;
                        showVictory();
                    }
                }
            } else {
                toggleActionPrompt(false);
            }
        }

        // 2. MOVIMIENTO
        const inputZ = (State.keys['keyw'] || State.keys['arrowup'] ? 1 : 0) + (State.keys['keys'] || State.keys['arrowdown'] ? -1 : 0);
        const inputX = (State.keys['keyd'] || State.keys['arrowright'] ? 1 : 0) + (State.keys['keya'] || State.keys['arrowleft'] ? -1 : 0);
        
        let isMoving = false;
        const gravity = CONFIG.gravitySpeed * dt; 

        if (inputX !== 0 || inputZ !== 0) {
            isMoving = true;
            const forward = State.camera.getForwardRay().direction;
            forward.y = 0; forward.normalize();
            const right = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), forward);
            const moveDir = forward.scale(inputZ).add(right.scale(inputX)).normalize();
            
            const moveVec = moveDir.scale(CONFIG.moveSpeed * dt * 80); 

            State.playerMesh.moveWithCollisions(new BABYLON.Vector3(moveVec.x, gravity, moveVec.z));

            if (State.visualMesh) {
                const targetAngle = Math.atan2(moveDir.x, moveDir.z);
                const currentAngle = State.visualMesh.rotation.y;
                State.visualMesh.rotation.y = BABYLON.Scalar.Lerp(currentAngle, targetAngle, 0.2);
            }
        } else {
            // --- 💡 ARREGLO DE RESBALONES (FRENO DE MANO) ---
            if (isGrounded) {
                // Si estás en el suelo y NO tocas teclas: NO TE MUEVAS.
                // Esto evita que la gravedad te deslice por las montañas.
            } else {
                // Si estás en el aire, aplica gravedad para caer.
                State.playerMesh.moveWithCollisions(new BABYLON.Vector3(0, gravity, 0));
            }
        }

        const { walk, idle } = State.animations;
        if (isMoving) {
            if (walk && !walk.isPlaying) {
                if (idle) idle.stop();
                walk.start(true, 1.0);
            }
        } else {
            if (walk && walk.isPlaying) walk.stop();
            if (idle && !idle.isPlaying) idle.start(true);
        }

        scene.render();
    });

    window.addEventListener("resize", () => engine.resize());
};

startApp();