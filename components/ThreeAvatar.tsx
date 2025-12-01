import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const Model = ({ url, isSpeaking }) => {
  // Cast to any to avoid TypeScript error where it thinks result might be an array
  const { scene } = useGLTF(url) as any;
  // Use a generic ref but cast it in usage if needed, or rely on THREE types if environment supports it.
  // Using 'any' for the ref to avoid TS issues in stricter non-transpiled environments if generic syntax fails.
  const meshRef = useRef<any>(null);

  // Clone scene to avoid potential issues if component remounts
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame((state) => {
    if (meshRef.current) {
      // Idle Animation: Gentle floating
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = Math.sin(time * 1.5) * 0.05;

      // Speaking Animation: Rhythmic squash and stretch (simulating excitement/talking)
      if (isSpeaking) {
         const speed = 15;
         // Scale Y goes up, Scale XZ goes down to preserve volume roughly
         const bounce = Math.sin(time * speed) * 0.05;
         const scaleY = 1 + bounce;
         const scaleXZ = 1 - bounce * 0.5;
         
         const targetScale = new THREE.Vector3(scaleXZ, scaleY, scaleXZ);
         meshRef.current.scale.lerp(targetScale, 0.2);
      } else {
         // Return to normal
         const targetScale = new THREE.Vector3(1, 1, 1);
         meshRef.current.scale.lerp(targetScale, 0.1);
      }
    }
  });

  return React.createElement("primitive", {
      ref: meshRef,
      object: clonedScene,
      rotation: [0, 0, 0]
  });
};

const ThreeAvatar = ({ isSpeaking }) => {
  const modelUrl = "692dd6f0134036151dcdc8f1.glb";

  return React.createElement(
    "div",
    { className: "w-full h-full relative" },
    React.createElement(
      Canvas,
      { shadows: true, camera: { position: [0, 1, 4], fov: 45 } },
      React.createElement("ambientLight", { intensity: 0.7 }),
      React.createElement("spotLight", { position: [10, 10, 10], angle: 0.15, penumbra: 1, intensity: 1, castShadow: true }),
      React.createElement("pointLight", { position: [-10, -5, -10], intensity: 0.5, color: "white" }),
      
      React.createElement(Environment, { preset: "city" }),

      React.createElement(
        Suspense,
        { fallback: null },
        React.createElement(
          Center,
          { top: true },
          React.createElement(Model, { url: modelUrl, isSpeaking: isSpeaking })
        )
      ),
      
      React.createElement(ContactShadows, { opacity: 0.4, scale: 10, blur: 2.5, far: 10, resolution: 256, color: "#000000" }),
      
      React.createElement(OrbitControls, { 
          enablePan: false, 
          minPolarAngle: Math.PI / 4, 
          maxPolarAngle: Math.PI / 1.5,
          minDistance: 2,
          maxDistance: 8
      })
    ),
    
    React.createElement(
      "div",
      { className: "absolute bottom-4 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded-full pointer-events-none" },
      "Interactive 3D"
    )
  );
};

export default ThreeAvatar;