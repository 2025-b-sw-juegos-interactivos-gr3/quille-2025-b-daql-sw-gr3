export const State = {
    isGameActive: false,
    keys: {},             // Input de teclas
    actionPressed: false, // Input de acción (E/Espacio)

    // Referencias del Juego
    playerMesh: null,     // La caja invisible de colisión
    visualMesh: null,     // El modelo 3D de Luffy
    camera: null,         // Referencia a la cámara para el movimiento
    
    // Objetos del mundo
    chests: [],           // Array de cofres
    shipZone: null,       // Zona de entrega
    carriedChest: null,   // Cofre que llevas en la mano
    chestsCollected: 0,   // Contador

    // Animaciones
    animations: {
        idle: null,
        walk: null
    },

    reset: function() {
        this.chestsCollected = 0;
        this.carriedChest = null;
        this.actionPressed = false;
        this.chests = [];
        this.keys = {};
    }
};