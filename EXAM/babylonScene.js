    // 1. Inicialización y Variables Globales
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true); 

    // Variables de Movimiento
    let playerContainer = null; 
    let moveSpeed = 0.15; 
    const turnSpeed = 0.15; 
    let keys = {}; 

    // Variables del Juego
    let isGameActive = false;
    let chestsCollected = 0; 
    const TOTAL_CHESTS = 1; 

    let treasureChests = []; 
    let carriedChest = null;
    let actionPressed = false; // true cuando el jugador presiona E o Space
    let shipZone = null;
    const pickupRange = 2.0;
    const deliverRange = 4.0;
 
    // Animaciones del personaje
    let walkAnim = null;
    let idleAnim = null;
    let backAnim = null;
    let allAnimationGroups = [];
    // Visual effects
    let highlightLayer = null;
    // Player model globals (exposed for other systems / debugging)
    let playerModelRoot = null;        // root mesh of the imported player model
    let playerSkeleton = null;         // primary skeleton (if any)
    let playerMeshes = [];             // array of meshes that belong to the player model
    let playerAnimationGroups = [];   // animation groups specifically from the player model
    let playerModelReady = false;     // true when player model has been fully attached

    // ----------------------------------------------------------
    // 📍 CONFIGURACIÓN DE POSICIONES 
    // ----------------------------------------------------------

    // POSICIÓN DEL COFRE OBJETIVO (solo 1)
    const ALL_CHEST_POSITIONS = [
        new BABYLON.Vector3(-10.981, 1.308, -5.123),
    ];

    // POSICIÓN ZONA DE ENTREGA (Barco)
    const shipZonePosition = new BABYLON.Vector3(-2.796, 0.827, 0.612); 

    // Altura del Jugador (para Raycast)
    const playerHeight = 0.5; 
    const chestSize = 0.4; 


    // 2. INTERFAZ DE USUARIO (HTML)
    const startScreen = document.getElementById("startScreen");
    const playButton = document.getElementById("playButton");
    const gameMessage = document.getElementById("gameMessage");

    function updateMissionText() {
        if (!gameMessage) return;
        if (chestsCollected < TOTAL_CHESTS) {
            gameMessage.innerText = `¡Busca los Tesoros! (${chestsCollected}/${TOTAL_CHESTS})`;
            gameMessage.style.color = "#ffd700";
        } else {
            gameMessage.innerText = "¡TODOS LOS TESOROS RECOGIDOS! Dirígete al barco ahora.";
            gameMessage.style.color = "#00ff00";
        }
    }

    // Mensaje temporal en pantalla (global) - accesible desde cualquier parte del script
    function showTemporaryMessage(text, duration = 2500) {
        if (!gameMessage) return;
        gameMessage.innerText = text;
        gameMessage.style.display = 'block';
        gameMessage.style.opacity = '1';
        setTimeout(() => {
            // Solo ocultar si no estamos en misión final
            if (chestsCollected < TOTAL_CHESTS) {
                gameMessage.style.opacity = '0';
                setTimeout(() => { if (chestsCollected < TOTAL_CHESTS) gameMessage.style.display = 'none'; }, 400);
            }
        }, duration);
    }

    // Efectos visuales: partículas y glow
    function spawnPickupEffect(position, scene) {
        try {
            const ps = new BABYLON.ParticleSystem('pickupPS', 200, scene);
            ps.particleTexture = new BABYLON.Texture('https://www.babylonjs.com/assets/Flare.png', scene);
            ps.emitter = position.clone();
            ps.minEmitBox = new BABYLON.Vector3(-0.2, 0, -0.2);
            ps.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.2);
            ps.color1 = new BABYLON.Color4(1, 0.9, 0.2, 1);
            ps.color2 = new BABYLON.Color4(1, 0.6, 0, 1);
            ps.minSize = 0.05; ps.maxSize = 0.18;
            ps.minLifeTime = 0.3; ps.maxLifeTime = 0.7;
            ps.emitRate = 150;
            ps.gravity = new BABYLON.Vector3(0, -1, 0);
            ps.direction1 = new BABYLON.Vector3(-1, 1, -1);
            ps.direction2 = new BABYLON.Vector3(1, 1, 1);
            ps.start();
            setTimeout(() => { try { ps.stop(); ps.dispose(); } catch(e){} }, 800);
        } catch (e) { console.warn('spawnPickupEffect failed', e); }
    }

    function spawnDeliverEffect(position, scene) {
        try {
            const ps = new BABYLON.ParticleSystem('deliverPS', 300, scene);
            ps.particleTexture = new BABYLON.Texture('https://www.babylonjs.com/assets/Flare.png', scene);
            ps.emitter = position.clone();
            ps.minEmitBox = new BABYLON.Vector3(-0.4, 0, -0.4);
            ps.maxEmitBox = new BABYLON.Vector3(0.4, 0.4, 0.4);
            ps.color1 = new BABYLON.Color4(0.2, 1, 0.6, 1);
            ps.color2 = new BABYLON.Color4(0.1, 0.8, 0.4, 1);
            ps.minSize = 0.06; ps.maxSize = 0.25;
            ps.minLifeTime = 0.4; ps.maxLifeTime = 1.0;
            ps.emitRate = 200;
            ps.gravity = new BABYLON.Vector3(0, -0.6, 0);
            ps.direction1 = new BABYLON.Vector3(-1, 1, -1);
            ps.direction2 = new BABYLON.Vector3(1, 1, 1);
            ps.start();
            setTimeout(() => { try { ps.stop(); ps.dispose(); } catch(e){} }, 1000);
        } catch (e) { console.warn('spawnDeliverEffect failed', e); }
    }

    // 💡 FUNCIÓN REUTILIZABLE PARA CREAR COFRES (Accesible globalmente)
    const createChest = (position, scene) => {
        const chest = BABYLON.MeshBuilder.CreateBox(`Chest_${position.x}_${position.z}`, {size: chestSize}, scene);
        chest.position = position;
        const chestMat = new BABYLON.StandardMaterial("chestMat", scene);
        chestMat.diffuseColor = new BABYLON.Color3(1, 0.84, 0); 
        chest.material = chestMat;
        chest.isCollectible = true; 
        chest.rotation.y = Math.random() * Math.PI * 2; 
        return chest;
    };


    // 💡 FUNCIÓN CENTRAL DE INICIALIZACIÓN DE ASSETS DEL JUEGO
    function initializeGameAssets(scene) {
        // 1. Limpieza de elementos viejos
        treasureChests.forEach(c => { try { if (c && !c.isDisposed) c.dispose(); } catch (e) {} });
        if (carriedChest) { try { if (!carriedChest.isDisposed) carriedChest.dispose(); } catch(e){} }
        if (shipZone) { try { shipZone.dispose(); } catch(e){} }

        // 2. Reset de Variables Globales
        chestsCollected = 0;
        treasureChests = [];
        carriedChest = null;

        // 3. Recrear Cofres (5)
        ALL_CHEST_POSITIONS.forEach(pos => {
            const chest = createChest(pos, scene);
            treasureChests.push(chest);
        });

        // Marcamos cada cofre como no entregado y coleccionable
        treasureChests.forEach(c => {
            c.metadata = { delivered: false };
            c.isCollectible = true;
            c.checkCollisions = true;
            c.setParent(null);
            try { c.setEnabled(true); } catch(e){}
            c.isCarried = false;
        });

        // Limpiar efectos visuales previos
        try {
            if (highlightLayer) { highlightLayer.removeAllMeshes(); }
        } catch (e) {}

        // Reset animations: stop all groups and restart idle if present
        try {
            allAnimationGroups.forEach(g => { try { g.stop(); } catch(e){} });
            if (idleAnim) try { idleAnim.start(true); } catch(e){}
            if (walkAnim) try { walkAnim.stop(); } catch(e){}
        } catch(e) {}

        // 5. Recrear Zona de Entrega (Barco)
        shipZone = BABYLON.MeshBuilder.CreateBox("shipZone", {size: 3}, scene);
        shipZone.position = new BABYLON.Vector3(shipZonePosition.x, shipZonePosition.y + 1.0, shipZonePosition.z);
        shipZone.isVisible = false; 
        // Update HUD if present
        const hudCounter = document.getElementById('hudCounter');
        if (hudCounter) hudCounter.innerText = `Tesoros: ${chestsCollected}/${TOTAL_CHESTS}`;
    }


    if (playButton) {
        playButton.addEventListener("click", () => {
            // Si es un botón de "Jugar de Nuevo" recargamos la página para asegurar reinicio completo
            if (playButton.innerText && /jugar de nuevo/i.test(playButton.innerText)) {
                location.reload();
                return;
            }
            // 💡 LÓGICA DE INICIO 💡
            initializeGameAssets(scene); // Recrea todos los cofres y variables
            if (startScreen) startScreen.style.display = "none";
            if (gameMessage) { gameMessage.style.display = "block"; updateMissionText(); }
            isGameActive = true;
            // Intentar reproducir la música ambiente tras la interacción del usuario
            try { if (ambientMusic && !ambientMusic.isPlaying) ambientMusic.play(); } catch(e) { console.warn('ambient play failed', e); }
            canvas.focus();
        });
    }

    // 3. CONTROLES
    window.addEventListener('keydown', (event) => {
        keys[event.key.toLowerCase()] = true;
        // Acción de recoger/entregar con Space o E
        if (event.code === 'Space' || event.key.toLowerCase() === 'e') {
            actionPressed = true;
        }
    });
    window.addEventListener('keyup', (event) => { 
        keys[event.key.toLowerCase()] = false; 
        if (event.code === 'Space' || event.key.toLowerCase() === 'e') {
            actionPressed = false;
        }
    });
    window.addEventListener('blur', () => { keys = {}; });


    // 4. CREACIÓN DE LA ESCENA (Setup inicial de ambiente y jugador)
    const createScene = function () {
        const scene = new BABYLON.Scene(engine);
        scene.collisionsEnabled = true; 
        
        // CÁMARA ESTILO PS1 (FIJA)
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 0.5, 0.5, 15, new BABYLON.Vector3(0, 0, 0), scene);
        
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.9;
        
        // --- A. MAPA (islandEXAM.glb) ---
        BABYLON.SceneLoader.Append("", "islaExam.glb", scene, function (scene) {
            scene.meshes.forEach(mesh => { mesh.checkCollisions = true; });
        });
        
        // --- B. JUGADOR (WOLF2.glb) ---
        playerContainer = BABYLON.MeshBuilder.CreateBox("playerContainer", {size: 1}, scene);
        playerContainer.isVisible = false; 
        playerContainer.checkCollisions = true; 
        playerContainer.ellipsoid = new BABYLON.Vector3(0.4, playerHeight, 0.4); 
        
        playerContainer.position = new BABYLON.Vector3(-8.226, 1.121, 2.814); 
        camera.target = playerContainer; 

        BABYLON.SceneLoader.Append("", "L1.glb", scene, function (sceneImport) {
            // Attach loaded model to player container
            playerModelRoot = sceneImport.meshes.find(m => m.name === "__root__" || (m.name && m.name.toLowerCase().includes("root"))) || sceneImport.meshes[0] || null;
            if (playerModelRoot) {
                playerModelRoot.setParent(playerContainer);
                playerModelRoot.position = new BABYLON.Vector3(0, -playerHeight, 0);
            }
            // store meshes and skeletons for external access
            try { playerMeshes = (sceneImport.meshes || []).slice(); } catch(e) { playerMeshes = []; }
            playerSkeleton = (sceneImport.skeletons && sceneImport.skeletons[0]) ? sceneImport.skeletons[0] : null;
            playerModelReady = true;
            // Exponer variables útiles para debugging en la consola
            try {
                window.playerModelRoot = playerModelRoot;
                window.playerMeshes = playerMeshes;
                window.playerSkeleton = playerSkeleton;
                window.playerAnimationGroups = playerAnimationGroups;
                window.playerModelReady = playerModelReady;
                console.log('Player animation groups:', (playerAnimationGroups || []).map(g => g.name));
            } catch(e) {}

            // Detect animation groups (heurística por nombre)
            try {
                const groups = (sceneImport.animationGroups && sceneImport.animationGroups.length) ? sceneImport.animationGroups : (scene.animationGroups || []);
                allAnimationGroups = groups || [];
                playerAnimationGroups = groups || [];
                if (groups && groups.length) {
                    // Heurística extendida para mapear animaciones más precisamente
                    const nameMatches = name => groups.find(g => g.name && new RegExp(name, 'i').test(g.name));
                    walkAnim = nameMatches('walk') || nameMatches('run') || nameMatches('locomotion') || nameMatches('move') || groups.find(g => /locomotion/i.test(g.name));
                    idleAnim = nameMatches('idle') || nameMatches('rest') || nameMatches('stand') || groups[0];
                    backAnim = nameMatches('back') || nameMatches('reverse') || groups.find(g => /back|reverse|backward/i.test(g.name));
                    // If groups are from Mixamo they often have names with underscores/numbers; check for common patterns
                    if (!walkAnim) walkAnim = groups.find(g => /walk|run|step|locomotion|Move/i.test(g.name));
                    if (!idleAnim) idleAnim = groups[0];
                    if (idleAnim) try { idleAnim.start(true); } catch(e){}
                }
            } catch (e) { console.warn('Animation groups detection failed', e); }
        });

        // 💡 Inicializamos los cofres y la zona de entrega la primera vez
        initializeGameAssets(scene); 

        // Highlight layer para efectos de glow
        try { highlightLayer = new BABYLON.HighlightLayer('hl1', scene); } catch(e) { highlightLayer = null; }

        // Rotación suave de todos los cofres (se aplica a los cofres en el array)
        scene.registerBeforeRender(() => {
                treasureChests.forEach(chest => {
                    if (!chest) return;
                    // No girar cofres ya entregados o los que se están llevando
                    if (chest.metadata && (chest.metadata.delivered || chest.isCarried)) return;
                    if(chest && chest.isEnabled()) chest.rotation.y += 0.02;
                });
        });

            

        return scene;
    };

    const scene = createScene();

    // 5. LÓGICA DEL BUCLE DE JUEGO
    const gravitySpeed = -20.0; 

    engine.runRenderLoop(function () {
        
        if (!scene.isReady() || !playerContainer) return;

        if (!isGameActive) {
            scene.render();
            return;
        }

        const deltaTime = engine.getDeltaTime() / 1000;
        const actualSpeed = moveSpeed * deltaTime * 60; 
        const cameraAlpha = scene.activeCamera.alpha;
        
        // --- LOGICA DE MISIÓN ---
        // --- MECÁNICA DE RECOGIDA / ENTREGA (Interacción por tecla) ---
        const hudCounter = document.getElementById('hudCounter');
        const actionPrompt = document.getElementById('actionPrompt');

        // Actualizar HUD
        if (hudCounter) hudCounter.innerText = `Tesoros: ${chestsCollected}/${TOTAL_CHESTS}`;

        // Si no estamos llevando nada, buscar cofre cercano para recoger
        let nearestChest = null;
        if (!carriedChest) {
            for (let i = 0; i < treasureChests.length; i++) {
                const chest = treasureChests[i];
                if (!chest || !chest.isEnabled() || !chest.isCollectible) continue;
                const distanceToChest = BABYLON.Vector3.Distance(playerContainer.position, chest.position);
                if (distanceToChest < pickupRange) {
                    nearestChest = chest;
                    break;
                }
            }

            if (nearestChest) {
                if (actionPrompt) { actionPrompt.style.display = 'block'; actionPrompt.innerText = 'Presiona E / Espacio para recoger'; }
                if (actionPressed) {
                    // Recoger con tween desde posición mundial hasta sobre la cabeza (suavizado)
                    // pickup sound removed per user request
                    try { if (highlightLayer) highlightLayer.addMesh(nearestChest, BABYLON.Color3.FromHexString('#fff176')); } catch(e){}
                    try { spawnPickupEffect(playerContainer.getAbsolutePosition().add(new BABYLON.Vector3(0,1.2,0)), scene); } catch(e){}
                    const headY = playerHeight + 1.3;
                    const startWorld = nearestChest.getAbsolutePosition().clone();
                    const targetWorld = playerContainer.getAbsolutePosition().add(new BABYLON.Vector3(0, headY, 0));
                    let t = 0;
                    const animCallback = () => {
                        t += 0.12;
                        const lerp = BABYLON.Vector3.Lerp(startWorld, targetWorld, Math.min(t, 1));
                        try { nearestChest.setAbsolutePosition(lerp); } catch(e) { nearestChest.position = lerp; }
                        if (t >= 1) {
                            try { scene.onBeforeRenderObservable.removeCallback(animCallback); } catch(e){}
                            // parenting final y ajuste local
                            try { nearestChest.setParent(playerContainer); } catch(e){}
                            try { nearestChest.position = new BABYLON.Vector3(0, headY, 0); } catch(e){}
                            nearestChest.rotation = new BABYLON.Vector3(0, 0, 0);
                            nearestChest.checkCollisions = false;
                            nearestChest.isCollectible = false;
                            nearestChest.isCarried = true;
                            carriedChest = nearestChest;
                            if (actionPrompt) actionPrompt.style.display = 'none';
                            actionPressed = false;
                            // Mensaje urgente al recoger
                                showTemporaryMessage('¡RÁPIDO, DÉJALO EN EL BARCO!', 2800);
                        }
                    };
                    scene.onBeforeRenderObservable.add(animCallback);
                }
            } else {
                if (actionPrompt) actionPrompt.style.display = 'none';
            }
        } else {
            // Estamos llevando algo: permitir entregar en el barco
            const distanceToShip = BABYLON.Vector3.Distance(playerContainer.position, shipZone.position);
            if (distanceToShip < deliverRange) {
                if (actionPrompt) { actionPrompt.style.display = 'block'; actionPrompt.innerText = 'Presiona E / Espacio para entregar en el barco'; }
                if (actionPressed) {
                    // Soltar en el barco: colocar en zona del barco con pequeño offset por cantidad
                    carriedChest.setParent(null);
                    const dropOffset = new BABYLON.Vector3((chestsCollected % 3) - 1, 0.3 + Math.floor(chestsCollected / 3) * 0.3, 0);
                    const dropPos = shipZone.position.add(dropOffset);
                    carriedChest.position = dropPos;
                    carriedChest.checkCollisions = false;
                    carriedChest.metadata = carriedChest.metadata || {};
                    carriedChest.metadata.delivered = true;
                    // Al entregar, ya no está siendo llevado
                    carriedChest.isCarried = false;
                    // Mantenemos el cofre visible en el barco pero lo desactivamos como coleccionable
                    carriedChest.isCollectible = false;
                    chestsCollected++;
                    // efecto visual al entregar
                    try { if (highlightLayer) { highlightLayer.addMesh(carriedChest, BABYLON.Color3.FromHexString('#80d8ff')); } } catch(e){}
                    try { spawnDeliverEffect(dropPos, scene); } catch(e){}
                    // deliver SFX intentionally not used (ambient only)
                    carriedChest = null;
                    if (hudCounter) hudCounter.innerText = `Tesoros: ${chestsCollected}/${TOTAL_CHESTS}`;
                    if (actionPrompt) actionPrompt.style.display = 'none';
                    actionPressed = false;

                    // deliver sound removed per user request
                    // Mensaje de entrega
                    showTemporaryMessage('¡ENTREGADO! Lleva el siguiente al barco', 1800);

                    updateMissionText();

                    if (chestsCollected === TOTAL_CHESTS) {
                        // Misión completada
                        isGameActive = false;
                        if(gameMessage) {
                            gameMessage.innerText = "¡MISIÓN CUMPLIDA! Eres rico.";
                            gameMessage.style.color = "#00ff00"; 
                            gameMessage.style.fontSize = "40px";
                            gameMessage.style.display = 'block';
                        }
                        if(startScreen) {
                            startScreen.style.display = "flex";
                            const h1 = startScreen.querySelector("h1");
                            const p = startScreen.querySelector("p");
                            if(h1) h1.innerText = "¡VICTORIA!";
                            if(p) p.style.display = "none";
                            if(playButton) playButton.innerText = "Jugar de Nuevo";
                        }
                    }
                }
            } else {
                if (actionPrompt) actionPrompt.style.display = 'none';
            }
        }

        

        // --- MOVIMIENTO ---
        // Map WASD to camera-relative directions: W forward, S back, A left, D right
        const forwardInput = (keys['w'] ? 1 : 0) + (keys['s'] ? -1 : 0);
        const rightInput = (keys['d'] ? 1 : 0) + (keys['a'] ? -1 : 0);

        if (forwardInput !== 0 || rightInput !== 0) {
            // Compute camera-forward vector on XZ plane
            const cam = scene.activeCamera;
            let camForward = new BABYLON.Vector3(0, 0, 1);
            if (cam) {
                camForward = playerContainer.position.subtract(cam.position);
                camForward.y = 0;
                if (camForward.lengthSquared() === 0) camForward = new BABYLON.Vector3(0, 0, 1);
                camForward.normalize();
            }
            // Right vector = cross(up, forward)
            const camRight = BABYLON.Vector3.Cross(new BABYLON.Vector3(0, 1, 0), camForward).normalize();

            // Desired movement in world space
            const moveDir = camForward.scale(forwardInput).add(camRight.scale(rightInput));
            if (moveDir.length() > 0) moveDir.normalize();

            const moveVec = moveDir.scale(actualSpeed);
            playerContainer.moveWithCollisions(new BABYLON.Vector3(moveVec.x, 0, moveVec.z));

            // Rotate player to face movement direction smoothly
            const targetAngle = Math.atan2(moveDir.x, moveDir.z);
            let currentRotationY = playerContainer.rotation.y % (2 * Math.PI);
            if (currentRotationY < 0) currentRotationY += 2 * Math.PI;
            let angleDifference = targetAngle - currentRotationY;
            if (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;
            else if (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;
            const smoothedAngle = BABYLON.Scalar.Lerp(currentRotationY, currentRotationY + angleDifference, turnSpeed);
            playerContainer.rotation.y = smoothedAngle;

            // Animations: forward/back/side mapping (use explicit start with speed ratio)
            try {
                if (forwardInput > 0) {
                    // forward
                    if (backAnim && backAnim.isPlaying) backAnim.stop();
                    if (walkAnim) { try { walkAnim.stop(); walkAnim.start(true, 1.0); } catch(e) { if (walkAnim && !walkAnim.isPlaying) walkAnim.start(true); } }
                } else if (forwardInput < 0) {
                    // backward
                    if (walkAnim && walkAnim.isPlaying) walkAnim.stop();
                    if (backAnim) {
                        try { if (!backAnim.isPlaying) backAnim.start(true, 1.0); } catch(e) { if (!backAnim.isPlaying) backAnim.start(true); }
                    } else if (walkAnim) {
                        // fallback: attempt to play walk animation in reverse
                        try { walkAnim.stop(); walkAnim.start(true, -1.0); } catch(e) { try { walkAnim.start(true); } catch(e2){} }
                    }
                } else {
                    // sideways - play forward walk
                    if (backAnim && backAnim.isPlaying) backAnim.stop();
                    if (walkAnim) { try { walkAnim.stop(); walkAnim.start(true, 1.0); } catch(e) { if (!walkAnim.isPlaying) walkAnim.start(true); } }
                }
                if (idleAnim && idleAnim.isPlaying) idleAnim.stop();
            } catch (e) { console.warn('Animation control error', e); }
        } else {
            // No input - go idle
            try {
                if (walkAnim && walkAnim.isPlaying) walkAnim.stop();
                if (backAnim && backAnim.isPlaying) backAnim.stop();
                if (idleAnim && !idleAnim.isPlaying) idleAnim.start(true);
            } catch (e) {}
        }
        
        // Raycast (Suelo) - aumentar alcance y origen para evitar 'hundimiento' al moverse
        const rayStart = playerContainer.position.clone();
        rayStart.y += 2.0; 
        const ray = new BABYLON.Ray(rayStart, new BABYLON.Vector3(0, -1, 0), 5.0);
        const predicate = function (mesh) {
            return mesh.checkCollisions && mesh !== playerContainer && !mesh.isDescendantOf(playerContainer);
        };
        const hit = scene.pickWithRay(ray, predicate);

        if (hit.pickedMesh) {
            const targetY = hit.pickedPoint.y + playerHeight;
            playerContainer.position.y = BABYLON.Scalar.Lerp(playerContainer.position.y, targetY, 0.3);
        } else {
            playerContainer.position.y += gravitySpeed * deltaTime;
        }
        
        scene.render();
    });

    window.addEventListener("resize", function () { engine.resize(); });