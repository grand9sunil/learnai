"use client";

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';

interface AvatarModelProps {
  url: string;
  isAnimating: boolean;
  currentMessage?: string;
}

function AvatarModel({ url, isAnimating, currentMessage }: AvatarModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const gltf = useLoader(GLTFLoader, url);
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);

  useEffect(() => {
    if (gltf && gltf.animations.length > 0) {
      setAnimations(gltf.animations);
      
      // Setup animation mixer
      if (meshRef.current) {
        mixerRef.current = new THREE.AnimationMixer(meshRef.current);
        
        // Play idle animation if available
        const idleAnimation = gltf.animations.find(clip => 
          clip.name.toLowerCase().includes('idle') || 
          clip.name.toLowerCase().includes('breathing')
        );
        
        if (idleAnimation) {
          const action = mixerRef.current.clipAction(idleAnimation);
          action.play();
        }
      }
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [gltf]);

  useEffect(() => {
    if (isAnimating && mixerRef.current && gltf.animations.length > 0) {
      // Trigger talking animation
      const talkAnimation = gltf.animations.find(clip => 
        clip.name.toLowerCase().includes('talk') || 
        clip.name.toLowerCase().includes('speak')
      );
      
      if (talkAnimation) {
        const action = mixerRef.current.clipAction(talkAnimation);
        action.reset().fadeIn(0.2).play();
        
        // Stop talking animation after message duration
        setTimeout(() => {
          action.fadeOut(0.2);
        }, (currentMessage?.length || 0) * 100); // Rough estimate based on message length
      }
    }
  }, [isAnimating, currentMessage, gltf.animations]);

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    // Subtle head movement
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  // Scale and position the model appropriately
  const scale = 1.5;
  
  return (
    <Center>
      <primitive 
        ref={meshRef}
        object={gltf.scene} 
        scale={scale}
        position={[0, -1, 0]}
      />
    </Center>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading avatar...</p>
      </div>
    </div>
  );
}

interface AvatarViewerProps {
  avatarUrl: string;
  isAnimating: boolean;
  currentMessage?: string;
}

export default function AvatarViewer({ avatarUrl, isAnimating, currentMessage }: AvatarViewerProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ 
          position: [0, 1, 3], 
          fov: 75,
          near: 0.1,
          far: 1000 
        }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* Environment */}
          <Environment preset="studio" />
          
          {/* Avatar Model */}
          <AvatarModel 
            url={avatarUrl} 
            isAnimating={isAnimating}
            currentMessage={currentMessage}
          />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI - Math.PI / 4}
          />
        </Suspense>
      </Canvas>
      
      {/* Loading overlay */}
      <Suspense fallback={<LoadingSpinner />}>
        <div></div>
      </Suspense>
    </div>
  );
}