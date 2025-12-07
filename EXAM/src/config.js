export const CONFIG = {
    moveSpeed: 0.04,
    turnSpeed: 0.15,
    pickupRange: 2.5, 
    deliverRange: 5.0,
    
    // 💡 CAMBIO: Ahora son 3 cofres en total
    totalChests: 3, 
    
    gravitySpeed: -20.0,
    playerHeight: 0.5,
    chestSize: 0.25,
    
    // Rutas de assets
    assetsPath: "./assets/", 
    mapFile: "OneP2.glb", // Asegúrate que este sea el nombre correcto de tu mapa
    playerFile: "L1.glb",

    // 💡 CAMBIO: Tus posiciones capturadas con la tecla P
    chestPositions: [
        new BABYLON.Vector3(0.113, 1.011, -0.477),    // Cofre 1
        new BABYLON.Vector3(13.392, 0.014, 2.934),    // Cofre 2
        new BABYLON.Vector3(-8.709, 0.228, -0.470)     // Cofre 3 (Misma posición que el 2)
    ],

    // 💡 CAMBIO: Tu nueva zona de entrega
    shipPosition: new BABYLON.Vector3(3.705, -0.459, -8.887)
};