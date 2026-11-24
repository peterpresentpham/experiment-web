'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { BOARD_FILES, isDarkSquare, squareToXZ } from 'src/lib/chess/board';
import type { TChessFrame, TChessPiece, TChessSquare } from 'src/types/chess.type';
import ChessPiece3D from './ChessPiece3D';

const SQUARES: Array<TChessSquare> = BOARD_FILES.flatMap((file) =>
  [1, 2, 3, 4, 5, 6, 7, 8].map((rank) => `${file}${rank}`)
);

function labelTexture(text: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#e9e2d0';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 32, 34);
  return new THREE.CanvasTexture(canvas);
}

function Labels() {
  const textures = useMemo(() => {
    const files = BOARD_FILES.map((file, i) => ({ key: file, text: file, x: i - 3.5, z: 4.25 }));
    const ranks = [1, 2, 3, 4, 5, 6, 7, 8].map((rank) => ({
      key: String(rank),
      text: String(rank),
      x: -4.25,
      z: 4.5 - rank,
    }));
    return [...files, ...ranks].map((item) => ({ ...item, map: labelTexture(item.text) }));
  }, []);

  return (
    <>
      {textures.map((item) => (
        <mesh key={item.key} position={[item.x, 0.02, item.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial map={item.map} transparent />
        </mesh>
      ))}
    </>
  );
}

function Marker({
  square,
  color,
  shape,
}: {
  square: TChessSquare;
  color: string;
  shape: 'tile' | 'dot' | 'ring';
}) {
  const [x, z] = squareToXZ(square);
  return (
    <mesh position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
      {shape == 'tile' && <planeGeometry args={[1, 1]} />}
      {shape == 'dot' && <circleGeometry args={[0.2, 24]} />}
      {shape == 'ring' && <ringGeometry args={[0.34, 0.46, 32]} />}
      <meshBasicMaterial color={color} transparent opacity={shape == 'tile' ? 0.45 : 0.85} />
    </mesh>
  );
}

type TProps = {
  frame: TChessFrame;
  /** Every piece that ever appears in the line, so captured ones can shrink away. */
  allPieces: Array<{ piece: TChessPiece; present: boolean }>;
  targets: Array<TChessSquare>;
  marks: Array<TChessSquare>;
  from?: TChessSquare;
};

/** The 3D board: drag to orbit, scroll or pinch to zoom. White starts at the bottom. */
export default function Chess3DBoard({ frame, allPieces, targets, marks, from }: TProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 11, 10.3], fov: 40 }}
      className="cursor-grab touch-none active:cursor-grabbing"
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 10, 6]} intensity={2.2} />
      <directionalLight position={[-6, 6, -4]} intensity={0.6} />

      <mesh position={[0, -0.16, 0]}>
        <boxGeometry args={[9, 0.3, 9]} />
        <meshStandardMaterial color="#3b2a1d" roughness={0.7} />
      </mesh>
      {SQUARES.map((square) => {
        const [x, z] = squareToXZ(square);
        return (
          <mesh key={square} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial color={isDarkSquare(square) ? '#8a6a4b' : '#e8d9b5'} />
          </mesh>
        );
      })}
      <Labels />

      {frame.lastMove.map((square) => (
        <Marker key={`last-${square}`} square={square} color="#f2d544" shape="tile" />
      ))}
      {from && <Marker square={from} color="#f2d544" shape="tile" />}
      {frame.check && <Marker square={frame.check} color="#e5484d" shape="tile" />}
      {targets.map((square) => (
        <Marker key={`target-${square}`} square={square} color="#2fb36b" shape="dot" />
      ))}
      {marks.map((square) => (
        <Marker key={`mark-${square}`} square={square} color="#e5484d" shape="ring" />
      ))}

      {allPieces.map(({ piece, present }) => (
        <ChessPiece3D key={piece.id} piece={piece} present={present} />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
