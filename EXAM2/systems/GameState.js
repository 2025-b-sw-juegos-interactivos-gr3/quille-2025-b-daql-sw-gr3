class GameState {
    static IDLE = "idle";
    static SHOOTING = "shooting";
    static AIMING = "aiming";
    static VICTORY = "victory";
}

class GameStateManager {
    static instance = null;

    constructor() {
        if (GameStateManager.instance) {
            return GameStateManager.instance;
        }
        this.currentState = GameState.IDLE;
        this.listeners = [];
        GameStateManager.instance = this;
    }

    setState(newState) {
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.notifyListeners();
        }
    }

    getState() {
        return this.currentState;
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    unsubscribe(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.currentState));
    }

    static getInstance() {
        if (!GameStateManager.instance) {
            new GameStateManager();
        }
        return GameStateManager.instance;
    }
}
