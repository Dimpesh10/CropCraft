import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';
import { TileGrid } from './TileGrid';
import { CropMeshes } from './CropMeshes';
import { DayNightLighting } from './DayNightLighting';
import { PlayerModel, PlayerRef } from './PlayerModel';
import { initToolSystem } from '../systems/ToolSystem';
import { initCropSystem } from '../systems/CropSystem';
import { SdgManager } from '../systems/SdgManager';
import { QuizManager } from '../systems/QuizManager';
import { SoundManager } from '../systems/SoundManager';
import { EventBus, TILE_TILLED, TILE_WATERED, CROP_PLANTED, CROP_HARVESTED, DAY_ENDED } from '../events/EventBus';
import * as THREE from 'three';

const CENTER_X = MAP_WIDTH / 2;
const CENTER_Z = MAP_HEIGHT / 2;
// Lower angle: camera sits behind and above the player
// Old isometric: new THREE.Vector3(10, 14, 10)
const CAM_OFFSET = new THREE.Vector3(0, 8, 12);
const LERP_SPEED = 3;

function CameraFollow() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(CENTER_X, 0, CENTER_Z));
  const playerPos = useRef(new THREE.Vector3(CENTER_X, 0, CENTER_Z));

  const onPlayerUpdate = useCallback((ref: PlayerRef) => {
    playerPos.current.copy(ref.position);
  }, []);

  useFrame((_, delta) => {
    target.current.lerp(playerPos.current, 1 - Math.exp(-LERP_SPEED * delta));
    camera.position.set(
      target.current.x + CAM_OFFSET.x,
      CAM_OFFSET.y,
      target.current.z + CAM_OFFSET.z,
    );
    camera.lookAt(target.current.x, 0, target.current.z);
  });

  return <PlayerModel onUpdate={onPlayerUpdate} />;
}

export function FarmCanvas() {
  useEffect(() => {
    // SdgManager must register BEFORE CropSystem: on DAY_ENDED, mitt invokes
    // listeners in registration order. CropSystem's advanceDay() resets every
    // crop's wateredToday flag — so SdgManager has to read that state first.
    const sdgCleanup = SdgManager.init();
    // QuizManager registers AFTER SdgManager so the harvest fires SdgManager
    // first (potentially unlocking a fact) before the quiz reads the unlocked
    // snapshot to pick its question pool.
    const quizCleanup = QuizManager.init();
    const cleanup = initToolSystem();
    const cropCleanup = initCropSystem();

    const sound = new SoundManager();
    const onTill = () => sound.play('till');
    const onWater = () => sound.play('water');
    const onPlant = () => sound.play('plant');
    const onHarvest = () => sound.play('harvest');
    const onDay = () => sound.play('day');

    EventBus.on(TILE_TILLED, onTill);
    EventBus.on(TILE_WATERED, onWater);
    EventBus.on(CROP_PLANTED, onPlant);
    EventBus.on(CROP_HARVESTED, onHarvest);
    EventBus.on(DAY_ENDED, onDay);

    return () => {
      cleanup();
      cropCleanup();
      quizCleanup();
      sdgCleanup();
      EventBus.off(TILE_TILLED, onTill);
      EventBus.off(TILE_WATERED, onWater);
      EventBus.off(CROP_PLANTED, onPlant);
      EventBus.off(CROP_HARVESTED, onHarvest);
      EventBus.off(DAY_ENDED, onDay);
    };
  }, []);

  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ fov: 45, near: 0.1, far: 200, position: [CENTER_X, 8, CENTER_Z + 12] }}
      gl={{ antialias: true }}
    >
      <DayNightLighting />
      <TileGrid />
      <CropMeshes />
      <CameraFollow />
    </Canvas>
  );
}
