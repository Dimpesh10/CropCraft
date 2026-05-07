import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { MAP_WIDTH, MAP_HEIGHT, PLAYER_SPEED } from '../constants';
import { Direction } from '../types';
import { useKeyboard } from '../hooks/useKeyboard';
import { isBlocked, gridToWorld3D } from '../systems/FarmGrid';
import { handleInteraction } from '../systems/ToolSystem';
import { TutorialManager } from '../systems/TutorialManager';

const FACING_ROTATION: Record<Direction, number> = {
  [Direction.DOWN]: 0,
  [Direction.UP]: Math.PI,
  [Direction.LEFT]: Math.PI / 2,
  [Direction.RIGHT]: -Math.PI / 2,
};

export interface PlayerRef {
  position: Vector3;
  facing: Direction;
  getFrontTile: () => { x: number; y: number } | null;
}

export function PlayerModel({
  onUpdate,
}: {
  onUpdate?: (ref: PlayerRef) => void;
}) {
  const groupRef = useRef<Group>(null);
  const keys = useKeyboard();
  const facing = useRef<Direction>(Direction.DOWN);
  const highlightRef = useRef<Group>(null);

  // spawn at center of farm
  const spawnPos = gridToWorld3D(Math.floor(MAP_WIDTH / 2), Math.floor(MAP_HEIGHT / 2));
  const pos = useRef(new Vector3(spawnPos.x, 0, spawnPos.z));

  // handle space/E for tool interaction
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyE') {
        handleInteraction(getFrontTile());
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const getFrontTile = (): { x: number; y: number } | null => {
    const gx = Math.floor(pos.current.x);
    const gz = Math.floor(pos.current.z);
    let dx = 0, dz = 0;
    switch (facing.current) {
      case Direction.UP: dz = -1; break;
      case Direction.DOWN: dz = 1; break;
      case Direction.LEFT: dx = -1; break;
      case Direction.RIGHT: dx = 1; break;
    }
    const tx = gx + dx;
    const tz = gz + dz;
    if (tx < 0 || tz < 0 || tx >= MAP_WIDTH || tz >= MAP_HEIGHT) return null;
    return { x: tx, y: tz };
  };

  useFrame((_, delta) => {
    const k = keys.current;
    let vx = 0, vz = 0;

    if (k.has('KeyW') || k.has('ArrowUp')) vz -= 1;
    if (k.has('KeyS') || k.has('ArrowDown')) vz += 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) vx -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) vx += 1;

    if (vx !== 0 && vz !== 0) {
      const inv = 1 / Math.sqrt(2);
      vx *= inv;
      vz *= inv;
    }

    if (vx !== 0 || vz !== 0) {
      TutorialManager.onMove();
    }

    // update facing
    if (vz < 0) facing.current = Direction.UP;
    else if (vz > 0) facing.current = Direction.DOWN;
    else if (vx < 0) facing.current = Direction.LEFT;
    else if (vx > 0) facing.current = Direction.RIGHT;

    // scale speed: PLAYER_SPEED is in px (32px tiles), convert to world units (1 unit = 1 tile)
    const speed = (PLAYER_SPEED / 32) * delta;
    const newX = pos.current.x + vx * speed;
    const newZ = pos.current.z + vz * speed;

    // clamp and block
    const margin = 0.3;
    const clampedX = Math.max(margin, Math.min(MAP_WIDTH - margin, newX));
    const clampedZ = Math.max(margin, Math.min(MAP_HEIGHT - margin, newZ));

    const gxNew = Math.floor(clampedX);
    const gzNew = Math.floor(clampedZ);

    if (!isBlocked(gxNew, Math.floor(pos.current.z))) {
      pos.current.x = clampedX;
    }
    if (!isBlocked(Math.floor(pos.current.x), gzNew)) {
      pos.current.z = clampedZ;
    }

    // update group
    if (groupRef.current) {
      groupRef.current.position.set(pos.current.x, 0, pos.current.z);
      groupRef.current.rotation.y = FACING_ROTATION[facing.current];
    }

    // update highlight
    if (highlightRef.current) {
      const front = getFrontTile();
      if (front && !isBlocked(front.x, front.y)) {
        highlightRef.current.visible = true;
        highlightRef.current.position.set(front.x + 0.5, 0.08, front.y + 0.5);
      } else {
        highlightRef.current.visible = false;
      }
    }

    // notify parent
    onUpdate?.({
      position: pos.current.clone(),
      facing: facing.current,
      getFrontTile,
    });
  });

  return (
    <>
      <group ref={groupRef} position={[spawnPos.x, 0, spawnPos.z]}>
        {/* legs */}
        <mesh position={[-0.12, 0.18, 0]}>
          <boxGeometry args={[0.14, 0.36, 0.14]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        <mesh position={[0.12, 0.18, 0]}>
          <boxGeometry args={[0.14, 0.36, 0.14]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        {/* body */}
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[0.4, 0.36, 0.24]} />
          <meshStandardMaterial color="#3a6fdc" />
        </mesh>
        {/* head */}
        <mesh position={[0, 0.82, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#f2c48c" />
        </mesh>
        {/* hair */}
        <mesh position={[0, 0.92, 0]}>
          <boxGeometry args={[0.32, 0.12, 0.32]} />
          <meshStandardMaterial color="#4a2e18" />
        </mesh>
      </group>

      {/* tile highlight */}
      <group ref={highlightRef} visible={false}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.98, 0.02, 0.98]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.5}
            wireframe
          />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.98, 0.02, 0.98]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.25}
          />
        </mesh>
      </group>
    </>
  );
}
