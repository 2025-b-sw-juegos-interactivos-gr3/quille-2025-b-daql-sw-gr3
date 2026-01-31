/**
 * CLASE: GameController
 * 
 * Propósito: Coordinador principal del juego que conecta todos los sistemas:
 * - Manejo de disparos
 * - Detección de colisiones (enemigos)
 * - Cambios de estado del juego
 * - Actualización de UI
 * - Reproducción de audio
 * - Loop de renderizado
 * 
 * Este es el "cerebro" del juego que une todos los managers especializados
 */
class GameController {
    /**
     * Constructor: Inicializa todos los sistemas del juego
     * 
     * @param {BABYLON.Scene} scene - La escena 3D de Babylon.js
     * @param {BABYLON.Camera} camera - La cámara del jugador
     */
    constructor(scene, camera) {
        // Guardar referencias a la escena y cámara
        this.scene = scene;
        this.camera = camera;
        
        // Obtener instancias de todos los managers (Singleton)
        this.gameStateManager = GameStateManager.getInstance();  // Gestiona estado del juego
        this.uiManager = UIManager.getInstance();                 // Gestiona interfaz visual
        this.enemyManager = EnemyManager.getInstance(scene);      // Gestiona enemigos
        this.particleManager = ParticleManager.getInstance(scene);// Gestiona efectos de partículas
        this.inputManager = InputManager.getInstance(scene.getEngine().getRenderingCanvas(), scene); // Gestiona input del usuario
        
        // ESTADO DEL JUEGO - Variables de control
        this.enemiesLeft = 3;           // Cuántos enemigos quedan por derrotar
        this.isShooting = false;        // Flag para evitar disparos simultáneos
        this.backgroundMusic = null;    // Referencia a la música de fondo
        this.bulletsLeft = 5;           // Munición disponible
        this.gunSound = null;           // Sonido del disparo
        this.gameOver = false;          // ¿Ha terminado el juego?
        
        // Elementos del DOM
        this.restartScreen = document.getElementById("restart-screen");  // Pantalla de game over
        this.restartButton = document.getElementById("restart-button");  // Botón para reiniciar
        
        // Configurar todos los sistemas
        this.setupInput();              // Registrar eventos de input
        this.setupRenderLoop();         // Iniciar el loop de render
        this.uiManager.startFaceAnimation(); // Animar la cara del jugador
        this.setupBackgroundMusic();    // Configurar audio
        this.setupRestartUI();          // Configurar botón de reinicio
    }

    /**
     * Configura el sistema de entrada del usuario
     * Registra que cuando el usuario haga click, se ejecute handleShoot()
     */
    setupInput() {
        this.inputManager.registerShootHandler(() => this.handleShoot());
    }

    /**
     * Configura el botón de reinicio
     * Cuando el usuario hace click en "Restart", recarga la página
     */
    setupRestartUI() {
        if (this.restartButton) {
            this.restartButton.addEventListener("click", () => {
                // Recargar la página para volver a empezar
                window.location.reload();
            });
        }
    }

