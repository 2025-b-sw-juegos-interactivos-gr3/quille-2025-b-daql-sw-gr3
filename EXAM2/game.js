const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true); 

// MODO RETRO
engine.setHardwareScalingLevel(4); 

// Inicializar pantalla de demostración
const demoScreen = DemoScreen.getInstance();

// Cuando presiona PLAY, iniciar el juego
demoScreen.onPlay(() => {
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

    // Render loop
    engine.runRenderLoop(function () { scene.render(); });
    window.addEventListener("resize", function () { engine.resize(); });
});
