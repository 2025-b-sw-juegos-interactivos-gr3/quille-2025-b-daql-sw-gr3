export function spawnPickupEffect(position, scene) {
    try {
        // Sistema de partículas para el efecto de recoger (capacidad 200)
        const ps = new BABYLON.ParticleSystem('pickupPS', 200, scene);
        
        // Textura de la partícula (imagen del destello)
        ps.particleTexture = new BABYLON.Texture('https://www.babylonjs.com/assets/Flare.png', scene);
        
        // Posición de origen (donde estaba el cofre)
        ps.emitter = position.clone();
        
        // Área de emisión pequeña para que salgan del centro
        ps.minEmitBox = new BABYLON.Vector3(-0.2, 0, -0.2);
        ps.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.2);
        
        // Colores amarillo y naranja para simular oro
        ps.color1 = new BABYLON.Color4(1, 0.9, 0.2, 1);
        ps.color2 = new BABYLON.Color4(1, 0.6, 0, 1);
        
        // Tamaño y duración de las partículas
        ps.minSize = 0.05; ps.maxSize = 0.18;
        ps.minLifeTime = 0.3; ps.maxLifeTime = 0.7;
        
        // Velocidad y gravedad (caen hacia abajo)
        ps.emitRate = 150;
        ps.gravity = new BABYLON.Vector3(0, -1, 0);
        
        ps.start();
        
        // Detener y eliminar el sistema después de 0.8s para liberar memoria
        setTimeout(() => { ps.stop(); ps.dispose(); }, 800);
    } catch (e) {}
}

export function spawnDeliverEffect(position, scene) {
    try {
        // Sistema de partículas para la entrega (capacidad 300)
        const ps = new BABYLON.ParticleSystem('deliverPS', 300, scene);
        
        // Textura del destello
        ps.particleTexture = new BABYLON.Texture('https://www.babylonjs.com/assets/Flare.png', scene);
        
        // Posición de origen
        ps.emitter = position.clone();
        
        // Área de emisión un poco más grande
        ps.minEmitBox = new BABYLON.Vector3(-0.4, 0, -0.4);
        ps.maxEmitBox = new BABYLON.Vector3(0.4, 0.4, 0.4);
        
        // Colores verdes para indicar éxito
        ps.color1 = new BABYLON.Color4(0.2, 1, 0.6, 1);
        ps.color2 = new BABYLON.Color4(0.1, 0.8, 0.4, 1);
        
        ps.emitRate = 200;
        ps.gravity = new BABYLON.Vector3(0, -0.6, 0);
        
        ps.start();
        
        // Eliminar sistema después de 1 segundo
        setTimeout(() => { ps.stop(); ps.dispose(); }, 1000);
    } catch (e) {}
}