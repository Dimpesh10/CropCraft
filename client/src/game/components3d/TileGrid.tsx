import { useRef, useMemo, useEffect, useState } from 'react';
import { InstancedMesh, Color, Object3D, BoxGeometry, MeshStandardMaterial } from 'three';
import { useFrame } from '@react-three/fiber';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';
import { TileType } from '../types';
import { getFarmGrid, getGridVersion } from '../systems/FarmGrid';

const TILE_COLORS: Record<TileType, string> = {
  [TileType.GRASS]: '#4caf50',
  [TileType.DIRT]: '#8b6b3f',
  [TileType.TILLED]: '#6b4a26',
  [TileType.WATERED]: '#3d2814',
  [TileType.WATER_SOURCE]: '#2e7fbf',
};

const TILE_HEIGHT: Record<TileType, number> = {
  [TileType.GRASS]: 0.3,
  [TileType.DIRT]: 0.22,
  [TileType.TILLED]: 0.18,
  [TileType.WATERED]: 0.18,
  [TileType.WATER_SOURCE]: 0.08,
};

const dummy = new Object3D();
const totalTiles = MAP_WIDTH * MAP_HEIGHT;

function TileLayer({ tileType }: { tileType: TileType }) {
  const meshRef = useRef<InstancedMesh>(null);
  const [lastVersion, setLastVersion] = useState(-1);

  const geometry = useMemo(() => new BoxGeometry(1, TILE_HEIGHT[tileType], 1), [tileType]);
  const material = useMemo(
    () => new MeshStandardMaterial({ color: new Color(TILE_COLORS[tileType]) }),
    [tileType],
  );

  const updateInstances = () => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const grid = getFarmGrid();
    let count = 0;

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (grid[y][x].type === tileType) {
          const h = TILE_HEIGHT[tileType];
          dummy.position.set(x + 0.5, h / 2, y + 0.5);
          dummy.updateMatrix();
          mesh.setMatrixAt(count, dummy.matrix);
          count++;
        }
      }
    }

    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
  };

  useEffect(() => {
    updateInstances();
  }, []);

  useFrame(() => {
    const v = getGridVersion();
    if (v !== lastVersion) {
      setLastVersion(v);
      updateInstances();
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, totalTiles]} />
  );
}

export function TileGrid() {
  const tileTypes = [
    TileType.GRASS,
    TileType.DIRT,
    TileType.TILLED,
    TileType.WATERED,
    TileType.WATER_SOURCE,
  ];

  return (
    <group>
      {tileTypes.map((tt) => (
        <TileLayer key={tt} tileType={tt} />
      ))}
    </group>
  );
}
