"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Box } from "@react-three/drei";
import * as THREE from "three";

interface TreasureChest3DProps {
  type?: "common" | "rare" | "epic";
  onClick?: () => void;
}

export default function TreasureChest3D({
  type = "common",
  onClick,
}: TreasureChest3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Define materials based on chest type
  const getMaterialColor = () => {
    switch (type) {
      case "epic":
        return {
          color: 0x00ffff,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0x004444,
        };
      case "rare":
        return {
          color: 0xffd700,
          metalness: 0.6,
          roughness: 0.3,
        };
      default: // common
        return {
          color: 0x8b4513,
          metalness: 0.1,
          roughness: 0.8,
        };
    }
  };

  const materialProps = getMaterialColor();

  useFrame((state) => {
    if (groupRef.current) {
      // Floating animation
      groupRef.current.position.y =
        Math.sin(state.clock.getElapsedTime() * 2) * 0.1;

      // Gentle rotation
      groupRef.current.rotation.y =
        Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} onClick={onClick} scale={[0.5, 0.5, 0.5]}>
      {/* Simple box chest */}
      <Box args={[1.2, 0.8, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial {...materialProps} />
      </Box>

      <Box args={[1.2, 0.2, 0.8]} position={[0, 0.5, 0]}>
        <meshStandardMaterial {...materialProps} />
      </Box>

      {/* Decorative elements for epic chests */}
      {type === "epic" && (
        <>
          {/* Glowing particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI) / 4) * 0.8,
                Math.sin(Date.now() * 0.002 + i) * 0.1 + 0.5,
                Math.sin((i * Math.PI) / 4) * 0.8,
              ]}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial
                color={0x00ffff}
                emissive={0x00ffff}
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Decorative elements for rare chests */}
      {type === "rare" && (
        <>
          {/* Gold trim */}
          <Box args={[1.25, 0.05, 0.85]} position={[0, 0.4, 0]}>
            <meshStandardMaterial
              color={0xffd700}
              metalness={0.8}
              roughness={0.2}
            />
          </Box>
          <Box args={[1.25, 0.05, 0.85]} position={[0, -0.4, 0]}>
            <meshStandardMaterial
              color={0xffd700}
              metalness={0.8}
              roughness={0.2}
            />
          </Box>
        </>
      )}
    </group>
  );
}
