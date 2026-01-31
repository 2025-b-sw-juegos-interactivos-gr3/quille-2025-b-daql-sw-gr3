/**
 * CLASE: GameState
 * Propósito: Define todas las posibles estados del juego como constantes estáticas
 * Esto asegura que no haya errores tipográficos y proporciona auto-completado en IDEs
 */
class GameState {
    // El jugador está en reposo, esperando interacción
    static IDLE = "idle";
    
    // El jugador está disparando
    static SHOOTING = "shooting";
    
    // El jugador está apuntando
    static AIMING = "aiming";
    
    // El jugador ha ganado (derrotó a todos los enemigos)
    static VICTORY = "victory";
}

/**
 * CLASE: GameStateManager
 * 
 * Propósito: Gestiona el estado actual del juego y notifica a todos los observadores
 * cuando el estado cambia. Usa dos patrones importantes:
 * 
 * 1. SINGLETON: Solo existe una instancia de esta clase en toda la aplicación
 * 2. OBSERVER: Otros objetos pueden "suscribirse" para recibir notificaciones
 *             cuando el estado cambia
 * 
 * Ejemplo de uso:
 * const stateManager = GameStateManager.getInstance();
 * stateManager.setState(GameState.SHOOTING);  // Cambiar estado
 * stateManager.subscribe((state) => {         // Escuchar cambios
 *     console.log("Nuevo estado: " + state);
 * });
 */
class GameStateManager {
    // Variable estática para almacenar la única instancia (Patrón Singleton)
    static instance = null;

    constructor() {
        // Si ya existe una instancia, retornarla (garantiza que solo haya una)
        if (GameStateManager.instance) {
            return GameStateManager.instance;
        }
        
        // Estado inicial del juego
        this.currentState = GameState.IDLE;
        
        // Array de funciones que se ejecutarán cuando el estado cambie
        // Esto es el patrón OBSERVER
        this.listeners = [];
        
        // Guardar esta instancia como la única permitida
        GameStateManager.instance = this;
    }

    /**
     * Cambia el estado del juego al nuevo estado proporcionado
     * Si el nuevo estado es diferente del actual, notifica a todos los listeners
     * 
     * @param {string} newState - El nuevo estado (ej: GameState.SHOOTING)
     */
    setState(newState) {
        // Solo notificar si el estado realmente cambió (evita notificaciones innecesarias)
        if (this.currentState !== newState) {
            this.currentState = newState;
            // Avisarles a todos los que están escuchando
            this.notifyListeners();
        }
    }

    /**
     * Retorna el estado actual del juego
     * 
     * @returns {string} El estado actual
     */
    getState() {
        return this.currentState;
    }

    /**
     * Patrón OBSERVER: Registra una función para que sea llamada
     * cada vez que el estado cambie
     * 
     * @param {function} listener - Función a ejecutar cuando cambie el estado
     *                              Recibirá el nuevo estado como parámetro
     * 
     * Ejemplo:
     * stateManager.subscribe((newState) => {
     *     console.log("El estado es ahora: " + newState);
     * });
     */
    subscribe(listener) {
        this.listeners.push(listener);
    }

    /**
     * Patrón OBSERVER: Dejar de escuchar cambios de estado
     * 
     * @param {function} listener - La función a dejar de ejecutar
     * 
     * Ejemplo:
     * const miListener = (state) => console.log(state);
     * stateManager.subscribe(miListener);
     * // ... después ...
     * stateManager.unsubscribe(miListener);  // Ya no recibirá actualizaciones
     */
    unsubscribe(listener) {
        const index = this.listeners.indexOf(listener);
        // Si encuentra el listener, lo elimina del array
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * Notifica a TODOS los listeners (funciones suscritas) sobre el cambio de estado
     * Se ejecuta automáticamente cuando setState() detecta un cambio
     * 
     * Internamente, llama a cada listener pasándole el estado actual
     */
    notifyListeners() {
        // Para cada listener registrado, ejecutarlo con el estado actual
        this.listeners.forEach(listener => listener(this.currentState));
    }

    /**
     * Patrón SINGLETON: Getter estático para obtener la única instancia
     * Si no existe, la crea; si existe, devuelve la existente
     * 
     * @returns {GameStateManager} La única instancia de GameStateManager
     * 
     * Uso:
     * const stateManager = GameStateManager.getInstance();
     */
    static getInstance() {
        // Si no existe instancia, crear una nueva
        if (!GameStateManager.instance) {
            new GameStateManager();
        }
        // Retornar la única instancia (ya sea nueva o existente)
        return GameStateManager.instance;
    }
}
