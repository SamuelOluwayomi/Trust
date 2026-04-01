"use client";

import * as THREE from "three";
import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, PerspectiveCamera, OrbitControls, Environment, Html, useProgress } from "@react-three/drei";
import { EffectComposer, DepthOfField, ToneMapping } from "@react-three/postprocessing";

function CustomLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-3 w-48">
        <div className="text-[#171717]/80 font-black text-2xl tracking-widest">{progress.toFixed(0)}%</div>
        <div className="w-full bg-[#171717]/10 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#171717] transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </Html>
  );
}

function Shard({ index, z, speed, color, size }: { index: number, z: number, speed: number, color: string, size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const { width, height } = viewport.getCurrentViewport(undefined, new THREE.Vector3(0, 0, -z));

  const [data] = useState(() => ({
    y: THREE.MathUtils.randFloatSpread(height * 2),
    x: THREE.MathUtils.randFloatSpread(2),
    spin: THREE.MathUtils.randFloat(8, 12),
    rX: Math.random() * Math.PI,
    rZ: Math.random() * Math.PI
  }));

  useFrame((state, dt) => {
    if (ref.current && dt < 0.1) {
      // Endless vertical loop
      ref.current.position.set(data.x * width, (data.y += dt * speed), -z);
      // Continuous rotation
      ref.current.rotation.set(
        (data.rX += dt / data.spin),
        Math.sin(index * 1000 + state.clock.elapsedTime / 10) * Math.PI,
        (data.rZ += dt / data.spin)
      );
      // Reset position when it leaves the top of the viewport
      if (data.y > height * 1.5) {
        data.y = -(height * 1.5);
      }
    }
  });

  return (
    <mesh ref={ref} scale={size}>
      <boxGeometry args={[1, 1, 1]} />
      <MeshDistortMaterial
        color={color}
        speed={speed}
        distort={0.3}
        radius={1}
        emissive={color}
        emissiveIntensity={0.2}
        roughness={0.1}
        metalness={0.9}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

export default function Background() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = 40;
  const depth = 60;

  const shardsData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      index: i,
      z: Math.round(THREE.MathUtils.lerp(0, depth, i / count)),
      speed: 1.5,
      color: i % 2 === 0 ? "#171717" : "#C2410C",
      size: Math.random() * 0.5 + 0.5,
    }));
  }, [count, depth]);

  if (!mounted) {
    return <div className="fixed inset-0 bg-[#b56605] z-0" />;
  }

  return (
    <div className="fixed inset-0 z-0 bg-[#b56605]">
      <Canvas 
        flat 
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false }} 
        dpr={[1, 1.2]} 
        camera={{ position: [0, 0, 10], fov: 20 }}
      >
        <color attach="background" args={["#b56605"]} />
        <ambientLight intensity={0.6} color="#b56605" />
        <spotLight position={[10, 20, 10]} penumbra={1} intensity={3} color="#ffffff" />
        
        <Suspense fallback={<CustomLoader />}>
          {shardsData.map((shard) => (
            <Shard key={shard.index} {...shard} />
          ))}
          <Environment preset="sunset" />
          <EffectComposer enableNormalPass={false} multisampling={0}>
            <DepthOfField target={[0, 0, 0]} focalLength={0.4} bokehScale={2} height={700} />
            <ToneMapping />
          </EffectComposer>
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
