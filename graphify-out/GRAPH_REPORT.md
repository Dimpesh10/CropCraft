# Graph Report - .  (2026-04-25)

## Corpus Check
- Corpus is ~13,164 words - fits in a single context window. You may not need a graph.

## Summary
- 206 nodes · 250 edges · 16 communities detected
- Extraction: 83% EXTRACTED · 17% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App Shell & AI Advisor UI|App Shell & AI Advisor UI]]
- [[_COMMUNITY_Core Game Systems (PlayerCropsInventory)|Core Game Systems (Player/Crops/Inventory)]]
- [[_COMMUNITY_Game Actions & Tile Grid|Game Actions & Tile Grid]]
- [[_COMMUNITY_SDG Tracking System|SDG Tracking System]]
- [[_COMMUNITY_Render Canvas & AudioDB IO|Render Canvas & Audio/DB I/O]]
- [[_COMMUNITY_AI Advisor Architecture|AI Advisor Architecture]]
- [[_COMMUNITY_Tutorial System|Tutorial System]]
- [[_COMMUNITY_Project Docs & Design Rationale|Project Docs & Design Rationale]]
- [[_COMMUNITY_AdvisorService Class|AdvisorService Class]]
- [[_COMMUNITY_DayNight Lighting|Day/Night Lighting]]
- [[_COMMUNITY_SDG & Tutorial Data|SDG & Tutorial Data]]
- [[_COMMUNITY_GameEvents type map|GameEvents type map]]
- [[_COMMUNITY_buildGrid helper|buildGrid helper]]
- [[_COMMUNITY_gridToWorld3D helper|gridToWorld3D helper]]
- [[_COMMUNITY_SoundManager (Web Audio)|SoundManager (Web Audio)]]
- [[_COMMUNITY_Tone presets|Tone presets]]

