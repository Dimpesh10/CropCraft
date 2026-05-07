# CropCraft

A Deep Learning-Integrated Farming Simulator for Interactive Agricultural Literacy.

## What is CropCraft?

CropCraft is a browser-based 3D farming simulator with a low-poly isometric aesthetic. Players manage a virtual farm — planting crops, managing resources, navigating seasons and weather — while learning real-world agricultural concepts through gameplay. An AI farming advisor (Claude API) provides context-aware guidance. It doubles as an academic submission and a professional portfolio piece.

## Tech Stack

- **3D Rendering:** React Three Fiber + Three.js (TypeScript) — isometric camera, instanced mesh tile grid, box-geometry models
- **UI Layer:** React 19 — HUD overlays (day display, toolbar, inventory), AI chat panel
- **State:** Custom GameStateStore (useSyncExternalStore) + mitt EventBus
- **Backend:** Node.js + Express — API layer, game state persistence, Claude API proxy
- **Database:** MongoDB — player progress, farm state, crop data, AI conversation history
- **AI Integration:** Anthropic Claude API — conversational farming advisor
- **Deployment:** Frontend on Vercel, Backend on Render with managed MongoDB

## Architecture

```
Frontend (Vercel)                    Backend (Render)
├── React Three Fiber (3D canvas)    ├── Express API
│   ├── TileGrid (InstancedMesh)     ├── Game State API
│   ├── PlayerModel (BoxGeometry)    ├── Claude API Proxy
│   ├── CropMeshes (per-stage 3D)   └── MongoDB Connection
│   └── DayNightLighting
├── React HUD Overlays
│   ├── DayDisplay + progress bar
│   ├── ToolBar (SVG icons)
│   └── InventoryPanel
└── AI Chat Panel (toggleable)
```

## Folder Structure

```
client/src/
├── App.tsx                    # Root: FarmCanvas + HUD
├── main.tsx                   # React entry
├── components/                # React UI overlays
│   ├── HUD.tsx
│   ├── DayDisplay.tsx
│   ├── ToolBar.tsx
│   └── InventoryPanel.tsx
└── game/
    ├── constants.ts           # TILE_SIZE, MAP dims, speeds, day duration
    ├── types.ts               # Enums + interfaces (shared across all systems)
    ├── data/crops.ts          # Crop definitions
    ├── events/EventBus.ts     # mitt-based typed event emitter
    ├── state/GameStateStore.ts # Singleton state + React sync
    ├── hooks/
    │   ├── useGameState.ts    # useSyncExternalStore wrapper
    │   └── useKeyboard.ts     # Keyboard input hook
    ├── systems/               # Pure logic (no rendering)
    │   ├── FarmGrid.ts        # Tile grid data + mutation
    │   ├── CropSystem.ts      # Plant/water/grow/harvest logic
    │   ├── ToolSystem.ts      # Tool selection + dispatch
    │   ├── InventoryManager.ts # Seed/harvest tracking
    │   └── SoundManager.ts    # Web Audio beeps
    ├── components3d/          # R3F rendering components
    │   ├── FarmCanvas.tsx     # <Canvas> + camera + lighting
    │   ├── TileGrid.tsx       # InstancedMesh tile rendering
    │   ├── PlayerModel.tsx    # Box-geometry character + movement
    │   ├── CropMeshes.tsx     # 3D crop stage models
    │   ├── DayNightLighting.tsx # Time-of-day lighting
    │   └── GameWorld.tsx      # Orchestrator wiring systems
    └── _legacy/               # Old Phaser code (delete after migration verified)
```

## Development Commands

```bash
npm install              # Install all dependencies (root + workspaces)
npm run dev              # Run both client and server concurrently
npm run dev:client       # Run frontend only (Vite on port 5173)
npm run dev:server       # Run backend only (Express on port 3001)
npm run build            # Build both client and server
```

## Conventions

- TypeScript for all code (game systems, rendering, UI, server)
- React Three Fiber for 3D rendering (useFrame for game loop, refs for performance)
- React for UI overlays on top of the 3D canvas
- `game/systems/` = pure logic, no rendering. `game/components3d/` = R3F visual components
- EventBus (mitt) for cross-system communication
- GameStateStore for Phaser-free state that syncs to React via useSyncExternalStore
- Express routes for backend API endpoints
- MongoDB for all persistence

## Migration History

CropCraft was originally built with Phaser 3 (2D pixel art). Phases 1-2 completed a full 2D game loop. In April 2026, the project migrated to React Three Fiber for a 3D isometric aesthetic. ~40% of code (types, state, events, data, HUD, server, sounds) was reused; ~60% (rendering, tilemap, player, interactions) was rebuilt for 3D.
