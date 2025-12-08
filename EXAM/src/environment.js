import { CONFIG } from './config.js';
import { State } from './state.js';

export async function createScene(engine, canvas) {
    const scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;

    // Configuración de luz ambiental
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    // Cargar el mapa del entorno desde el archivo
    await BABYLON.SceneLoader.AppendAsync(CONFIG.assetsPath, CONFIG.mapFile, scene);
    
    // Activar colisiones para todos los objetos del mapa y congelar su matriz para optimizar
    scene.meshes.forEach(mesh => { 
        mesh.checkCollisions = true; 
        mesh.freezeWorldMatrix();
    });

    // Crear el colisionador físico del jugador (cilindro invisible)
    const playerCollider = BABYLON.MeshBuilder.CreateCylinder("playerCol", {
        height: 1.0, 
        diameter: 0.5 
    }, scene);
    
    playerCollider.position = new BABYLON.Vector3(-11.575, -0.597, -0.198);
    playerCollider.isVisible = false;
    playerCollider.checkCollisions = true;
    
    // Configurar el elipsoide para evitar que la cámara atraviese paredes
    playerCollider.ellipsoid = new BABYLON.Vector3(0.25, 0.5, 0.25); 
    playerCollider.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0); 
    
    State.playerMesh = playerCollider;

    // Cargar y configurar el modelo visual del personaje (Luffy)
    BABYLON.SceneLoader.ImportMesh("", CONFIG.assetsPath, CONFIG.playerFile, scene, (meshes, ps, sk, groups) => {
        const root = meshes[0];
        root.parent = playerCollider; // Unir el modelo al colisionador físico
        
        root.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5); 
        root.position = new BABYLON.Vector3(0, -0.5, 0); 

        // Limpiar rotaciones previas
        root.rotationQuaternion = null; 
        root.rotation.x = 0;        
        root.rotation.y = 0; 
        
        State.visualMesh = root;

        // Configurar animaciones si existen en el modelo
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
    // Limpiar objetos anteriores (cofres y zonas) para evitar duplicados al reiniciar
    if (State.chests && State.chests.length > 0) {
        State.chests.forEach(chest => {
            if (chest) chest.dispose();
        });
    }
    
    // Eliminar el cofre que el jugador tenga en las manos
    if (State.carriedChest) {
        State.carriedChest.dispose();
    }
    
    if (State.shipZone) {
        State.shipZone.dispose();
    }

    // Reiniciar la memoria del estado
    State.reset();

    // Crear el material visual para los cofres (madera)
    const chestMat = new BABYLON.StandardMaterial("chestMat", scene);
    chestMat.diffuseTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/crate.png", scene);
    chestMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Reducir brillo

    // Generar los cofres en las posiciones definidas en la configuración
    CONFIG.chestPositions.forEach(pos => {
        const chest = BABYLON.MeshBuilder.CreateBox("Chest", {size: CONFIG.chestSize}, scene);
        chest.position = pos;
        
        // Asignar el material de madera creado arriba
        chest.material = chestMat; 
        
        chest.checkCollisions = true;
        chest.metadata = { isCollectible: true }; // Marcar como recolectable
        State.chests.push(chest);
    });

    // Crear la zona de entrega en el barco (invisible)
    const shipZone = BABYLON.MeshBuilder.CreateBox("shipZone", {size: 3}, scene);
    shipZone.position = CONFIG.shipPosition;
    shipZone.isVisible = false;
    State.shipZone = shipZone;
}