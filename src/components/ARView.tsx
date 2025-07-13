"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Text } from "@react-three/drei";
import TreasureChest3D from "./TreasureChest3D";

const Scene = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

interface ARViewProps {
  chestType?: "common" | "rare" | "epic";
  onCollect?: () => void;
  isCollected?: boolean;
}

function ARScene({ chestType, onCollect, isCollected }: ARViewProps) {
  const [showCollectText, setShowCollectText] = useState(false);

  const handleChestClick = () => {
    if (!isCollected && onCollect) {
      onCollect();
    }
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />

      <TreasureChest3D type={chestType} onClick={handleChestClick} />

      <Text
        position={[0, -2, 0]}
        fontSize={0.4}
        color={isCollected ? "#888" : "white"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {isCollected ? "Already Collected" : "Click to Collect"}
      </Text>

      {/* AR environment effects */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.3} />
      </mesh>
    </>
  );
}

export default function ARView({
  chestType = "common",
  onCollect,
  isCollected = false,
}: ARViewProps) {
  const [hasCamera, setHasCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for camera access
    if (typeof navigator !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          setHasCamera(true);
          setIsLoading(false);
        })
        .catch(() => {
          setHasCamera(false);
          setIsLoading(false);
        });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading camera...</p>
        </div>
      </div>
    );
  }

  if (!hasCamera) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800 mb-4">
            Camera Access Required
          </p>
          <p className="text-gray-600">
            Please allow camera access to use the AR features and collect
            treasures.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
      <Suspense
        fallback={
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading AR view...</p>
            </div>
          </div>
        }
      >
        <Scene camera={{ position: [0, 0, 5], fov: 75 }}>
          <ARScene
            chestType={chestType}
            onCollect={onCollect}
            isCollected={isCollected}
          />
        </Scene>
      </Suspense>

      {/* AR Guide Overlay */}
      <div className="absolute top-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg backdrop-blur-sm">
        <p className="text-sm">
          {isCollected
            ? "This treasure has already been collected"
            : "Point your camera at the treasure location and click to collect"}
        </p>
      </div>

      {/* Chest type indicator */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full backdrop-blur-sm">
        <span className="text-xs font-semibold capitalize">{chestType}</span>
      </div>
    </div>
  );
}
