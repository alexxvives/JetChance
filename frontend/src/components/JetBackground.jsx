import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Simple fallback component
function LoadingFallback() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
      <div className="text-white text-lg">Loading 3D Model...</div>
    </div>
  );
}

// Error boundary fallback
function ErrorFallback() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center">
      <div className="text-white text-lg">Unable to load 3D model</div>
    </div>
  );
}

export default function JetBackground() {
  return (
    <div className="w-full h-full">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 2, 5], fov: 60 }}
          style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)' }}
          onError={() => console.error('Canvas error')}
        >
          {/* Simple lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          {/* Placeholder geometry for testing */}
          <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[2, 0.5, 4]} />
            <meshStandardMaterial color="#4080ff" metalness={0.8} roughness={0.2} />
          </mesh>
          
          <OrbitControls enableZoom={false} />
        </Canvas>
      </Suspense>
    </div>
  );
}
