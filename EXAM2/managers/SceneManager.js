class SceneManager {
    static instance = null;

    constructor(engine, canvas) {
        if (SceneManager.instance) {
            return SceneManager.instance;
        }
        this.engine = engine;
        this.canvas = canvas;
        this.scene = null;
        SceneManager.instance = this;
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
        this.scene.collisionsEnabled = true;
        
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.05; 
        this.scene.fogColor = new BABYLON.Color3(0.02, 0.01, 0.01); 
        this.scene.clearColor = new BABYLON.Color3(0.02, 0.01, 0.01);

        return this.scene;
    }

    getScene() {
        return this.scene;
    }

    static getInstance(engine, canvas) {
        if (!SceneManager.instance) {
            new SceneManager(engine, canvas);
        }
        return SceneManager.instance;
    }
}
