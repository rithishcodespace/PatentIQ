import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

/**
 * PatentConstellation
 * ---------------------------------------------------------------
 * The product's core idea made visible: semantic similarity is
 * distance in embedding space. The amber node is the query patent.
 * Indigo nodes are prior-art candidates scattered around it; the
 * closer (more similar) a node is, the brighter and more opaque
 * its connecting line. Used on the landing hero and reusable on
 * the results page with real similarity scores swapped in.
 * ---------------------------------------------------------------
 */

type NodeDatum = {
  position: [number, number, number];
  similarity: number; // 0..1
};

function generateNodes(count: number, seed = 7): NodeDatum[] {
  // deterministic pseudo-random scatter so the layout doesn't jump on re-render
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  return Array.from({ length: count }).map(() => {
    const radius = 1.6 + rand() * 2.2;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
    const z = radius * Math.cos(phi);
    // nodes closer to center are treated as "more similar"
    const similarity = Math.max(0, 1 - radius / 3.8);
    return { position: [x, y, z], similarity };
  });
}

function QueryNode() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 1.8) * 0.08;
    ref.current?.scale.setScalar(scale);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.16, 24, 24]} />
      <meshStandardMaterial
        color="#e8a33d"
        emissive="#e8a33d"
        emissiveIntensity={0.9}
        roughness={0.3}
      />
    </mesh>
  );
}

function CandidateNode({ node }: { node: NodeDatum }) {
  const isStrongMatch = node.similarity > 0.55;
  const size = 0.045 + node.similarity * 0.05;
  return (
    <mesh position={node.position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={isStrongMatch ? "#f2c077" : "#5a6ad1"}
        emissive={isStrongMatch ? "#e8a33d" : "#1e2a78"}
        emissiveIntensity={isStrongMatch ? 0.5 : 0.25}
        roughness={0.5}
      />
    </mesh>
  );
}

function ConnectionLine({ node }: { node: NodeDatum }) {
  const opacity = 0.08 + node.similarity * 0.55;
  return (
    <Line
      points={[[0, 0, 0], node.position]}
      color={node.similarity > 0.55 ? "#e8a33d" : "#8892c9"}
      lineWidth={0.6}
      transparent
      opacity={opacity}
    />
  );
}

function RotatingGroup() {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => generateNodes(34), []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={groupRef}>
      <QueryNode />
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
        camera={{ position: [0, 0.8, 6.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 4, 4]} intensity={1.1} color="#ffffff" />
        <pointLight position={[-4, -2, -3]} intensity={0.4} color="#1e2a78" />
        <RotatingGroup />
      </Canvas>

      {/* caption overlay, mono/data-style */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <span className="code-chip">QUERY → 34 CANDIDATES SCANNED</span>
      </div>
    </div>
  );
}
