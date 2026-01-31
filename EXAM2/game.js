const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true); 

// MODO RETRO
engine.setHardwareScalingLevel(4); 

// Limitar FPS para efecto retro (tipo juegos antiguos)
let frameCount = 0;
let targetFrameRate = 30; // 30 FPS retro
let frameSkip = Math.floor(60 / targetFrameRate); // Calcular cada cuántos frames renderizar 

// Permitir autoplay de audio
let audioContext = null;
if (window.AudioContext || window.webkitAudioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") {
        document.addEventListener("click", () => {
            audioContext.resume();
        }, { once: true });
    }
}

// Inicializar pantalla de demostración
const demoScreen = DemoScreen.getInstance();

// Cuando presiona PLAY, iniciar el juego
demoScreen.onPlay(() => {
    // Reanudar contexto de audio si es necesario
    if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
    }

    // Inicializar todos los managers
    const sceneManager = SceneManager.getInstance(engine, canvas);
    const scene = sceneManager.createScene();

    const cameraManager = CameraManager.getInstance(scene, canvas);
    const camera = cameraManager.createCamera();

    const materialManager = MaterialManager.getInstance(scene);
    const materials = materialManager.createMaterials();

    const environmentManager = EnvironmentManager.getInstance(scene);
    environmentManager.createEnvironment(materials);

    const lightingManager = LightingManager.getInstance(scene);
    lightingManager.createLighting();

    const particleManager = ParticleManager.getInstance(scene);
    particleManager.createBloodTexture();

    const enemyManager = EnemyManager.getInstance(scene);
    enemyManager.createSpriteManager();

    // Inicializar el controlador del juego
    const gameController = new GameController(scene, camera);
    gameController.start();

    // Render loop con limitación de FPS para efecto retro
    engine.runRenderLoop(function () { 
        frameCount++;
        if (frameCount % frameSkip === 0) {
            scene.render();
        }
    });
    window.addEventListener("resize", function () { engine.resize(); });
});