    /**
     * MÉTODO PRINCIPAL: Ejecuta toda la lógica del disparo
     * 
     * Incluye:
     * 1. Validaciones (¿puede disparar?)
     * 2. Animación del arma (sprites en 3 frames)
     * 3. Raycast para detectar impactos
     * 4. Efectos visuales (sangre, color rojo en enemigo)
     * 5. Sonido de disparo
     * 6. Verificación de victoria
     */
    handleShoot() {
        // ========== VALIDACIONES ==========
        // No permitir disparos simultáneos
        if (this.isShooting) return;
        // No permitir disparar sin munición
        if (this.bulletsLeft <= 0) return;
        
        // ========== INICIO DEL DISPARO ==========
        this.isShooting = true;                                    // Bloquear otros disparos
        this.gameStateManager.setState(GameState.SHOOTING);        // Cambiar estado a "SHOOTING"
        this.inputManager.setupPointerLock();                      // Atrapar el cursor en el canvas

        // ========== ANIMACIÓN DEL ARMA ==========
        // El arma tiene 3 frames en una imagen sprite (0%, 33.33%, 66.66%, 100%)
        // Frame 1: Primera posición (33.33% - inicio del disparo)
        this.uiManager.setWeaponFrame("33.33% 0%");
        // Cambiar expresión del jugador a "sonrisa"
        this.uiManager.setFace("grin");

        // ========== CONSUMO DE MUNICIÓN Y AUDIO ==========
        this.bulletsLeft--;                                        // Restar una bala
        this.uiManager.updateBulletCount(this.bulletsLeft);        // Actualizar UI de munición
        
        // Reproducir sonido de disparo
        if (this.gunSound) {
            this.gunSound.currentTime = 0;  // Reiniciar a inicio (importante si dispara rápido)
            this.gunSound.play().catch(err => console.log("Error playing gun sound:", err));
        }

        // ========== ANIMACIÓN CONTINUADA DEL ARMA ==========
        // Frame 2: Segunda posición (disparo en progreso) - a los 100ms
        setTimeout(() => { this.uiManager.setWeaponFrame("66.66% 0%"); }, 100); 
        // Frame 3: Tercera posición (final del disparo) - a los 250ms
        setTimeout(() => { this.uiManager.setWeaponFrame("100% 0%"); }, 250);
        
        // ========== FINALIZAR DISPARO ==========
        // Después de 400ms, resetear la animación y permitir disparos nuevamente
        setTimeout(() => { 
            this.uiManager.setWeaponFrame("0% 0%");  // Volver a frame inicial
            this.isShooting = false;                  // Permitir próximo disparo
            if (this.enemiesLeft > 0) {
                this.gameStateManager.setState(GameState.IDLE);  // Volver a estado IDLE
                this.uiManager.setFace("idle");                   // Expresión neutral
            }
        }, 400);

        // ========== DETECCIÓN DE IMPACTO (RAYCAST) ==========
        // Crear un rayo desde la cámara hacia adelante
        const ray = this.camera.getForwardRay();
        // Verificar si el rayo colisiona con algún sprite (enemigo)
        const hit = this.scene.pickSpriteWithRay(ray);

        // Si hay un impacto con un sprite
        if (hit && hit.pickedSprite) {
            // ========== EFECTOS VISUALES DE IMPACTO ==========
            // Pintar el enemigo de rojo para indicar que fue golpeado
            hit.pickedSprite.color = new BABYLON.Color4(1, 0, 0, 1);  // Color rojo (R,G,B,A)
            // Crear efecto de sangre en la posición del enemigo
            this.particleManager.createBlood(hit.pickedSprite.position); 

            // Después de 150ms (tiempo para ver el efecto visual), eliminar el enemigo
            setTimeout(() => {
                this.enemyManager.removeEnemy(hit.pickedSprite);  // Remover del juego
                this.enemiesLeft--;                               // Decrementar contador
                
                // ========== VERIFICACIÓN DE VICTORIA ==========
                if (this.enemiesLeft <= 0) {
                    // ¡Ganó el juego!
                    this.gameStateManager.setState(GameState.VICTORY);
                    this.uiManager.setFace("grin");             // Sonrisa de victoria
                    this.uiManager.stopFaceAnimation();         // Detener animación de cara
                }
            }, 150);
        }
    }

