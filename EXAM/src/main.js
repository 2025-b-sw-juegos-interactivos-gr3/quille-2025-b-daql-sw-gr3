import { CONFIG } from './config.js';
import { State } from './state.js';
import { setupUI, updateMissionText, showTemporaryMessage, showVictory, toggleActionPrompt } from './ui.js';
import { createScene, initializeGameAssets } from './environment.js';
import { spawnPickupEffect, spawnDeliverEffect } from './effects.js'; 

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const startApp = async () => {
    // 1. CARGA DE ESCENA
    // Creamos el escenario y cargamos los modelos 3D antes de empezar.
    const scene = await createScene(engine, canvas);

    // ---CÁMARA ---
    // Usamos una ArcRotateCamera para la vista en tercera persona.
    // 'lockedTarget' es vital: hace que la cámara persiga automáticamente al jugador.
    const camera = new BABYLON.ArcRotateCamera("Cam", -Math.PI/2, Math.PI/3, 14, State.playerMesh.position, scene);
    camera.lockedTarget = State.playerMesh;
    camera.lowerRadiusLimit = 2; 
    camera.upperRadiusLimit = 20;
    camera.attachControl(canvas, true);
    
    State.camera = camera;

    // --- INPUTS (TECLADO) ---
    // Escuchamos qué teclas presiona el usuario y guardamos su estado (true/false)
    // en el objeto 'State.keys'. Esto nos permite movernos suavemente en el bucle.
    const handleInput = (e, isPressed) => {
        const code = e.code.toLowerCase();
        State.keys[code] = isPressed; 
        if (code === 'space' || code === 'keye') State.actionPressed = isPressed;
    };
    
    // Herramienta de depuración (Tecla P)
    window.addEventListener('keydown', (e) => {
        handleInput(e, true);
        if (e.code === 'KeyP') {
            const pos = State.playerMesh.position;
            console.log(`Pos: new BABYLON.Vector3(${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)}),`);
        }
    });

    window.addEventListener('keyup', (e) => handleInput(e, false));
    window.addEventListener('blur', () => { State.keys = {}; });

    // Inicialización de lógica del juego (cofres, UI)
    initializeGameAssets(scene);
    setupUI(() => { 
        initializeGameAssets(scene); 
        State.isGameActive = true; 
        canvas.focus();
    });

    // --- EL BUCLE PRINCIPAL (GAME LOOP) ---
    // Esta función 'runRenderLoop' es el corazón del juego.
    // Se ejecuta 60 veces por segundo. En cada vuelta, calculamos
    // la física, la lógica y dibujamos la imagen nueva.
    engine.runRenderLoop(() => {
        if (!scene.isReady() || !State.playerMesh) return;
        if (!State.isGameActive) { scene.render(); return; }

        const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);

        // ---  FÍSICA Y SUELO (RAYCAST) ---
        // Lanzamos un rayo invisible desde el jugador hacia abajo (vector 0, -1, 0).
        // Si el rayo toca algo (pick.hit), sabemos que estamos "aterrizados" (isGrounded).
        // Esto sirve para desactivar la gravedad y evitar resbalones en pendientes.
        const ray = new BABYLON.Ray(State.playerMesh.position, new BABYLON.Vector3(0, -1, 0), 0.6);
        const pick = scene.pickWithRay(ray, (mesh) => mesh.checkCollisions);
        const isGrounded = pick.hit; 

        // ---  MÁQUINA DE ESTADOS ---
        // El juego pregunta constantemente: ¿Llevo un cofre en la mano?
        if (!State.carriedChest) {
            // CASO 1: NO LLEVO COFRE -> MODO BUSQUEDA
            // Buscamos si hay algún cofre cerca para recogerlo.
            let nearest = null;
            State.chests.forEach(c => {
                if (c.metadata.isCollectible && !c.parent && c.position.subtract(State.playerMesh.position).length() < CONFIG.pickupRange) {
                    nearest = c;
                }
            });

            if (nearest) {
                toggleActionPrompt(true, "E: Recoger");
                if (State.actionPressed) {
                    // Acción: Recoger cofre
                    nearest.checkCollisions = false;
                    nearest.rotationQuaternion = null; 

                    // Efecto visual: Partículas doradas
                    spawnPickupEffect(nearest.position, scene);

                    // Emparentamos el cofre al personaje para que se mueva con él
                    nearest.setParent(State.visualMesh); 
                    const targetPos = new BABYLON.Vector3(0, 0.7, 0.6); 
                    
                    // Animación suave hacia las manos
                    BABYLON.Animation.CreateAndStartAnimation(
                        "pickupAnim", nearest, "position", 60, 20, 
                        nearest.position, targetPos, 
                        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                    );

                    nearest.rotation = new BABYLON.Vector3(0, 0, 0);
                    nearest.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);

                    State.carriedChest = nearest;
                    State.actionPressed = false; 
                    showTemporaryMessage("¡Lo tienes!");
                }
            } else {
                toggleActionPrompt(false);
            }
        } else {
            // CASO 2: SÍ LLEVO COFRE -> MODO ENTREGA
            // Verificamos si estamos cerca del barco para entregar.
            if (State.playerMesh.position.subtract(State.shipZone.position).length() < CONFIG.deliverRange) {
                toggleActionPrompt(true, "E: Entregar");
                if (State.actionPressed) {
                    State.carriedChest.setParent(null); 
                    
                    // Efecto visual: Partículas verdes de éxito
                    spawnDeliverEffect(State.shipZone.position, scene);

                    // Animación de soltar el cofre en el barco
                    const dropPos = State.shipZone.position.clone();
                    dropPos.x += (Math.random() - 0.5) * 1.5;
                    dropPos.z += (Math.random() - 0.5) * 1.5;
                    dropPos.y = -0.136; 

                    BABYLON.Animation.CreateAndStartAnimation(
                        "dropAnim", State.carriedChest, "position", 60, 15, 
                        State.carriedChest.position, dropPos, 
                        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
                    );
                    
                    // Reseteamos propiedades del cofre y actualizamos contador
                    State.carriedChest.scaling = new BABYLON.Vector3(1, 1, 1);
                    State.carriedChest.rotation = new BABYLON.Vector3(0, Math.random() * Math.PI, 0);
                    State.carriedChest.metadata.isCollectible = false;
                    State.carriedChest = null;
                    State.chestsCollected++;
                    updateMissionText();
                    State.actionPressed = false;
                    
                    // Verificar condición de victoria
                    if (State.chestsCollected >= CONFIG.totalChests) {
                        State.isGameActive = false;
                        showVictory();
                    }
                }
            } else {
                toggleActionPrompt(false);
            }
        }

        // ---  MOVIMIENTO RELATIVO A LA CÁMARA ---
        // Calculamos los inputs X y Z.
        const inputZ = (State.keys['keyw'] || State.keys['arrowup'] ? 1 : 0) + (State.keys['keys'] || State.keys['arrowdown'] ? -1 : 0);
        const inputX = (State.keys['keyd'] || State.keys['arrowright'] ? 1 : 0) + (State.keys['keya'] || State.keys['arrowleft'] ? -1 : 0);
        
        let isMoving = false;
        const gravity = CONFIG.gravitySpeed * dt; 

        if (inputX !== 0 || inputZ !== 0) {
            isMoving = true;
            // Obtenemos hacia dónde mira la cámara para que "Arriba" sea siempre "Adelante"
            const forward = State.camera.getForwardRay().direction;
            forward.y = 0; forward.normalize();
            const right = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), forward);
            const moveDir = forward.scale(inputZ).add(right.scale(inputX)).normalize();
            
            const moveVec = moveDir.scale(CONFIG.moveSpeed * dt * 80); 

            // moveWithCollisions evita que atravesemos paredes
            State.playerMesh.moveWithCollisions(new BABYLON.Vector3(moveVec.x, gravity, moveVec.z));

            // Rotamos suavemente al personaje (Luffy) hacia donde camina
            if (State.visualMesh) {
                const targetAngle = Math.atan2(moveDir.x, moveDir.z);
                const currentAngle = State.visualMesh.rotation.y;
                State.visualMesh.rotation.y = BABYLON.Scalar.Lerp(currentAngle, targetAngle, 0.2);
            }
        } else {
            // Lógica de Gravedad vs Freno
            if (isGrounded) {
                // Si estamos quietos en el suelo, NO aplicamos gravedad para no deslizarnos.
            } else {
                // Si estamos en el aire, caemos.
                State.playerMesh.moveWithCollisions(new BABYLON.Vector3(0, gravity, 0));
            }
        }

        // ---  CONTROL DE ANIMACIONES ---
        // Si nos movemos -> Play Walk. Si no -> Play Idle.
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