## God Nodes (most connected - your core abstractions)
1. `Farm 3D Canvas` - 11 edges
2. `EventBus (mitt singleton)` - 10 edges
3. `tryUnlock()` - 8 edges
4. `HUD Container` - 8 edges
5. `Player 3D Model` - 8 edges
6. `GameStateStore singleton` - 8 edges
7. `completeStep()` - 7 edges
8. `Game Types & Enums` - 7 edges
9. `FarmGrid module (singleton grid)` - 7 edges
10. `advisorRouter (POST /chat)` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Rationale: InstancedMesh tile rendering` --rationale_for--> `FarmGrid module (singleton grid)`  [INFERRED]
  MIGRATION.md → client/src/game/systems/FarmGrid.ts
- `Phase 8: AI Farming Advisor` --references--> `advisorRouter (POST /chat)`  [INFERRED]
  ROADMAP.md → server/src/routes/advisor.ts
- `Rationale: mitt for EventBus` --rationale_for--> `EventBus (mitt singleton)`  [EXTRACTED]
  MIGRATION.md → client/src/game/events/EventBus.ts
- `Phase 8: AI Farming Advisor` --references--> `AdvisorService.sendMessage`  [INFERRED]
  ROADMAP.md → client/src/game/systems/AdvisorService.ts
- `Rationale: keyboard grid interaction` --rationale_for--> `handleInteraction`  [INFERRED]
  MIGRATION.md → client/src/game/systems/ToolSystem.ts

## Hyperedges (group relationships)
- **HUD Overlay Composition** — hud, day_display, toolbar, inventory_panel, advisor_panel, sdg_journal, sdg_toast, tutorial_guide [EXTRACTED 1.00]
- **R3F Scene Graph Composition** — farm_canvas, tile_grid, crop_meshes, day_night_lighting, player_model, camera_follow [EXTRACTED 1.00]
- **SDG Educational Unlock Pipeline** — sdg_facts_data, sdg_manager, sdg_toast, sdg_journal, event_bus [INFERRED 0.90]
- **Plant action flow (key 3 â†’ seed in tile)** — ToolSystem_handleInteraction, CropSystem_initCropSystem, CropSystem_plantCrop, InventoryManager_class, eventbus_EventBus, FarmGrid_module [EXTRACTED 0.90]
- **AI Advisor request pipeline** — AdvisorService_buildGameContext, AdvisorService_sendMessage, server_advisorRouter, server_formatGameState, server_STATIC_SYSTEM_PROMPT, concept_anthropic_claude_api [EXTRACTED 0.95]
- **SDG fact unlock flow** — eventbus_EventBus, SdgManager_singleton, SdgManager_tryUnlock, SdgManager_persistence, eventbus_SdgFactPayload [EXTRACTED 0.90]

## Communities

### Community 0 - "App Shell & AI Advisor UI"
Cohesion: 0.09
Nodes (37): AI Advisor Panel, AdvisorService Client, Agricultural Literacy Concept, App Root Component, Backend API Proxy (port 3001), CameraFollow Helper, Game Constants, Crop Definitions Data (+29 more)

### Community 1 - "Core Game Systems (Player/Crops/Inventory)"
Cohesion: 0.09
Nodes (14): advanceDay(), harvestCrop(), plantCrop(), buildGrid(), bumpGridVersion(), getFarmGrid(), getTile(), isBlocked() (+6 more)

### Community 2 - "Game Actions & Tile Grid"
Cohesion: 0.12
Nodes (26): buildGameContext, advanceDay, harvestCrop, initCropSystem, plantCrop, waterCrop, FarmGrid module (singleton grid), setTileType (+18 more)

### Community 3 - "SDG Tracking System"
Cohesion: 0.26
Nodes (12): buildContext(), freshDayStats(), notify(), onDayEnd(), onHarvest(), onPlant(), onTill(), onWater() (+4 more)

### Community 4 - "Render Canvas & Audio/DB I/O"
Cohesion: 0.19
Nodes (8): connectDB(), onDay(), onHarvest(), onPlant(), onTill(), onWater(), start(), SoundManager

### Community 5 - "AI Advisor Architecture"
Cohesion: 0.2
Nodes (12): AdvisorError class, AdvisorService.sendMessage, Anthropic Claude API, MongoDB optional design, Phase 8: AI Farming Advisor, Phase 9: Game State Persistence, GameContext interface (server), Sage system prompt (+4 more)

### Community 6 - "Tutorial System"
Cohesion: 0.35
Nodes (9): completeStep(), endTutorial(), handlePlanted(), handleTilled(), handleToolChanged(), handleWatered(), notify(), rebuildSnapshot() (+1 more)

### Community 7 - "Project Docs & Design Rationale"
Cohesion: 0.33
Nodes (4): CLAUDE.md project guide, client index.html, Rationale: composed BoxGeometry player, Rationale: orthographic isometric camera

### Community 8 - "AdvisorService Class"
Cohesion: 0.5
Nodes (3): AdvisorError, buildGameContext(), sendMessage()

### Community 9 - "Day/Night Lighting"
Cohesion: 0.67
Nodes (2): computeTimeOfDay(), getLerpedPreset()

### Community 14 - "SDG & Tutorial Data"
Cohesion: 0.67
Nodes (3): SDGS map (5 goals), TUTORIAL_STEPS, UN Sustainable Development Goals

### Community 33 - "GameEvents type map"
Cohesion: 1.0
Nodes (1): GameEvents type map

### Community 34 - "buildGrid helper"
Cohesion: 1.0
Nodes (1): buildGrid

### Community 35 - "gridToWorld3D helper"
Cohesion: 1.0
Nodes (1): gridToWorld3D

### Community 36 - "SoundManager (Web Audio)"
Cohesion: 1.0
Nodes (1): SoundManager (Web Audio)

### Community 37 - "Tone presets"
Cohesion: 1.0
Nodes (1): Tone presets

## Knowledge Gaps
- **34 isolated node(s):** `Vite Config`, `React Entry Point`, `TileLayer InstancedMesh`, `CropModel Stage Renderer`, `UN Sustainable Development Goals` (+29 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Day/Night Lighting`** (4 nodes): `DayNightLighting.tsx`, `computeTimeOfDay()`, `DayNightLighting()`, `getLerpedPreset()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GameEvents type map`** (1 nodes): `GameEvents type map`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `buildGrid helper`** (1 nodes): `buildGrid`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `gridToWorld3D helper`** (1 nodes): `gridToWorld3D`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `SoundManager (Web Audio)`** (1 nodes): `SoundManager (Web Audio)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tone presets`** (1 nodes): `Tone presets`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getFarmGrid()` connect `Core Game Systems (Player/Crops/Inventory)` to `AdvisorService Class`, `SDG Tracking System`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `onDayEnd()` connect `SDG Tracking System` to `Core Game Systems (Player/Crops/Inventory)`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `Vite Config`, `React Entry Point`, `TileLayer InstancedMesh` to the rest of the system?**
  _34 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell & AI Advisor UI` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Core Game Systems (Player/Crops/Inventory)` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Game Actions & Tile Grid` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._