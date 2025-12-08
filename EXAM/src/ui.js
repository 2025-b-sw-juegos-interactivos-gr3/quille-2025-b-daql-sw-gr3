import { CONFIG } from './config.js';
import { State } from './state.js';

// Referencias a los elementos del DOM (HTML)
const startScreen = document.getElementById("startScreen");
const playButton = document.getElementById("playButton");
const gameMessage = document.getElementById("gameMessage");
const hudCounter = document.getElementById('hudCounter');
const actionPrompt = document.getElementById('actionPrompt');

export function setupUI(startGameCallback) {
    if (playButton) {
        playButton.addEventListener("click", () => {
            // Si el botón dice "Jugar de Nuevo", recargamos la página para reiniciar todo
            if (playButton.innerText.includes("Jugar de Nuevo")) {
                location.reload();
            } else {
                // Si es la primera vez, iniciamos el juego y ocultamos el menú
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
    // Actualizar el contador pequeño en la esquina
    if (hudCounter) hudCounter.innerText = `Tesoros: ${State.chestsCollected}/${CONFIG.totalChests}`;
    
    if (!gameMessage) return;

    // Actualizar el mensaje central dependiendo del progreso
    if (State.chestsCollected < CONFIG.totalChests) {
        gameMessage.innerText = `¡Busca los Tesoros! (${State.chestsCollected}/${CONFIG.totalChests})`;
        gameMessage.style.color = "#ffd700"; // Color dorado
    } else {
        gameMessage.innerText = "¡TODOS LOS TESOROS RECOGIDOS! Dirígete al barco.";
        gameMessage.style.color = "#00ff00"; // Color verde
    }
}

export function showTemporaryMessage(text, duration = 2500) {
    if (!gameMessage) return;
    
    // Mostrar mensaje temporal (ej: "¡Lo tienes!")
    gameMessage.innerText = text;
    gameMessage.style.opacity = '1';
    
    // Restaurar el texto de la misión después de unos segundos
    setTimeout(() => {
        updateMissionText(); 
    }, duration);
}

export function showVictory() {
    // Mostrar mensaje final en pantalla
    if(gameMessage) {
        gameMessage.innerText = "¡MISIÓN CUMPLIDA!";
        gameMessage.style.color = "#00ff00"; 
        gameMessage.style.fontSize = "40px";
    }
    
    // Volver a mostrar la pantalla de inicio modificada para la victoria
    if(startScreen) {
        startScreen.style.display = "flex";
        startScreen.querySelector("h1").innerText = "¡VICTORIA!";
        startScreen.querySelector("p").style.display = "none"; // Ocultar instrucciones
        playButton.innerText = "Jugar de Nuevo";
    }
}

export function toggleActionPrompt(show, text = "") {
    if(!actionPrompt) return;
    
    // Mostrar u ocultar el aviso de interacción (ej: "E: Recoger")
    if(show) {
        actionPrompt.style.display = 'block';
        actionPrompt.innerText = text;
    } else {
        actionPrompt.style.display = 'none';
    }
}