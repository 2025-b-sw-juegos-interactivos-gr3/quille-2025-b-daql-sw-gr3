class CameraManager {
    static instance = null;

    constructor(scene, canvas) {
        if (CameraManager.instance) {
            return CameraManager.instance;
        }
        this.scene = scene;
        this.canvas = canvas;
        this.camera = null;
        CameraManager.instance = this;
    }

    createCamera() {
        this.camera = new BABYLON.UniversalCamera("HellCam", new BABYLON.Vector3(0, 3, -25), this.scene);
        this.camera.setTarget(new BABYLON.Vector3(0, 3, 0));
        this.camera.attachControl(this.canvas, true);
        this.camera.applyGravity = true;
        this.camera.checkCollisions = true;
        this.camera.ellipsoid = new BABYLON.Vector3(1, 1.5, 1);
        this.camera.speed = 0.65; 
        this.camera.inertia = 0; 
        this.camera.keysUp = [87];
        this.camera.keysDown = [83];
        this.camera.keysLeft = [65];
        this.camera.keysRight = [68];

        return this.camera;
    }

    getCamera() {
        return this.camera;
    }

    static getInstance(scene, canvas) {
        if (!CameraManager.instance) {
            new CameraManager(scene, canvas);
        }
        return CameraManager.instance;
    }
}
