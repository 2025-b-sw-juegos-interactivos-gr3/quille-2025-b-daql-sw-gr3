# DOOM - Vertical Slice Demo

## Patrones de Diseño Utilizados

### 1. **Singleton**
Se utiliza el patrón Singleton para garantizar que existe una única instancia de cada manager en toda la aplicación:
- `SceneManager`: Gestiona la escena de Babylon.js
- `CameraManager`: Controla la cámara del jugador
- `MaterialManager`: Maneja todos los materiales 3D
- `EnvironmentManager`: Construye el entorno del juego
- `LightingManager`: Gestiona la iluminación
- `EnemyManager`: Controla los enemigos
- `ParticleManager`: Maneja efectos de partículas
- `UIManager`: Gestiona la UI del juego
- `InputManager`: Procesa entrada del usuario
- `AmmoManager`: Controla las municiones
- `GameStateManager`: Gestiona el estado global del juego

Esto asegura que no haya duplicados y que el acceso sea centralizado.

### 2. **State Machine (Máquina de Estados)**
El `GameStateManager` implementa una máquina de estados que controla los estados del juego:
- `IDLE`: Esperando acción del jugador
- `SHOOTING`: En proceso de disparo
- `AIMING`: Apuntando (extensible)
- `VICTORY`: Juego ganado

### 3. **Observer (Observer Pattern)**
El `GameStateManager` permite que otros sistemas se suscriban a cambios de estado mediante:
- `subscribe(listener)`: Registra oyentes
- `notifyListeners()`: Notifica cambios de estado

## Arquitectura del Proyecto

```
DOOMEX/
├── managers/
│   ├── SceneManager.js           (Gestión de escena)
│   ├── CameraManager.js          (Control de cámara)
│   ├── MaterialManager.js        (Materiales 3D)
│   ├── EnvironmentManager.js     (Construcción del nivel)
│   ├── LightingManager.js        (Iluminación)
│   ├── EnemyManager.js           (Enemigos y sprites)
│   └── ParticleManager.js        (Efectos de sangre)
│
├── systems/
│   ├── GameState.js              (Estados del juego)
│   ├── UIManager.js              (Interfaz de usuario)
│   ├── InputManager.js           (Entrada del usuario)
│   ├── AmmoManager.js            (Sistema de municiones)
│   ├── GameController.js         (Lógica principal del juego)
│   └── DemoScreen.js             (Pantalla de inicio)
│
├── texturas/                      (Recursos de imagen)
│   ├── floor.png
│   ├── techo.png
│   ├── wall.png
│   ├── door.jpg
│   ├── imp.png
│   ├── gun_strip.png
│   ├── new_hud.webp
│   └── face.png
│
├── mp3/                           (Recursos de audio)
│   ├── doom1.mp3                 (Música de fondo)
│   └── gupP.mp3                  (Sonido de disparo)
│
├── index.html                     (Punto de entrada HTML)
├── game.js                        (Inicializador del juego)
└── README.md                      (Este archivo)
```

## Características

- **Modo Retro**: Escalado de hardware para efecto pixel
- **Cámara FPS**: Movimiento con WASD
- **Sistema de Disparo**: Click para disparar con animaciones
- **Municiones**: 5 balas por partida
- **Enemigos**: 3 enemigos IA que persiguen al jugador
- **Efectos**: Partículas de sangre al impactar
- **UI Dinámica**: Cara animada, HUD estilizado y contador de municiones
- **Pantalla de Inicio**: Demo splash screen con botón Play

## Cómo Iniciar el Juego

### Opción 1: Live Server (Recomendado)
1. Abre Visual Studio Code
2. Navega a la carpeta del proyecto
3. Click derecho en `index.html`
4. Selecciona **"Open with Live Server"**
5. El navegador se abrirá automáticamente

### Opción 2: Servidor Local Manual
```bash
python -m http.server 8000
```
Luego abre `http://localhost:8000` en tu navegador

### Opción 3: Abrir directamente
```bash
open index.html  (en macOS)
start index.html (en Windows)
```

## Controles del Juego

- **W/A/S/D**: Movimiento
- **Ratón**: Apuntar y girar vista
- **Click Izquierdo**: Disparar

## Flujo del Juego

1. **Pantalla de Bienvenida**: Muestra "Bienvenido a la DEMO" con botón PLAY
2. **Inicialización**: Al presionar PLAY se carga el juego
3. **Combate**: 
   - 3 enemigos en el nivel
   - 5 balas disponibles
   - Destruye todos los enemigos para ganar
4. **Victoria**: Cuando elimines todos los enemigos

## Requisitos

- Navegador moderno con soporte WebGL
- JavaScript habilitado
- Babylon.js (cargado desde CDN)

## Notas de Desarrollo

- Todos los managers usan patrón **Singleton** para una única instancia
- El **GameController** orquesta la lógica principal
- El **GameStateManager** maneja la comunicación entre sistemas
- La arquitectura es **modular** y **escalable** para futuras expansiones
