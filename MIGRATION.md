# CropCraft: 2D → 3D Migration Log

## Why the Migration?

CropCraft was originally built with Phaser 3 (2D pixel art). After completing the full 2D game loop (Phases 1-2), the decision was made to migrate to React Three Fiber for a 3D isometric aesthetic. This makes the project more compelling as an academic submission and portfolio piece, while demonstrating mastery of modern web 3D technologies.

## What Was Built in 2D (Phases 1-2)

All of these were functional and tested before migration:

| Feature | Status | Notes |
|---|---|---|
| Monorepo (npm workspaces) | Working | client + server |
| Phaser 3 game engine | Working | 800×600, 32px tiles, arcade physics |
| 25×18 tile grid | Working | Grass border, dirt interior, 3×2 water pond |
| Player movement | Working | WASD/arrows, 4-dir walk anims (2 frames each), collision |
| Tool system | Working | Hoe/water/seeds/hand (keys 1-4), Q cycles seed |
| Crop system | Working | 3 crops (turnip 3d, potato 5d, cauliflower 8d), 4 growth stages |
| Day/night cycle | Working | 45s days, tint overlay, DAY_ENDED triggers growth |
| React HUD | Working | DayDisplay + progress bar, ToolBar (SVG icons), InventoryPanel |
| Sound effects | Working | Web Audio beeps for till/water/plant/harvest/day |
| Tile highlight | Working | White outline on tile-in-front |

## What Survives the Migration (~40%)

These files are reused with minimal or no changes:

```
REUSED AS-IS:
  game/types.ts              — All enums + interfaces
  game/constants.ts          — Tile size, map dims, speeds, day duration, tint colors
  game/data/crops.ts         — Crop definitions (turnip, potato, cauliflower)
  game/hooks/useGameState.ts — useSyncExternalStore wrapper
  game/systems/InventoryManager.ts — Seed/harvest tracking (EventBus import updated)
  game/systems/SoundManager.ts     — Pure Web Audio, no Phaser dependency
  components/HUD.tsx         — Container overlay
  components/DayDisplay.tsx  — Day + time + progress bar
  components/ToolBar.tsx     — SVG tool icons
  components/InventoryPanel.tsx — Seed/harvest counts + selected seed
  main.tsx                   — React entry point
  server/* (all files)       — Express server unchanged

REUSED WITH CHANGES:
  game/events/EventBus.ts       — Phaser.Events.EventEmitter → mitt
  game/state/GameStateStore.ts  — EventBus import updated (same API)
  App.tsx                       — Phaser Game → R3F <FarmCanvas> + <HUD>
```

## What Gets Rebuilt (~60%)

These Phaser-specific files are replaced by R3F equivalents:

```
OLD (moved to _legacy/)              → NEW (3D replacement)
─────────────────────────────────────────────────────────────────
game/scenes/BootScene.ts             → (not needed — no texture generation)
game/scenes/GameScene.ts             → game/components3d/GameWorld.tsx
game/systems/TilemapManager.ts       → game/systems/FarmGrid.ts
                                       + game/components3d/TileGrid.tsx
game/systems/PlayerController.ts     → game/components3d/PlayerModel.tsx
                                       + game/hooks/useKeyboard.ts
game/systems/CropManager.ts          → game/systems/CropSystem.ts
                                       + game/components3d/CropMeshes.tsx
game/systems/ToolManager.ts          → game/systems/ToolSystem.ts
game/systems/TimeManager.ts          → game/hooks/useTimeOfDay.ts
                                       + game/components3d/DayNightLighting.tsx
game/config.ts                       → (not needed — R3F Canvas props in FarmCanvas)
```

## Architecture: Before vs After

### Before (Phaser 3)
```
App.tsx
├── Phaser.Game (800×600 canvas)
│   ├── BootScene → generates textures → starts GameScene
│   └── GameScene (orchestrator)
│       ├── TilemapManager (Phaser.Tilemaps)
│       ├── PlayerController (Phaser.Sprite + keyboard)
│       ├── CropManager (Phaser.Sprites)
│       ├── ToolManager (Phaser keyboard events)
│       ├── TimeManager (Phaser.Rectangle overlay)
│       └── SoundManager (Web Audio)
├── <HUD /> overlays on top of Phaser canvas
└── GameStateStore bridges Phaser → React
```

### After (React Three Fiber)
```
App.tsx
├── <FarmCanvas /> (R3F <Canvas>)
│   ├── <TileGrid />       — reads FarmGrid, renders InstancedMesh
│   ├── <PlayerModel />    — useFrame movement, useKeyboard input
│   ├── <CropMeshes />     — reads FarmGrid.crop data, renders 3D shapes
│   ├── <DayNightLighting /> — useTimeOfDay hook drives light shifts
│   └── <GameWorld />      — orchestrator, wires systems
├── <HUD /> overlays (same as before)
│   ├── <DayDisplay />
│   ├── <ToolBar />
│   └── <InventoryPanel />
└── Pure logic layer (game/systems/)
    ├── FarmGrid      — tile data + mutation (no rendering)
    ├── CropSystem    — plant/water/grow/harvest (no rendering)
    ├── ToolSystem    — tool selection + dispatch
    ├── InventoryManager — seed/harvest counts
    ├── SoundManager  — Web Audio beeps
    ├── EventBus      — mitt (cross-system events)
    └── GameStateStore — React-synced state
```

## Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| EventBus replacement | `mitt` | 200 bytes, typed, same emit/on API, zero dependencies |
| Game loop | R3F `useFrame` | Built into framework, handles delta time |
| Tile rendering | `InstancedMesh` per type | 5 draw calls for 450 tiles (vs 450 individual meshes) |
| Player model | Composed `BoxGeometry` | No external model files, matches low-poly aesthetic |
| Interaction model | Keyboard grid (not raycasting) | Same feel as 2D version, simpler, proven |
| Camera | Orthographic isometric | Classic farming game angle, no perspective distortion |
| Old code disposal | `_legacy/` folder → delete in Phase 7 | Safe rollback until migration verified |

## Migration Timeline

- 2026-04-12: Phase 1 (Project Setup) completed
- 2026-04-13: Phase 2 (Core 2D Game Engine) started
- 2026-04-15: Phase 2 completed + polished
- 2026-04-16: Decision to migrate to 3D. Migration Phase 1 (Foundation) started
