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
        this.backgroundMusic = null;
        this.bulletsLeft = 5;
        this.gunSound = null;
        this.gameOver = false;
        this.restartScreen = document.getElementById("restart-screen");
        this.restartButton = document.getElementById("restart-button");
        
        this.setupInput();
        this.setupRenderLoop();
        this.uiManager.startFaceAnimation();
        this.setupBackgroundMusic();
        this.setupRestartUI();
    }

    setupInput() {
        this.inputManager.registerShootHandler(() => this.handleShoot());
    }

    setupRestartUI() {
        if (this.restartButton) {
            this.restartButton.addEventListener("click", () => {
                window.location.reload();
            });
        }
    }

    handleShoot() {
        if (this.isShooting) return;
        if (this.bulletsLeft <= 0) return;
        
        this.isShooting = true;
        this.gameStateManager.setState(GameState.SHOOTING);
        this.inputManager.setupPointerLock();

        this.uiManager.setWeaponFrame("33.33% 0%");
        this.uiManager.setFace("grin");

        this.bulletsLeft--;
        this.uiManager.updateBulletCount(this.bulletsLeft);
        
        // Reproducir sonido de disparo
        if (this.gunSound) {
            this.gunSound.currentTime = 0;
            this.gunSound.play().catch(err => console.log("Error playing gun sound:", err));
        }

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
            if (this.gameOver) {
                return;
            }
            const cameraPos = this.camera.position;
            this.enemyManager.updateEnemies(cameraPos);

            const enemies = this.enemyManager.getEnemies();
            for (const enemy of enemies) {
                if (enemy) {
                    const distance = BABYLON.Vector3.Distance(enemy.position, cameraPos);
                    if (distance < 4.5) {
                        this.triggerGameOver();
                        break;
                    }
                }
            }
        });
    }

    triggerGameOver() {
        this.gameOver = true;
        this.gameStateManager.setState(GameState.IDLE);
        if (this.restartScreen) {
            this.restartScreen.style.display = "flex";
        }
        this.uiManager.setFace("angry");
        this.uiManager.stopFaceAnimation();
        document.exitPointerLock?.();
    }

    setupBackgroundMusic() {
        // Crear elemento de audio HTML5
        this.backgroundMusic = new Audio();
        this.backgroundMusic.src = "mp3/bgm1.mp3";
        this.backgroundMusic.volume = 0.15;
        this.backgroundMusic.loop = true;
        
        // Log para debugging
        this.backgroundMusic.addEventListener("canplay", () => {
            console.log("✓ Música cargada y lista");
        });
        
        this.backgroundMusic.addEventListener("error", (e) => {
            console.error("✗ Error al cargar música:", e);
        });
        
        this.backgroundMusic.addEventListener("play", () => {
            console.log("✓ Música iniciada");
        });

        // Crear sonido de disparo
        this.gunSound = new Audio();
        this.gunSound.src = "mp3/gupP.mp3";
        this.gunSound.volume = 1.0;
    }

    start() {
        // Reproducir música de fondo
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.play().catch(error => {
                    console.error("Error al reproducir:", error);
                });
                console.log("Intentando reproducir música...");
            } catch (error) {
                console.error("Error:", error);
            }
        }
        
        this.enemyManager.spawnDefaultEnemies();
    }
}