    /**
     * Configura el loop de renderizado que se ejecuta cada frame
     * 
     * Responsabilidades:
     * 1. Actualizar posiciones de enemigos (IA)
     * 2. Detectar colisión: enemigos muy cerca del jugador
     * 3. Trigger game over si es necesario
     */
    setupRenderLoop() {
        // registerBeforeRender: Se ejecuta ANTES de renderizar cada frame
        this.scene.registerBeforeRender(() => {
            // Si ya perdió, no hacer nada
            if (this.gameOver) {
                return;
            }
            
            // ========== ACTUALIZAR IA DE ENEMIGOS ==========
            const cameraPos = this.camera.position;
            // Hacer que los enemigos se muevan hacia el jugador
            this.enemyManager.updateEnemies(cameraPos);

            // ========== DETECCIÓN DE COLISIÓN ==========
            const enemies = this.enemyManager.getEnemies();
            
            // Para cada enemigo, verificar si está muy cerca
            for (const enemy of enemies) {
                if (enemy) {
                    // Calcular distancia entre enemigo y jugador
                    const distance = BABYLON.Vector3.Distance(enemy.position, cameraPos);
                    
                    // Si el enemigo está a menos de 4.5 unidades, ¡perdió!
                    // (Los enemigos lo alcanzaron)
                    if (distance < 4.5) {
                        this.triggerGameOver();
                        break;  // Salir del loop
                    }
                }
            }
        });
    }

    /**
     * Se ejecuta cuando el jugador PIERDE (enemigo lo alcanza)
     * 
     * Acciones:
     * 1. Marcar como fin del juego
     * 2. Mostrar pantalla de game over
     * 3. Cambiar expresión a "enojado"
     * 4. Liberar el cursor del pointer lock
     */
    triggerGameOver() {
        this.gameOver = true;                                      // Bloquear loop de renderizado
        this.gameStateManager.setState(GameState.IDLE);            // Cambiar estado
        
        // Mostrar la pantalla de "Game Over"
        if (this.restartScreen) {
            this.restartScreen.style.display = "flex";
        }
        
        // Cambiar expresión a enojada
        this.uiManager.setFace("angry");
        this.uiManager.stopFaceAnimation();
        
        // Liberar el cursor del pointer lock para que pueda hacer click en "Restart"
        document.exitPointerLock?.();
    }

    /**
     * Configura todos los elementos de audio (música y sonidos)
     * 
     * Crea dos elementos de audio:
     * 1. backgroundMusic: Música de fondo que hace loop
     * 2. gunSound: Sonido de disparo que se reproduce cuando tira
     */
    setupBackgroundMusic() {
        // ========== MÚSICA DE FONDO ==========
        // Crear elemento de audio HTML5
        this.backgroundMusic = new Audio();
        this.backgroundMusic.src = "mp3/bgm1.mp3";     // Archivo de música
        this.backgroundMusic.volume = 0.15;            // Volumen al 15% (para no ser muy fuerte)
        this.backgroundMusic.loop = true;              // Reproducir infinitamente
        
        // ========== EVENTOS DE AUDIO PARA DEBUGGING ==========
        // Cuando la música esté lista para reproducir
        this.backgroundMusic.addEventListener("canplay", () => {
            console.log("✓ Música cargada y lista");
        });
        
        // Si hay error al cargar la música
        this.backgroundMusic.addEventListener("error", (e) => {
            console.error("✗ Error al cargar música:", e);
        });
        
        // Cuando comienza a reproducir
        this.backgroundMusic.addEventListener("play", () => {
            console.log("✓ Música iniciada");
        });

        // ========== SONIDO DE DISPARO ==========
        // Crear elemento de audio para el sonido del disparo
        this.gunSound = new Audio();
        this.gunSound.src = "mp3/gupP.mp3";    // Archivo de sonido
        this.gunSound.volume = 1.0;            // Volumen al 100%
    }

    /**
     * Inicia el juego después de que toda la configuración está lista
     * 
     * Acciones:
     * 1. Reproducir música de fondo
     * 2. Aparecer los enemigos en el mapa
     */
    start() {
        // ========== REPRODUCIR MÚSICA ==========
        if (this.backgroundMusic) {
            try {
                // Intentar reproducir la música
                // El .catch() maneja errores de política de autoplay del navegador
                this.backgroundMusic.play().catch(error => {
                    console.error("Error al reproducir:", error);
                });
                console.log("Intentando reproducir música...");
            } catch (error) {
                console.error("Error:", error);
            }
        }
        
        // ========== APARECER ENEMIGOS ==========
        // Crear los 3 enemigos en posiciones predefinidas
        this.enemyManager.spawnDefaultEnemies();
    }
}
