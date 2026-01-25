class LightingManager {
    static instance = null;

    constructor(scene) {
        if (LightingManager.instance) {
            return LightingManager.instance;
        }
        this.scene = scene;
        LightingManager.instance = this;
    }

    createLighting() {
        const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        ambientLight.diffuse = new BABYLON.Color3(0.9, 0.9, 0.9);
        ambientLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        ambientLight.intensity = 0.9;

        return ambientLight;
    }

    static getInstance(scene) {
        if (!LightingManager.instance) {
            new LightingManager(scene);
        }
        return LightingManager.instance;
    }
}
