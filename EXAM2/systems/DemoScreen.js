class DemoScreen {
    static instance = null;

    constructor() {
        if (DemoScreen.instance) {
            return DemoScreen.instance;
        }
        this.demoScreen = document.getElementById("demo-screen");
        this.playButton = document.getElementById("play-button");
        this.onPlayCallback = null;
        this.setupButton();
        DemoScreen.instance = this;
    }

    setupButton() {
        this.playButton.addEventListener("click", () => {
            this.hideDemoScreen();
            if (this.onPlayCallback) {
                this.onPlayCallback();
            }
        });
    }

    onPlay(callback) {
        this.onPlayCallback = callback;
    }

    hideDemoScreen() {
        this.demoScreen.style.display = "none";
    }

    showDemoScreen() {
        this.demoScreen.style.display = "flex";
    }

    static getInstance() {
        if (!DemoScreen.instance) {
            new DemoScreen();
        }
        return DemoScreen.instance;
    }
}
