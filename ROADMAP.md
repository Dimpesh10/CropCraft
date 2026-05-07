# CropCraft Development Roadmap

## History: 2D Prototype (Phaser 3) — ARCHIVED

Phases 1-2 built a complete 2D farming game with Phaser 3:
- Monorepo setup, Phaser 3 + React + Vite + TypeScript client, Express + Mongoose server
- Tilemap (25×18), player movement, crop system (turnip/potato/cauliflower), tools (hoe/water/seeds/hand), day/night cycle, React HUD, walk animations, sound effects
- Decision: migrated to 3D (React Three Fiber) for a more compelling academic submission. Old code archived in `_legacy/`.

---

## Current Roadmap: 3D (React Three Fiber)

### Phase 1: Foundation — DONE
- Replaced Phaser EventBus with `mitt` (typed, no Phaser dependency)
- Installed React Three Fiber + Three.js + drei
- Created `FarmCanvas.tsx` with orthographic isometric camera
- Moved old Phaser files to `game/_legacy/`
- HUD overlays preserved

### Phase 2: Tile Grid Rendering — NOT STARTED
- Extract grid logic from TilemapManager → pure `FarmGrid.ts`
- `TileGrid.tsx` renders 25×18 grid using InstancedMesh per tile type
- Colored flat boxes: grass=green, dirt=brown, tilled=dark-brown, watered=darkest, water=blue

### Phase 3: Player Movement — NOT STARTED
- `useKeyboard.ts` hook for input (no Phaser dependency)
- `PlayerModel.tsx` — box-geometry character, smooth movement via useFrame
- Camera smooth-follows player, tile highlight on faced tile

### Phase 4: Tools + Tile Interaction — DONE
- `ToolSystem.ts` — tool selection (1/2/3/4), seed cycling (Q), `handleInteraction()` dispatch
- Hoe tills dirt→tilled, watering can darkens tilled→watered (TileGrid re-renders via version polling)
- Sound effects wired: EventBus TILE_TILLED/TILE_WATERED → SoundManager Web Audio beeps
- ToolBar HUD highlights selected tool, InventoryPanel shows seeds + selected seed
- Space/E triggers interaction on faced tile (PlayerModel.tsx)

### Phase 5: Crops — DONE
- `CropSystem.ts` — port plant/water/grow/harvest logic
- `CropMeshes.tsx` — 3D shapes per growth stage (sphere→cone→cylinder→colored sphere)
- Day-end triggers growth for watered crops

### Phase 6: Day/Night Cycle + Lighting — DONE
- `DayNightLighting.tsx` — 45s day cycle via useFrame, dynamic ambient + directional lighting
- Smooth lerp between 4 time-of-day presets (morning/afternoon/evening/night)
- DayDisplay HUD auto-updates via GameStateStore, DAY_ENDED emitted for crop growth

### Phase 7: Cleanup + Polish — DONE
- Deleted `_legacy/` folder (8 Phaser files), uninstalled Phaser package
- Clean build verified with zero Phaser imports
- All sound events wired (till, water, plant, harvest, day)

### Phase 8: AI Farming Advisor — NOT STARTED
- Server: `@anthropic-ai/sdk`, `POST /api/advisor/chat`
- Client: toggleable right-side chat panel (press C)
- Context-aware: sends game state snapshot with each request

### Phase 9: Game State Persistence — NOT STARTED
- MongoDB schemas for farm state, inventory, day
- Save/load API endpoints
- AI conversation history storage

### Phase 10: Seasons & Weather — NOT STARTED
- Season cycle (spring/summer/fall/winter)
- Weather affecting crop growth (rain auto-waters, drought)

### Phase 11: Polish & Deployment — NOT STARTED
- Better 3D models, particle effects, music
- Frontend on Vercel, backend on Render

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Vite + React 19)                 │
│                                                                 │
│  ┌──────────────────────────┐  ┌─────────────────────────────┐  │
│  │   React Three Fiber      │  │   React HUD Overlays        │  │
│  │   <Canvas> (3D world)    │  │   ┌─────────────────────┐   │  │
│  │                          │  │   │ DayDisplay + bar    │   │  │
│  │   ┌──────────────────┐   │  │   │ ToolBar (SVG icons) │   │  │
│  │   │ TileGrid         │   │  │   │ InventoryPanel      │   │  │
│  │   │ (InstancedMesh)  │   │  │   │ Chat Panel (Ph 8)   │   │  │
│  │   ├──────────────────┤   │  │   └─────────────────────┘   │  │
│  │   │ PlayerModel      │   │  │                             │  │
│  │   │ (BoxGeometry)    │   │  │   Reads from:               │  │
│  │   ├──────────────────┤   │  │   GameStateStore             │  │
│  │   │ CropMeshes       │   │  │   (useSyncExternalStore)    │  │
│  │   ├──────────────────┤   │  └─────────────────────────────┘  │
│  │   │ DayNightLighting │   │                                   │
│  │   └──────────────────┘   │                                   │
│  └───────────┬──────────────┘                                   │
│              │ useFrame loop                                    │
│  ┌───────────▼──────────────────────────────────────────────┐   │
│  │              Pure Logic Layer (game/systems/)            │   │
│  │                                                          │   │
│  │  FarmGrid ◄──► CropSystem ◄──► ToolSystem               │   │
│  │      │              │              │                     │   │
│  │      └──────────────┼──────────────┘                     │   │
│  │                     │                                    │   │
│  │  InventoryManager   │   SoundManager (Web Audio)         │   │
│  │                     ▼                                    │   │
│  │              EventBus (mitt)                              │   │
│  │              GameStateStore                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP (fetch)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Express + Node.js)                  │
│                                                                 │
│  GET  /api/health              — server status                  │
│  POST /api/advisor/chat        — Claude API proxy (Phase 8)     │
│  POST /api/game/save           — persist farm state (Phase 9)   │
│  GET  /api/game/load/:id       — load farm state (Phase 9)      │
│                                                                 │
│  MongoDB (Mongoose) ◄──── player progress, farm, conversations  │
└─────────────────────────────────────────────────────────────────┘
```

## Dependency Chain

```
Phase 1 (Foundation) → Phase 2 (Tiles) → Phase 3 (Player) → Phase 4 (Tools)
  → Phase 5 (Crops) → Phase 6 (Day/Night) → Phase 7 (Cleanup)
    → Phase 8 (AI) → Phase 9 (Persistence) → Phase 10 (Seasons) → Phase 11 (Deploy)
```
