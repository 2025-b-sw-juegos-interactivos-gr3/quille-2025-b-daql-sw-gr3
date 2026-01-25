class ParticleManager {
    static instance = null;

    constructor(scene) {
        if (ParticleManager.instance) {
            return ParticleManager.instance;
        }
        this.scene = scene;
        this.bloodTexture = null;
        ParticleManager.instance = this;
    }

    createBloodTexture() {
        this.bloodTexture = new BABYLON.DynamicTexture("bloodTex", 64, this.scene, true);
        const ctx = this.bloodTexture.getContext();
        ctx.fillStyle = "#aa0000"; 
        ctx.fillRect(0, 0, 64, 64);
        this.bloodTexture.update();
    }

    createBlood(position) {
        const ps = new BABYLON.ParticleSystem("blood", 100, this.scene);
        ps.particleTexture = this.bloodTexture;
        ps.emitter = position;
        ps.minSize = 0.2;
        ps.maxSize = 0.6;
        ps.emitRate = 1000;
        ps.createSphereEmitter(1);
        ps.minEmitPower = 3;
        ps.maxEmitPower = 6;
        ps.targetStopDuration = 0.1;
        ps.start();
    }

    static getInstance(scene) {
        if (!ParticleManager.instance) {
            new ParticleManager(scene);
        }
        return ParticleManager.instance;
    }
}
