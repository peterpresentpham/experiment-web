'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { squareToXZ } from 'src/lib/chess/board';
import type { TChessPiece, TChessPieceType } from 'src/types/chess.type';

type TProfile = Array<[number, number]>;

// Radius/height profiles revolved around the vertical axis. Heights are in board squares.
const PROFILES: Record<Exclude<TChessPieceType, 'n'>, TProfile> = {
  p: [
    [0, 0],
    [0.34, 0],
    [0.34, 0.08],
    [0.24, 0.16],
    [0.13, 0.42],
    [0.22, 0.48],
    [0, 0.48],
  ],
  r: [
    [0, 0],
    [0.37, 0],
    [0.37, 0.1],
    [0.27, 0.2],
    [0.24, 0.66],
    [0.34, 0.74],
    [0.34, 0.9],
    [0, 0.9],
  ],
  b: [
    [0, 0],
    [0.35, 0],
    [0.35, 0.1],
    [0.23, 0.2],
    [0.12, 0.58],
    [0.22, 0.66],
    [0, 0.66],
  ],
  q: [
    [0, 0],
    [0.38, 0],
    [0.38, 0.1],
    [0.26, 0.2],
    [0.14, 0.78],
    [0.32, 0.96],
    [0, 0.96],
  ],
  k: [
    [0, 0],
    [0.38, 0],
    [0.38, 0.1],
    [0.26, 0.2],
    [0.15, 0.85],
    [0.3, 1.02],
    [0, 1.02],
  ],
};

const geometryCache = new Map<string, THREE.BufferGeometry>();

function lathe(type: keyof typeof PROFILES) {
  let geometry = geometryCache.get(type);
  if (!geometry) {
    geometry = new THREE.LatheGeometry(
      PROFILES[type].map(([r, y]) => new THREE.Vector2(r, y)),
      28
    );
    geometryCache.set(type, geometry);
  }
  return geometry;
}

function PieceShape({ type, color }: { type: TChessPieceType; color: THREE.Color }) {
  const material = <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />;

  if (type == 'n') {
    return (
      <group>
        <mesh geometry={lathe('p')} scale={[1, 0.45, 1]}>
          {material}
        </mesh>
        <mesh position={[0, 0.46, 0.02]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.3, 0.55, 0.36]} />
          {material}
        </mesh>
        <mesh position={[0, 0.8, -0.14]} rotation={[-0.25, 0, 0]}>
          <boxGeometry args={[0.28, 0.3, 0.5]} />
          {material}
        </mesh>
        <mesh position={[0, 0.7, -0.4]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.24, 0.2, 0.22]} />
          {material}
        </mesh>
        <mesh position={[0, 1.0, 0.02]}>
          <boxGeometry args={[0.08, 0.16, 0.2]} />
          {material}
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh geometry={lathe(type)}>{material}</mesh>
      {type == 'p' && (
        <mesh position={[0, 0.58, 0]}>
          <sphereGeometry args={[0.19, 20, 16]} />
          {material}
        </mesh>
      )}
      {type == 'r' &&
        [0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 2) * 0.26,
              0.96,
              Math.sin((i * Math.PI) / 2) * 0.26,
            ]}
          >
            <boxGeometry args={[0.14, 0.12, 0.14]} />
            {material}
          </mesh>
        ))}
      {type == 'b' && (
        <>
          <mesh position={[0, 0.86, 0]} scale={[1, 1.35, 1]}>
            <sphereGeometry args={[0.19, 20, 16]} />
            {material}
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <sphereGeometry args={[0.06, 12, 10]} />
            {material}
          </mesh>
        </>
      )}
      {type == 'q' && (
        <>
          <mesh position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.05, 10, 24]} />
            {material}
          </mesh>
          <mesh position={[0, 1.14, 0]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            {material}
          </mesh>
        </>
      )}
      {type == 'k' && (
        <>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.1, 0.32, 0.1]} />
            {material}
          </mesh>
          <mesh position={[0, 1.26, 0]}>
            <boxGeometry args={[0.28, 0.1, 0.1]} />
            {material}
          </mesh>
        </>
      )}
    </group>
  );
}

const WHITE = new THREE.Color('#f3ecd9');
const BLACK = new THREE.Color('#4a4a56');

type TProps = {
  piece: TChessPiece;
  /** False once the piece is captured: it shrinks away on its last square. */
  present: boolean;
};

/** One piece that glides to its square, hopping a little, and shrinks away when captured. */
export default function ChessPiece3D({ piece, present }: TProps) {
  const group = useRef<THREE.Group>(null);
  const [x, z] = useMemo(() => squareToXZ(piece.square), [piece.square]);
  const placed = useRef(false);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    // First frame: appear on the square instead of gliding in from the origin.
    if (!placed.current) {
      node.position.set(x, 0.15, z);
      placed.current = true;
    }
    node.position.x = THREE.MathUtils.damp(node.position.x, x, 9, delta);
    node.position.z = THREE.MathUtils.damp(node.position.z, z, 9, delta);
    const distance = Math.hypot(node.position.x - x, node.position.z - z);
    node.position.y = 0.15 + Math.min(distance, 1.5) * 0.35;
    const scale = THREE.MathUtils.damp(node.scale.x, present ? 1 : 0.001, 10, delta);
    node.scale.setScalar(scale);
  });

  return (
    <group ref={group} rotation={[0, piece.color == 'w' ? 0 : Math.PI, 0]}>
      <PieceShape type={piece.type} color={piece.color == 'w' ? WHITE : BLACK} />
    </group>
  );
}
