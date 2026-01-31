import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { parseAndAnimateMoves } from "../lib/cubeAnimation";

function Cube3D({ cubeState, moves, onAnimationComplete }) {
  const cubeRef = useRef();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (moves && cubeRef.current && !isAnimating) {
      setIsAnimating(true);
      parseAndAnimateMoves(cubeRef.current, moves, () => {
        setIsAnimating(false);
        onAnimationComplete?.();
      });
    }
  }, [moves, isAnimating, onAnimationComplete]);

  return (
    <Canvas camera={{ position: [4, 4, 4], fov: 50 }} className="w-full h-full">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <CubeModel ref={cubeRef} cubeState={cubeState} />
      <OrbitControls autoRotate={!isAnimating} autoRotateSpeed={2} />
    </Canvas>
  );
}

const CubeModel = React.forwardRef(({ cubeState }, ref) => {
  const groupRef = useRef();

  useEffect(() => {
    if (!groupRef.current) return;

    // Clear existing cubies
    while (groupRef.current.children.length > 0) {
      groupRef.current.remove(groupRef.current.children[0]);
    }

    // Create 27 cubies
    const cubies = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const cubyGroup = new THREE.Group();
          cubyGroup.position.set(x * 1.05, y * 1.05, z * 1.05);
          cubyGroup.userData.originalPosition = { x, y, z };

          // Create 6 faces for each cuby
          const faces = createCubyFaces(x, y, z, cubeState);
          faces.forEach((face) => cubyGroup.add(face));

          cubies.push(cubyGroup);
          groupRef.current.add(cubyGroup);
        }
      }
    }

    ref.current = {
      group: groupRef.current,
      cubies: cubies,
      rotationAxes: {
        X: new THREE.Vector3(1, 0, 0),
        Y: new THREE.Vector3(0, 1, 0),
        Z: new THREE.Vector3(0, 0, 1),
      },
    };
  }, [cubeState, ref]);

  return <group ref={groupRef} />;
});

function createCubyFaces(x, y, z, cubeState) {
  const faces = [];
  const size = 1;
  const positions = {
    // X axis
    "-X": { position: [-size / 2, 0, 0], normal: [-1, 0, 0], face: "L" },
    "+X": { position: [size / 2, 0, 0], normal: [1, 0, 0], face: "R" },
    // Y axis
    "-Y": { position: [0, -size / 2, 0], normal: [0, -1, 0], face: "D" },
    "+Y": { position: [0, size / 2, 0], normal: [0, 1, 0], face: "U" },
    // Z axis
    "-Z": { position: [0, 0, -size / 2], normal: [0, 0, -1], face: "B" },
    "+Z": { position: [0, 0, size / 2], normal: [0, 0, 1], face: "F" },
  };

  Object.entries(positions).forEach(([key, data]) => {
    // Only add face if it's on the surface
    if (
      (key === "-X" && x === -1) ||
      (key === "+X" && x === 1) ||
      (key === "-Y" && y === -1) ||
      (key === "+Y" && y === 1) ||
      (key === "-Z" && z === -1) ||
      (key === "+Z" && z === 1)
    ) {
      const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.01);
      const color = getColorForFace(data.face, x, y, z, cubeState);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.4,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.fromArray(data.position);
      mesh.userData.color = color;
      faces.push(mesh);
    }
  });

  // Add black edge to all cubies
  const edgeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.5,
    roughness: 0.5,
  });
  const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
  faces.push(edgeMesh);

  return faces;
}

function getColorForFace(face, x, y, z, cubeState) {
  // Map cuby position to sticker indices
  const colorMap = {
    U: cubeState.U[(y === 1 ? 0 : y === 0 ? 3 : 6) + (x === -1 ? 0 : x === 0 ? 1 : 2)],
    D: cubeState.D[(y === -1 ? 0 : y === 0 ? 3 : 6) + (x === -1 ? 0 : x === 0 ? 1 : 2)],
    L: cubeState.L[(x === -1 ? 0 : x === 0 ? 3 : 6) + (z === 1 ? 0 : z === 0 ? 1 : 2)],
    R: cubeState.R[(x === 1 ? 0 : x === 0 ? 3 : 6) + (z === -1 ? 0 : z === 0 ? 1 : 2)],
    F: cubeState.F[(z === 1 ? 0 : z === 0 ? 3 : 6) + (x === -1 ? 0 : x === 0 ? 1 : 2)],
    B: cubeState.B[(z === -1 ? 0 : z === 0 ? 3 : 6) + (x === 1 ? 0 : x === 0 ? 1 : 2)],
  };
  return colorMap[face];
}

export default Cube3D;
