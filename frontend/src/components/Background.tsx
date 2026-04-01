"use client";

import * as THREE from "three";
import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, OrbitControls, Environment, Text3D, Center } from "@react-three/drei";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";

type ShapeType = "box" | "sphere" | "octahedron" | "torus" | "dodecahedron";

interface FloatingObjectProps {
  index: number;
  z: number;
  speed: number;
  color: string;
  size: number;
  shape: ShapeType;
}

function ShapeGeometry({ shape }: { shape: ShapeType }) {
  switch (shape) {
    case "sphere":
      return <sphereGeometry args={[0.6, 24, 24]} />;
    case "octahedron":
      return <octahedronGeometry args={[0.7]} />;
    case "torus":
      return <torusGeometry args={[0.5, 0.2, 12, 32]} />;
    case "dodecahedron":
      return <dodecahedronGeometry args={[0.6]} />;
    case "box":
    default:
      return <boxGeometry args={[0.8, 0.8, 0.8]} />;
  }
}

function FloatingObject({ index, z, speed, color, size, shape }: FloatingObjectProps) {
  const ref = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const { width, height } = viewport.getCurrentViewport(undefined, new THREE.Vector3(0, 0, -z));

  const [data] = useState(() => ({
    y: THREE.MathUtils.randFloatSpread(height * 2),
    x: THREE.MathUtils.randFloatSpread(2),
    spin: THREE.MathUtils.randFloat(6, 14),
    rX: Math.random() * Math.PI,
    rZ: Math.random() * Math.PI
  }));

  useFrame((state, dt) => {
    if (ref.current && dt < 0.1) {
      ref.current.position.set(data.x * width, (data.y += dt * speed), -z);
      ref.current.rotation.set(
        (data.rX += dt / data.spin),
        Math.sin(index * 1000 + state.clock.elapsedTime / 10) * Math.PI,
        (data.rZ += dt / data.spin)
      );
      if (data.y > height * 1.5) {
        data.y = -(height * 1.5);
      }
    }
  });

  return (
    <mesh ref={ref} scale={size}>
      <ShapeGeometry shape={shape} />
      <MeshDistortMaterial
        color={color}
        speed={speed * 0.5}
        distort={shape === "sphere" ? 0.5 : 0.25}
        radius={1}
        emissive={color}
        emissiveIntensity={0.6}
        roughness={0.15}
        metalness={0.85}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

export default function Background() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = 80;
  const depth = 50;
  const shapes: ShapeType[] = ["box", "sphere", "octahedron", "torus", "dodecahedron"];

  const colors = [
    "#10B981",
    "#059669",
    "#34D399",
    "#6EE7B7",
    "#047857",
    "#1E293B",
    "#334155",
    "#475569",
  ];

  const objectsData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      index: i,
      z: Math.round(THREE.MathUtils.lerp(2, 25, Math.random())),
      speed: THREE.MathUtils.randFloat(0.5, 1.6),
      color: colors[i % colors.length],
      size: THREE.MathUtils.randFloat(0.8, 2.2),
      shape: shapes[i % shapes.length],
    }));
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 bg-[#020617] z-0" />;
  }

  return (
    <div className="fixed inset-0 z-0 bg-[#020617]">
      <Canvas
        flat
        gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 20], fov: 35 }}
      >
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={0.8} color="#10B981" />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#34D399" />
        <spotLight position={[-10, 20, 10]} penumbra={1} intensity={2} color="#10B981" />
        <pointLight position={[0, -10, 0]} intensity={1} color="#059669" />

        <Suspense fallback={null}>
          {objectsData.map((obj) => (
            <FloatingObject key={obj.index} {...obj} />
          ))}
          <Environment preset="night" />
          <EffectComposer enableNormalPass={false} multisampling={0}>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.8} />
            <ToneMapping />
          </EffectComposer>
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}
