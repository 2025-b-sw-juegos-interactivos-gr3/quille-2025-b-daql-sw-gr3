class EnemyManager {
    static instance = null;

    constructor(scene) {
        if (EnemyManager.instance) {
            return EnemyManager.instance;
        }
        this.scene = scene;
        this.spriteManager = null;
        this.enemies = [];
        EnemyManager.instance = this;
    }

    createSpriteManager() {
        this.spriteManager = new BABYLON.SpriteManager("impManager", "texturas/imp.png", 10, {width: 200, height: 300}, this.scene);
        this.spriteManager.isPickable = true;
    }

    createEnemy(x, z) {
        const imp = new BABYLON.Sprite("imp", this.spriteManager);
        imp.position = new BABYLON.Vector3(x, 1.5, z);
        imp.size = 3.5; 
        imp.isPickable = true;
        this.enemies.push(imp);
        return imp;
    }

    spawnDefaultEnemies() {
        this.createEnemy(0, -10);   
        this.createEnemy(-2, 5);    
        this.createEnemy(3, 20);
    }

    updateEnemies(cameraPosition) {
        this.enemies.forEach(imp => {
            if (imp) {
                const dir = cameraPosition.subtract(imp.position);
                dir.y = 0;
                if (dir.length() > 2) { 
                    dir.normalize();
                    imp.position.addInPlace(dir.scale(0.02)); 
                }
            }
        });
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        enemy.dispose();
    }

    getEnemies() {
        return this.enemies;
    }

    getEnemyCount() {
        return this.enemies.length;
    }

    static getInstance(scene) {
        if (!EnemyManager.instance) {
            new EnemyManager(scene);
        }
        return EnemyManager.instance;
    }
}
