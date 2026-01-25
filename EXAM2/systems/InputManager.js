class InputManager {
    static instance = null;

    constructor(canvas, scene) {
        if (InputManager.instance) {
            return InputManager.instance;
        }
        this.canvas = canvas;
        this.scene = scene;
        this.onShoot = null;
        InputManager.instance = this;
    }

    setupPointerLock() {
        if (!document.pointerLockElement) {
            this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
            this.canvas.requestPointerLock();
        }
    }

    registerShootHandler(callback) {
        this.onShoot = callback;
        this.scene.onPointerDown = () => {
            if (this.onShoot) {
                this.onShoot();
            }
        };
    }

    static getInstance(canvas, scene) {
        if (!InputManager.instance) {
            new InputManager(canvas, scene);
        }
        return InputManager.instance;
    }
}
