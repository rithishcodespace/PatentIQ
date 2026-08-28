import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause } from 'lucide-react';

interface PatentNodeData {
  id: string;
  label: string;
  category: string;
  confidence: number;
  color: number;
  position: [number, number, number];
}

const NODES_DATA: PatentNodeData[] = [
  {
    id: 'US-10948372',
    label: 'LiDAR Navigation • 94.8%',
    category: 'Sensor Fusion',
    confidence: 94.8,
    color: 0x4f46e5, // Deep Indigo
    position: [2.8, 1.4, 0.8],
  },
  {
    id: 'US-10812944',
    label: 'Spatial Tracking • 89.2%',
    category: 'Computer Vision',
    confidence: 89.2,
    color: 0x2563eb, // Royal Blue
    position: [-2.6, 1.6, -1.4],
  },
  {
    id: 'US-10654321',
    label: 'Motion Matrix • 82.5%',
    category: 'Image Processing',
    confidence: 82.5,
    color: 0x0284c7, // Sky Blue
    position: [2.0, -2.2, 1.2],
  },
  {
    id: 'US-10498765',
    label: 'Point Cloud ML • 76.1%',
    category: 'Point Cloud',
    confidence: 76.1,
    color: 0x7c3aed, // Violet
    position: [-2.8, -1.6, 0.9],
  },
  {
    id: 'US-10234567',
    label: 'Radar Analyzer • 68.4%',
    category: 'Radar Systems',
    confidence: 68.4,
    color: 0x475569, // Slate
    position: [0.0, 2.8, -2.2],
  },
];

export default function LandingGraph({ className = '' }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 9.5);

    // 2. Renderer with transparent background (NO OUTER BOX)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Realistic Multi-Point Lighting & Ambient Aura
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x818cf8, 2.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight2.position.set(-5, -6, -4);
    scene.add(dirLight2);

    // 4. Main 3D Group for Smooth Rotation
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // 5. Realistic Central Core (Glossy Glass/Metal Sphere with Pulsing Core)
    const centralGeo = new THREE.IcosahedronGeometry(0.75, 4);
    const centralMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x3730a3,
      emissiveIntensity: 0.6,
    });
    const centralMesh = new THREE.Mesh(centralGeo, centralMat);
    networkGroup.add(centralMesh);

    // Inner Glowing Energy Nucleus
    const nucleusGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const nucleusMat = new THREE.MeshBasicMaterial({ color: 0xc7d2fe, transparent: true, opacity: 0.8 });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    centralMesh.add(nucleusMesh);

    // 3D Atomic Orbit Rings (Gyroscopic Torus Geometry)
    const torusGeo1 = new THREE.TorusGeometry(1.6, 0.015, 16, 100);
    const torusMat1 = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.35 });
    const torusMesh1 = new THREE.Mesh(torusGeo1, torusMat1);
    torusMesh1.rotation.x = Math.PI / 3;
    networkGroup.add(torusMesh1);

    const torusGeo2 = new THREE.TorusGeometry(2.4, 0.012, 16, 100);
    const torusMat2 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 });
    const torusMesh2 = new THREE.Mesh(torusGeo2, torusMat2);
    torusMesh2.rotation.y = Math.PI / 4;
    networkGroup.add(torusMesh2);

    // 6. Canvas Text Sprite Helper for Floating 3D Text Labels
    const createTextSprite = (text: string, colorHex: string = '#1e293b') => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(4, 4, 248, 56, 12);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = colorHex;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 32);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.4, 0.35, 1);
      return sprite;
    };

    // Label for Central Core
    const coreLabel = createTextSprite('Core Invention Concept', '#4f46e5');
    coreLabel.position.set(0, -1.1, 0);
    networkGroup.add(coreLabel);

    // 7. Outer Nodes & Realistic Glowing Tubes
    NODES_DATA.forEach((data) => {
      // Node Sphere
      const geo = new THREE.IcosahedronGeometry(0.38, 3);
      const mat = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.2,
        metalness: 0.7,
        emissive: data.color,
        emissiveIntensity: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...data.position);
      networkGroup.add(mesh);

      // Node Floating 3D Label Sprite
      const labelSprite = createTextSprite(data.label, '#334155');
      labelSprite.position.set(data.position[0], data.position[1] + 0.6, data.position[2]);
      networkGroup.add(labelSprite);

      // Connection Cable (Dynamic Curved Line)
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(data.position[0] * 0.5, data.position[1] * 0.5 + 0.2, data.position[2] * 0.5),
        new THREE.Vector3(...data.position),
      ]);

      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.012, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.55 });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      networkGroup.add(tubeMesh);
    });

    // 8. Background Cosmic Starfield / Floating Particles
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 18;
      particlePositions[i + 1] = (Math.random() - 0.5) * 18;
      particlePositions[i + 2] = (Math.random() - 0.5) * 18;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    networkGroup.add(particles);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. 60FPS 3D Realism Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous 3D rotation & dynamic orbital wobble
      if (isRotatingRef.current) {
        networkGroup.rotation.y += 0.005;
        networkGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.12;
      }

      // Gyroscopic Ring Rotations
      torusMesh1.rotation.z += 0.008;
      torusMesh2.rotation.z -= 0.006;

      // Pulse nucleus
      nucleusMesh.scale.setScalar(1 + Math.sin(elapsedTime * 2.5) * 0.12);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Three.js 3D WebGL Canvas - NO OUTER BOX, NO CARD BORDER, NO BOTTOM DETAILS CARD */}
      <div className="relative h-[420px] w-full select-none" ref={mountRef}>
        {/* Floating 3D Spin Control Button */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1.5 font-body text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs backdrop-blur-md cursor-pointer"
          >
            {isRotating ? (
              <>
                <Pause className="h-3.5 w-3.5 text-indigo-600" />
                Pause 3D
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-indigo-600" />
                Rotate 3D
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
