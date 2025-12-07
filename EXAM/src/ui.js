import { CONFIG } from './config.js';
import { State } from './state.js';

const startScreen = document.getElementById("startScreen");
const playButton = document.getElementById("playButton");
const gameMessage = document.getElementById("gameMessage");
const hudCounter = document.getElementById('hudCounter');
const actionPrompt = document.getElementById('actionPrompt');

export function setupUI(startGameCallback) {
    if (playButton) {
        playButton.addEventListener("click", () => {
            if (playButton.innerText.includes("Jugar de Nuevo")) {
                location.reload();
            } else {
                startGameCallback();
                if (startScreen) startScreen.style.display = "none";
                if (gameMessage) { 
                    gameMessage.style.display = "block"; 
                    updateMissionText(); 
                }
            }
        });
    }
}

export function updateMissionText() {
    if (hudCounter) hudCounter.innerText = `Tesoros: ${State.chestsCollected}/${CONFIG.totalChests}`;
    
    if (!gameMessage) return;
    if (State.chestsCollected < CONFIG.totalChests) {
        gameMessage.innerText = `¡Busca los Tesoros! (${State.chestsCollected}/${CONFIG.totalChests})`;
        gameMessage.style.color = "#ffd700";
    } else {
        gameMessage.innerText = "¡TODOS LOS TESOROS RECOGIDOS! Dirígete al barco.";
        gameMessage.style.color = "#00ff00";
    }
}

export function showTemporaryMessage(text, duration = 2500) {
    if (!gameMessage) return;
    gameMessage.innerText = text;
    gameMessage.style.opacity = '1';
    
    setTimeout(() => {
        updateMissionText(); // Restaurar texto de misión
    }, duration);
}

export function showVictory() {
    if(gameMessage) {
        gameMessage.innerText = "¡MISIÓN CUMPLIDA!";
        gameMessage.style.color = "#00ff00"; 
        gameMessage.style.fontSize = "40px";
    }
    if(startScreen) {
        startScreen.style.display = "flex";
        startScreen.querySelector("h1").innerText = "¡VICTORIA!";
        startScreen.querySelector("p").style.display = "none";
        playButton.innerText = "Jugar de Nuevo";
    }
}

export function toggleActionPrompt(show, text = "") {
    if(!actionPrompt) return;
    if(show) {
        actionPrompt.style.display = 'block';
        actionPrompt.innerText = text;
    } else {
        actionPrompt.style.display = 'none';
    }
}