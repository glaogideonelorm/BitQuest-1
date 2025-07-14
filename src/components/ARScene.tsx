"use client";

import React, { useEffect, useRef } from "react";

interface Chest {
  lat: number;
  lng: number;
  type: "common" | "rare" | "epic";
  isCollected?: boolean;
}

interface ARSceneProps {
  chests: Chest[];
  userLocation?: { lat: number; lng: number } | null;
}

// Helper to get chest color by type
const getChestColor = (type: string) => {
  switch (type) {
    case "epic":
      return "#00ffff"; // Cyan
    case "rare":
      return "#ffd700"; // Gold
    default:
      return "#8b4513"; // Brown
  }
};

export default function ARScene({ chests, userLocation }: ARSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  // Only render AR.js scene if user is near at least one chest and locations are available
  let shouldShowAR = chests.length > 0 && userLocation;
  if (!shouldShowAR) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p>Get closer to the chest to enter AR mode!</p>
        </div>
      </div>
    );
  }

  // Render the AR.js + A-Frame scene with all chests
  return (
    <div ref={sceneRef} className="w-full h-full">
      <a-scene
        vr-mode-ui="enabled: false"
        embedded
        arjs="sourceType: webcam; videoTexture: true; debugUIEnabled: false"
        renderer="antialias: true; alpha: true"
        style={{ width: "100vw", height: "100vh" }}
      >
        <a-camera gps-new-camera="gpsMinDistance: 5" rotation-reader></a-camera>
        {chests.map((chest, idx) => {
          const chestId = `chest-entity-${chest.lat}-${chest.lng}`;
          return (
            <a-entity
              key={chestId}
              id={chestId}
              gps-new-entity-place={`latitude: ${chest.lat}; longitude: ${chest.lng}`}
              gltf-model="/models/chest.glb"
              scale="0.8 0.8 0.8"
              material={`color: ${getChestColor(chest.type)}`}
              visible={!chest.isCollected}
            />
          );
        })}
      </a-scene>
    </div>
  );
}
