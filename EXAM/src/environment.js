import { CONFIG } from './config.js';
import { State } from './state.js';

export async function createScene(engine, canvas) {
    const scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;

    // Luz
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    // 1. CARGA DEL MAPA
    await BABYLON.SceneLoader.AppendAsync(CONFIG.assetsPath, CONFIG.mapFile, scene);
    
    scene.meshes.forEach(mesh => { 
        mesh.checkCollisions = true; 
        mesh.freezeWorldMatrix();
    });

    // 2. PREPARAR JUGADOR
    const playerCollider = BABYLON.MeshBuilder.CreateCylinder("playerCol", {
        height: 1.0, 
        diameter: 0.5 
    }, scene);
    
    playerCollider.position = new BABYLON.Vector3(-11.575, -0.597, -0.198);
    playerCollider.isVisible = false;
    playerCollider.checkCollisions = true;
    
    playerCollider.ellipsoid = new BABYLON.Vector3(0.25, 0.5, 0.25); 
    playerCollider.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0); 
    
    State.playerMesh = playerCollider;

    // 3. MODELO VISUAL (Luffy)
    BABYLON.SceneLoader.ImportMesh("", CONFIG.assetsPath, CONFIG.playerFile, scene, (meshes, ps, sk, groups) => {
        const root = meshes[0];
        root.parent = playerCollider; 
        
        root.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5); 
        root.position = new BABYLON.Vector3(0, -0.5, 0); 

        root.rotationQuaternion = null; 
        root.rotation.x = 0;        
        root.rotation.y = 0; // Sin rotación extra
        
        State.visualMesh = root;

        if (groups && groups.length > 0) {
            State.animations.walk = groups.find(g => /walk|run|move/i.test(g.name));
            State.animations.idle = groups.find(g => /idle|stand|wait/i.test(g.name)) || groups[0];
            groups.forEach(g => g.stop());
            if (State.animations.idle) State.animations.idle.start(true);
        }
    });

    return scene;
}

export function initializeGameAssets(scene) {
    // --- 💡 ARREGLO DE FANTASMAS (LIMPIEZA) ---
    // Borramos los cofres anteriores si existen, para no crear duplicados
    if (State.chests && State.chests.length > 0) {
        State.chests.forEach(chest => {
            // .dispose() elimina el objeto 3D del mundo
            if (chest) chest.dispose();
        });
    }
    
    // También limpiamos si llevamos algo en la mano al reiniciar
    if (State.carriedChest) {
        State.carriedChest.dispose();
    }
    
    if (State.shipZone) {
        State.shipZone.dispose();
    }

    // Ahora sí, reseteamos la memoria (array vacío)
    State.reset();
// --- 💡 NUEVO MATERIAL VISUAL PARA EL COFRE ---
    // Creamos el material una sola vez antes del bucle
    const chestMat = new BABYLON.StandardMaterial("chestMat", scene);
    // Usamos una textura de caja de madera de los ejemplos de Babylon
    chestMat.diffuseTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/crate.png", scene);
    // Hacemos que no brille tanto (madera mate)
    chestMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);


    // --- CREACIÓN ---
    // Crear Cofres
    CONFIG.chestPositions.forEach(pos => {
        const chest = BABYLON.MeshBuilder.CreateBox("Chest", {size: CONFIG.chestSize}, scene);
        chest.position = pos;
        chest.material = new BABYLON.StandardMaterial("chestMat", scene);
        chest.material.diffuseColor = new BABYLON.Color3(1, 0.84, 0);
        chest.checkCollisions = true;
        chest.metadata = { isCollectible: true };
        State.chests.push(chest);
    });

    // Zona Barco
    const shipZone = BABYLON.MeshBuilder.CreateBox("shipZone", {size: 3}, scene);
    shipZone.position = CONFIG.shipPosition;
    shipZone.isVisible = false;
    State.shipZone = shipZone;
}