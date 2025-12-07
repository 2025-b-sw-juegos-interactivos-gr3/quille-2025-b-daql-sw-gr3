export function spawnPickupEffect(position, scene) {
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
        ps.start();
        setTimeout(() => { ps.stop(); ps.dispose(); }, 800);
    } catch (e) {}
}

export function spawnDeliverEffect(position, scene) {
    try {
        const ps = new BABYLON.ParticleSystem('deliverPS', 300, scene);
        ps.particleTexture = new BABYLON.Texture('https://www.babylonjs.com/assets/Flare.png', scene);
        ps.emitter = position.clone();
        ps.minEmitBox = new BABYLON.Vector3(-0.4, 0, -0.4);
        ps.maxEmitBox = new BABYLON.Vector3(0.4, 0.4, 0.4);
        ps.color1 = new BABYLON.Color4(0.2, 1, 0.6, 1);
        ps.color2 = new BABYLON.Color4(0.1, 0.8, 0.4, 1);
        ps.emitRate = 200;
        ps.gravity = new BABYLON.Vector3(0, -0.6, 0);
        ps.start();
        setTimeout(() => { ps.stop(); ps.dispose(); }, 1000);
    } catch (e) {}
}