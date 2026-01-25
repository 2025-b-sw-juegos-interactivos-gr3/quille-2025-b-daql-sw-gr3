class EnvironmentManager {
    static instance = null;

    constructor(scene) {
        if (EnvironmentManager.instance) {
            return EnvironmentManager.instance;
        }
        this.scene = scene;
        this.meshes = {};
        EnvironmentManager.instance = this;
    }

    createEnvironment(materials) {
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 50, height: 100}, this.scene);
        ground.material = materials.floor;
        ground.checkCollisions = true;
        this.meshes.ground = ground;

        const ceiling = BABYLON.MeshBuilder.CreateGround("ceiling", {width: 50, height: 100}, this.scene);
        ceiling.position.y = 7; 
        ceiling.rotation.x = Math.PI;
        ceiling.material = materials.ceiling;
        this.meshes.ceiling = ceiling;

        const largoPasillo = 60; 
        const anchoPasillo = 12;
        const altura = 7;

        const wallLeft = BABYLON.MeshBuilder.CreateBox("wallLeft", {width: 1, height: altura, depth: largoPasillo}, this.scene);
        wallLeft.position = new BABYLON.Vector3(-anchoPasillo/2, altura/2, 0);
        wallLeft.checkCollisions = true;
        wallLeft.material = materials.wall;
        this.meshes.wallLeft = wallLeft;

        const wallRight = BABYLON.MeshBuilder.CreateBox("wallRight", {width: 1, height: altura, depth: largoPasillo}, this.scene);
        wallRight.position = new BABYLON.Vector3(anchoPasillo/2, altura/2, 0);
        wallRight.checkCollisions = true;
        wallRight.material = materials.wall;
        this.meshes.wallRight = wallRight;

        this.createGate(-largoPasillo / 2, altura, anchoPasillo, materials);
        this.createGate(largoPasillo / 2, altura, anchoPasillo, materials);
    }

    createGate(zPos, altura, anchoPasillo, materials) {
        const gate = BABYLON.MeshBuilder.CreateBox("gate", {width: anchoPasillo, height: altura, depth: 1}, this.scene);
        gate.position = new BABYLON.Vector3(0, altura / 2, zPos);
        gate.checkCollisions = true;
        gate.material = materials.gate;
    }

    getMesh(name) {
        return this.meshes[name];
    }

    static getInstance(scene) {
        if (!EnvironmentManager.instance) {
            new EnvironmentManager(scene);
        }
        return EnvironmentManager.instance;
    }
}
