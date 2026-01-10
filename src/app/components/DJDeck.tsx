// @ts-nocheck - TypeScript types for React Three Fiber should work after restarting TS server
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, RoundedBox } from '@react-three/drei';
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

// Main deck structure
function Deck() {
  return (
    <group>
      {/* Main deck body */}
      <RoundedBox
        position={[0, -0.5, 0]}
        args={[7.05, 3.9525, 0.7275]}
        radius={0.15}
        smoothness={4}
      >
        <meshStandardMaterial color="#808080" metalness={0.1} roughness={0.8} />
      </RoundedBox>

      {/* Turntable well/recess */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[2.5, 0.2, 2.5]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Turntable */}
      <Turntable rotationSpeed={0.5} />

      {/* Control panel */}
      <mesh position={[2.5, 0, -0.5]}>
        <boxGeometry args={[1, 0.3, 2]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} />
      </mesh>

      {/* Knobs on control panel */}
      <Knob position={[2.5, 0.2, -0.2]} color="#ff3333" />
      <Knob position={[2.5, 0.2, 0]} color="#33ff33" />
      <Knob position={[2.5, 0.2, 0.2]} color="#3333ff" />
      <Knob position={[2.5, 0.2, 0.4]} />

      {/* Faders */}
      <Fader position={[3.5, 0.1, -0.5]} />
      <Fader position={[3.5, 0.1, 0]} />
      <Fader position={[3.5, 0.1, 0.5]} />

      {/* Cue/Play buttons */}
      <mesh position={[2.5, 0.15, -0.7]}>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      <mesh position={[2.5, 0.15, -0.9]}>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>

      {/* Tone arm */}
      <group position={[-1.5, 0.5, 0]}>
        <mesh rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[1.5, 0.05, 0.05]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
        <mesh position={[-0.75, 0, 0]}>
          <boxGeometry args={[0.1, 0.2, 0.1]} />
          <meshStandardMaterial color="#555" metalness={0.7} />
        </mesh>
      </group>

      {/* Lighting */}
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
      <ambientLight intensity={0.4} />
    </group>
  );
}

// Main component - smaller, inline version
export function DJDeck() {
  return (
    <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[6, 5, 6]} fov={50} />
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
