export const CONFIG = {
    // --- AJUSTES DE MOVIMIENTO ---
    // Qué tan rápido se mueve Luffy y qué tan rápido gira al presionar teclas.
    moveSpeed: 0.04,
    turnSpeed: 0.15,

    // --- INTERACCIÓN ---
    // Distancia mínima para que aparezca el mensaje "E: Recoger" o "E: Entregar".
    pickupRange: 2.5, 
    deliverRange: 5.0,
    
    // --- META DEL JUEGO ---
    // Cantidad de tesoros necesarios para ganar.
    totalChests: 3, 
    
    // --- FÍSICA Y TAMAÑOS ---
    // Gravedad negativa para caer hacia abajo (eje Y).
    gravitySpeed: -20.0,
    // Altura del personaje para cálculos de colisión y tamaño de los cofres.
    playerHeight: 0.5,
    chestSize: 0.25,
    
    // --- RUTAS DE ARCHIVOS (ASSETS) ---
    // Carpeta donde están los modelos 3D y nombres exactos de los archivos .glb
    assetsPath: "./assets/", 
    mapFile: "OneP2.glb", // El escenario/mapa
    playerFile: "L1.glb", // El modelo del personaje

  
    // --- POSICIONES EN EL MUNDO 3D ---
    // Lista de coordenadas (X, Y, Z) donde aparecerá cada uno de los cofres.
    // Puedes agregar más líneas aquí (new BABYLON.Vector3...) si aumentas totalChests.
    chestPositions: [
        new BABYLON.Vector3(0.113, 1.011, -0.477),    // Cofre 1
        new BABYLON.Vector3(13.392, 0.014, 2.934),    // Cofre 2
        new BABYLON.Vector3(-8.709, 0.228, -0.470)    // Cofre 3 
    ],

    // Coordenada exacta donde está el barco para entregar los tesoros.
    shipPosition: new BABYLON.Vector3(3.705, -0.459, -8.887)
};