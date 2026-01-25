class MaterialManager {
    static instance = null;

    constructor(scene) {
        if (MaterialManager.instance) {
            return MaterialManager.instance;
        }
        this.scene = scene;
        this.materials = {};
        MaterialManager.instance = this;
    }

    createMaterials() {
        const floorMat = new BABYLON.StandardMaterial("floorMat", this.scene);
        floorMat.diffuseTexture = new BABYLON.Texture("texturas/floor.png", this.scene);
        floorMat.diffuseTexture.uScale = 10; 
        floorMat.diffuseTexture.vScale = 30; 
        floorMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        this.materials.floor = floorMat;

        const ceilMat = new BABYLON.StandardMaterial("cMat", this.scene);
        ceilMat.diffuseTexture = new BABYLON.Texture("texturas/techo.png", this.scene); 
        ceilMat.diffuseTexture.uScale = 10; 
        ceilMat.diffuseTexture.vScale = 30; 
        ceilMat.specularColor = new BABYLON.Color3(0, 0, 0);
        ceilMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        this.materials.ceiling = ceilMat;

        const gateMat = new BABYLON.StandardMaterial("gateMat", this.scene);
        gateMat.diffuseTexture = new BABYLON.Texture("texturas/door.jpg", this.scene);
        gateMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        this.materials.gate = gateMat;
        
        const wallMat = new BABYLON.StandardMaterial("wallMat", this.scene);
        wallMat.diffuseTexture = new BABYLON.Texture("texturas/wall.png", this.scene);
        wallMat.diffuseTexture.wAng = Math.PI / 2; 
        wallMat.diffuseTexture.uScale = 1;  
        wallMat.diffuseTexture.vScale = 15; 
        wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        wallMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        this.materials.wall = wallMat;

        return this.materials;
    }

    getMaterial(name) {
        return this.materials[name];
    }

    getAllMaterials() {
        return this.materials;
    }

    static getInstance(scene) {
        if (!MaterialManager.instance) {
            new MaterialManager(scene);
        }
        return MaterialManager.instance;
    }
}
