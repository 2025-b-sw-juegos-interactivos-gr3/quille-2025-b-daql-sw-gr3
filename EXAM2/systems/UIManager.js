class UIManager {
    static instance = null;

    constructor() {
        if (UIManager.instance) {
            return UIManager.instance;
        }
        this.weaponDiv = document.getElementById("weapon");
        this.faceDiv = document.getElementById("doom-face");
        this.faceAnimationInterval = null;
        
        this.faces = {
            idle: "0% 0%",      
            grin: "100% 0%",    
            left: "0% 100%",    
            angry: "100% 100%"  
        };
        
        UIManager.instance = this;
    }

    startFaceAnimation() {
        if (this.faceAnimationInterval) {
            clearInterval(this.faceAnimationInterval);
        }
        
        this.faceAnimationInterval = setInterval(() => {
            const gameState = GameStateManager.getInstance().getState();
            if (gameState !== GameState.SHOOTING && gameState !== GameState.VICTORY) { 
                const random = Math.random();
                if (random < 0.7) {
                    this.setFace("idle");
                } else if (random < 0.85) {
                    this.setFace("left");
                } else {
                    this.setFace("angry");
                }
            }
        }, 2000);
    }

    stopFaceAnimation() {
        if (this.faceAnimationInterval) {
            clearInterval(this.faceAnimationInterval);
        }
    }

    setFace(faceName) {
        if (this.faces[faceName]) {
            this.faceDiv.style.backgroundPosition = this.faces[faceName];
        }
    }

    setWeaponFrame(frame) {
        this.weaponDiv.style.backgroundPosition = frame;
    }

    getWeaponDiv() {
        return this.weaponDiv;
    }

    getFaceDiv() {
        return this.faceDiv;
    }

    static getInstance() {
        if (!UIManager.instance) {
            new UIManager();
        }
        return UIManager.instance;
    }
}
