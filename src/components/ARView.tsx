"use client";

import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';

interface ARViewProps {
  isVisible: boolean;
  onCollect: () => void;
}

function TreasureChest() {
  // Note: You'll need to add a treasure chest 3D model
  // const { scene } = useGLTF('/models/treasure-chest.glb');
  
  return (
    <mesh position={[0, 0, -5]} scale={[1, 1, 1]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gold" />
    </mesh>
  );
}

export default function ARView({ isVisible, onCollect }: ARViewProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      <Canvas>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <TreasureChest />
          <OrbitControls />
        </Suspense>
      </Canvas>
      
      <button
        onClick={onCollect}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-lg bg-purple-600 px-6 py-3 text-white shadow-lg"
      >
        Collect Treasure
      </button>
    </div>
  );
}
