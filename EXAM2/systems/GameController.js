class GameController {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.gameStateManager = GameStateManager.getInstance();
        this.uiManager = UIManager.getInstance();
        this.enemyManager = EnemyManager.getInstance(scene);
        this.particleManager = ParticleManager.getInstance(scene);
        this.inputManager = InputManager.getInstance(scene.getEngine().getRenderingCanvas(), scene);
        
        this.enemiesLeft = 3;
        this.isShooting = false;
        
        this.setupInput();
        this.setupRenderLoop();
        this.uiManager.startFaceAnimation();
    }

    setupInput() {
        this.inputManager.registerShootHandler(() => this.handleShoot());
    }

    handleShoot() {
        if (this.isShooting) return;
        if (this.gameStateManager.getState() === GameState.VICTORY) return;
        
        this.isShooting = true;
        this.gameStateManager.setState(GameState.SHOOTING);
        this.inputManager.setupPointerLock();

        this.uiManager.setWeaponFrame("33.33% 0%");
        this.uiManager.setFace("grin");

        setTimeout(() => { this.uiManager.setWeaponFrame("66.66% 0%"); }, 100); 
        setTimeout(() => { this.uiManager.setWeaponFrame("100% 0%"); }, 250); 
        
        setTimeout(() => { 
            this.uiManager.setWeaponFrame("0% 0%"); 
            this.isShooting = false;
            if (this.enemiesLeft > 0) {
                this.gameStateManager.setState(GameState.IDLE);
                this.uiManager.setFace("idle");
            }
        }, 400);

        const ray = this.camera.getForwardRay();
        const hit = this.scene.pickSpriteWithRay(ray);

        if (hit && hit.pickedSprite) {
            hit.pickedSprite.color = new BABYLON.Color4(1, 0, 0, 1); 
            this.particleManager.createBlood(hit.pickedSprite.position); 

            setTimeout(() => {
                this.enemyManager.removeEnemy(hit.pickedSprite);
                this.enemiesLeft--;
                
                if (this.enemiesLeft <= 0) {
                    this.gameStateManager.setState(GameState.VICTORY);
                    this.uiManager.setFace("grin");
                    this.uiManager.stopFaceAnimation();
                }
            }, 150);
        }
    }

    setupRenderLoop() {
        this.scene.registerBeforeRender(() => {
            const cameraPos = this.camera.position;
            this.enemyManager.updateEnemies(cameraPos);
        });
    }

    start() {
        this.enemyManager.spawnDefaultEnemies();
    }
}
