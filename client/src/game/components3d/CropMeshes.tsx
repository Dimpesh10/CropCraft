import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';
import { CropStage } from '../types';
import { getFarmGrid, getGridVersion } from '../systems/FarmGrid';
import { CROP_DEFS } from '../data/crops';

interface CropRenderData {
  x: number;
  z: number;
  stage: CropStage;
  color: number;
}

function CropModel({ stage, color }: { stage: CropStage; color: number }) {
  switch (stage) {
    case CropStage.SEED:
      return (
        <mesh position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      );
    case CropStage.SPROUT:
      return (
        <mesh position={[0, 0.22, 0]}>
          <coneGeometry args={[0.06, 0.15, 6]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      );
    case CropStage.GROWING:
      return (
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.3, 8]} />
          <meshStandardMaterial color="#2E8B57" />
        </mesh>
      );
    case CropStage.MATURE:
      return (
        <group>
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.3, 8]} />
            <meshStandardMaterial color="#2E8B57" />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color={new Color(color)} />
          </mesh>
        </group>
      );
  }
}

export function CropMeshes() {
  const lastVersion = useRef(-1);
  const [crops, setCrops] = useState<CropRenderData[]>([]);

  useFrame(() => {
    const v = getGridVersion();
    if (v === lastVersion.current) return;
    lastVersion.current = v;

    const grid = getFarmGrid();
    const next: CropRenderData[] = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = grid[y][x];
        if (tile.crop) {
          const def = CROP_DEFS[tile.crop.defKey];
          next.push({
            x,
            z: y,
            stage: tile.crop.stage,
            color: def?.color ?? 0xffffff,
          });
        }
      }
    }

    setCrops(next);
  });

  return (
    <group>
      {crops.map((c) => (
        <group key={`${c.x}-${c.z}`} position={[c.x + 0.5, 0, c.z + 0.5]}>
          <CropModel stage={c.stage} color={c.color} />
        </group>
      ))}
    </group>
  );
}
