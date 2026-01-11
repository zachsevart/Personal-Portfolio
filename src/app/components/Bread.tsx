// @ts-nocheck - TypeScript types for React Three Fiber should work after restarting TS server
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// GLTF Model component
function BreadModel({ modelPath, scale = 1 }: { modelPath: string; scale?: number }) {
  const { scene } = useGLTF(modelPath);
  
  // Center the model by computing bounding box and creating a centered clone
  const centeredScene = useMemo(() => {
    const clonedScene = scene.clone();
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    
    // Center the model at origin
    clonedScene.position.sub(center);
    
    return clonedScene;
  }, [scene]);
  
  return (
    <group scale={scale}>
      <primitive object={centeredScene} />
    </group>
  );
}

// Main bread component
function Bread3D() {
  // Bread GLTF model
  const modelPath = '/loaf_of_bread_scan/scene.gltf';
  const groupRef = useRef<THREE.Group>(null);
  
  // Optional: Animate rotation back and forth
  useFrame((_state) => {
    if (groupRef.current) {
      // Use sine wave for smooth back-and-forth rotation
      // Adjust 0.3 for rotation speed, 0.5 for rotation range (in radians)
      groupRef.current.rotation.y = Math.sin(_state.clock.elapsedTime * 0.3) * 0.5;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* GLTF Model - adjust scale here to make model smaller/larger */}
      <BreadModel modelPath={modelPath} scale={3} />

      {/* Enhanced lighting for better visibility */}
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, 5, -5]} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={1} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
    </group>
  );
}

// Main component
export function Bread() {
  return (
    <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={60} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          minDistance={6}
          maxDistance={6}
          autoRotate={false}
        />
        <group scale={0.6}>
          <Bread3D />
        </group>
      </Canvas>
    </div>
  );
}
