import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

type NodeDatum = {
  position: [number, number, number];
  similarity: number;
};

function generateNodes(count: number, seed = 7): NodeDatum[] {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  return Array.from({ length: count }).map(() => {
    const radius = 1.5 + rand() * 2.4;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
    const z = radius * Math.cos(phi);
    const similarity = Math.max(0, 1 - radius / 4.0);
    return { position: [x, y, z], similarity };
  });
}

function CenterNode() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 1.8) * 0.06;
      ref.current.scale.setScalar(scale);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.18, 32, 32]} />
      <meshStandardMaterial
        color="#3b82f6"
        emissive="#2563eb"
        emissiveIntensity={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

function CandidateNode({ node }: { node: NodeDatum }) {
  const isStrongMatch = node.similarity > 0.55;
  const size = 0.04 + node.similarity * 0.05;
  return (
    <mesh position={node.position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={isStrongMatch ? "#60a5fa" : "#818cf8"}
        emissive={isStrongMatch ? "#3b82f6" : "#4f46e5"}
        emissiveIntensity={isStrongMatch ? 0.6 : 0.25}
        roughness={0.4}
      />
    </mesh>
  );
}

function ConnectionLine({ node }: { node: NodeDatum }) {
  const opacity = 0.1 + node.similarity * 0.5;
  return (
    <Line
      points={[[0, 0, 0], node.position]}
      color={node.similarity > 0.55 ? "#60a5fa" : "#a5b4fc"}
      lineWidth={0.7}
      transparent
      opacity={opacity}
    />
  );
}

function RotatingGroup() {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => generateNodes(32), []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.14;
    }
  });

  return (
    <group ref={groupRef}>
      <CenterNode />
      {nodes.map((n, i) => (
        <group key={i}>
          <ConnectionLine node={n} />
          <CandidateNode node={n} />
        </group>
      ))}
    </group>
  );
}

export default function PatentConstellation({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0.8, 6.0], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-4, -3, -3]} intensity={0.5} color="#3b82f6" />
        <RotatingGroup />
      </Canvas>
    </div>
  );
}
