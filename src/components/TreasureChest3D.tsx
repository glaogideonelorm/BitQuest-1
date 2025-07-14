"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
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
  const [modelLoaded, setModelLoaded] = useState(false);

  // Load the GLB model with error handling
  const gltf = useGLTF("/models/chest.glb") as any;

  useEffect(() => {
    console.log("GLTF loaded:", gltf);
    if (gltf && gltf.scene) {
      console.log("GLTF scene found:", gltf.scene);
      setModelLoaded(true);
    }
  }, [gltf]);

  // Define materials based on chest type
  const getMaterialColor = () => {
    switch (type) {
      case "epic":
        return {
          color: 0x00ffff,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0x004444,
          emissiveIntensity: 0.3,
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

  // Create a custom material for the chest
  const chestMaterial = new THREE.MeshStandardMaterial(materialProps);

  // Function to apply material to all meshes in the model
  const applyMaterialToMeshes = (object: THREE.Object3D) => {
    let meshCount = 0;
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = chestMaterial;
        meshCount++;
        console.log(
          "Applied material to mesh:",
          child.name || `mesh_${meshCount}`
        );
      }
    });
    console.log(`Applied material to ${meshCount} meshes`);
  };

  // Clone the GLB scene and apply materials
  useEffect(() => {
    if (gltf && gltf.scene && groupRef.current) {
      console.log("Setting up GLB model...");
      // Clear existing children
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }

      // Clone the scene
      const clonedScene = gltf.scene.clone();
      console.log("Cloned scene:", clonedScene);
      applyMaterialToMeshes(clonedScene);

      // Add to our group
      groupRef.current.add(clonedScene);
      console.log("GLB model added to group");
    }
  }, [gltf, materialProps]);

  return (
    <group ref={groupRef} onClick={onClick} scale={[0.5, 0.5, 0.5]}>
      {/* GLB Model will be added here via useEffect */}

      {/* Decorative elements for epic chests */}
      {type === "epic" && (
        <>
          {/* Glowing particles around the chest */}
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI) / 6) * 1.2,
                Math.sin(Date.now() * 0.002 + i) * 0.1 + 0.3,
                Math.sin((i * Math.PI) / 6) * 1.2,
              ]}
            >
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial
                color={0x00ffff}
                emissive={0x00ffff}
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}

          {/* Epic glow effect */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial
              color={0x00ffff}
              emissive={0x00ffff}
              emissiveIntensity={0.1}
              transparent
              opacity={0.1}
              side={THREE.BackSide}
            />
          </mesh>
        </>
      )}

      {/* Decorative elements for rare chests */}
      {type === "rare" && (
        <>
          {/* Gold particles */}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI) / 3) * 1.0,
                Math.sin(Date.now() * 0.001 + i) * 0.05 + 0.2,
                Math.sin((i * Math.PI) / 3) * 1.0,
              ]}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshStandardMaterial
                color={0xffd700}
                emissive={0xffd700}
                emissiveIntensity={0.3}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Fallback simple chest if GLB fails to load */}
      {!modelLoaded && (
        <>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.8, 0.8]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.2, 0.2, 0.8]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        </>
      )}
    </group>
  );
}

// Preload the GLB model
useGLTF.preload("/models/chest.glb");
