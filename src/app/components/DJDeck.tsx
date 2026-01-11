// @ts-nocheck - TypeScript types for React Three Fiber should work after restarting TS server
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, RoundedBox, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Rotating turntable platter
function Turntable({ rotationSpeed = 1 }: { rotationSpeed?: number }) {
  const platterRef = useRef<THREE.Mesh>(null);
  const recordRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (platterRef.current) {
      platterRef.current.rotation.y += delta * rotationSpeed;
    }
    if (recordRef.current) {
      recordRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group>
      {/* Base turntable */}
      <mesh ref={platterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <cylinderGeometry args={[2, 2, 0.1, 32]} />
        <meshStandardMaterial color="#808080" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Vinyl record on top */}
      <mesh ref={recordRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.25, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.02, 64]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Center label */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Record grooves - concentric circles */}
      {Array.from({ length: 15 }).map((_, i) => {
        const radius = 0.35 + (i * 0.1);
        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.251, 0]}
          >
            <torusGeometry args={[radius, 0.005, 8, 64]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

// Control knobs
function Knob({ position, color = "#333" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    </group>
  );
}

// Fader/slider
function Fader({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial color="#222" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshStandardMaterial color="#444" metalness={0.7} />
      </mesh>
    </group>
  );
}

// GLTF Model component - replace '/models/your-deck.gltf' with your actual model path
function DeckModel({ modelPath, scale = 1 }: { modelPath: string; scale?: number }) {
  const { scene } = useGLTF(modelPath);
  
  // Clone the scene to avoid issues with multiple instances
  return (
    <group scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  );
}

// Main deck structure - now uses GLTF model
function Deck() {
  // Pioneer DJ Console GLTF model
  const modelPath = '/pioneer_dj_console/scene.gltf';
  const groupRef = useRef<THREE.Group>(null);
  
  // Animate rotation back and forth
  useFrame((_state, delta) => {
    if (groupRef.current) {
      // Use sine wave for smooth back-and-forth rotation
      // Adjust 0.3 for rotation speed, 0.5 for rotation range (in radians)
      groupRef.current.rotation.y = Math.sin(_state.clock.elapsedTime * 0.3) * 0.5;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Background circle - white with 30% opacity */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <circleGeometry args={[4.8, 32]} />
        <meshStandardMaterial color="#ffffff" opacity={0.3} transparent />
      </mesh>

      {/* GLTF Model - adjust scale here to make model smaller/larger */}
      <DeckModel modelPath={modelPath} scale={0.10} />

      {/* Enhanced lighting for better model visibility */}
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, 5, -5]} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={1} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
    </group>
  );
}

// Main component - smaller, inline version
export function DJDeck() {
  return (
    <div className="w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[600px] xl:h-[600px]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[6, 5, 6]} fov={60} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          minDistance={6}
          maxDistance={6}
          autoRotate={false}
        />
        <group scale={0.6}>
          <Deck />
        </group>
      </Canvas>
    </div>
  );
}
