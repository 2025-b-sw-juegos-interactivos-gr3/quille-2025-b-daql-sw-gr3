export const State = {
    // --- ESTADO GENERAL ---
    // Interruptor principal: determina si el juego está corriendo o pausado.
    isGameActive: false,

    // --- ENTRADA DEL JUGADOR (INPUTS) ---
    // Aquí guardamos qué teclas están presionadas en este instante.
    // keys: Es un objeto que guardará { 'w': true, 'a': false, ... }
    keys: {},             
    // Detecta si el jugador presionó la tecla de interacción (E o Espacio)
    actionPressed: false, 

    // --- REFERENCIAS 3D  ---
    // Es vital distinguir entre estos dos:
    // 1. playerMesh: Es el cilindro invisible (Hitbox). Controla la física y choques.
    playerMesh: null,     
    // 2. visualMesh: Es el modelo de Luffy. Solo es "dibujo", sigue al playerMesh.
    visualMesh: null,     
    
    // Guardamos la cámara para calcular hacia dónde es "adelante" al movernos.
    camera: null,         
    
    // --- OBJETOS DEL MUNDO ---
    // Lista (Array) que contiene todos los cofres creados en el mapa.
    chests: [],           
    // Referencia a la zona invisible del barco donde entregamos tesoros.
    shipZone: null,       
    
    // Variable especial: Si es null, tienes las manos vacías. 
    // Si tiene un objeto, es el cofre que llevas cargado.
    carriedChest: null,   
    
    // El marcador de puntuación actual.
    chestsCollected: 0,   

    // --- SISTEMA DE ANIMACIÓN ---
    // Guardamos las referencias a las animaciones para poder darles Play/Stop
    // desde el archivo main.js sin tener que buscarlas cada vez.
    animations: {
        idle: null, // Respirar / Quieto
        walk: null  // Correr / Caminar
    },

    // --- FUNCIÓN DE REINICIO ---
    // Esta función limpia la memoria para empezar una partida nueva desde cero.
    // Es crucial para que no se queden puntos o cofres "fantasma" de la partida anterior.
    reset: function() {
        this.chestsCollected = 0;
        this.carriedChest = null;
        this.actionPressed = false;
        this.chests = [];
        this.keys = {};
      
        // solo reseteamos la lógica del juego.
    }
};