import React, { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useCubeStore } from "../lib/useCubeStore";
import { invertMove, moveToRotation } from "../lib/solver";

const FACE_MAT_INDEX = {
  R: 0,
  L: 1,
  U: 2,
  D: 3,
  F: 4,
  B: 5,
};

function Cube3D() {
  const cubeState = useCubeStore((s) => s.cubeState);
  const moves = useCubeStore((s) => s.moves);
  const moveIndex = useCubeStore((s) => s.moveIndex);
  const isPlaying = useCubeStore((s) => s.isPlaying);
  const isAnimating = useCubeStore((s) => s.isAnimating);
  const setIsAnimating = useCubeStore((s) => s.setIsAnimating);
  const setMoveIndex = useCubeStore((s) => s.setMoveIndex);
  const pause = useCubeStore((s) => s.pause);
  const stepRequestId = useCubeStore((s) => s.stepRequestId);
  const stepDirection = useCubeStore((s) => s.stepDirection);

  const groupRef = useRef();
  const cubiesRef = useRef(new Map());
  const coordToIdRef = useRef(new Map());

  const geometry = useMemo(() => new THREE.BoxGeometry(0.98, 0.98, 0.98), []);

  const cubieCoords = useMemo(() => {
    const coords = [];
    let id = 0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          coords.push({ id: id++, x, y, z });
        }
      }
    }
    return coords;
  }, []);

  const cubies = useMemo(() => {
    return cubieCoords.map((c) => ({
      ...c,
      materials: createMaterials(),
    }));
  }, [cubieCoords]);

  useEffect(() => {
    const map = new Map();
    cubieCoords.forEach((c) => map.set(coordKey(c), c.id));
    coordToIdRef.current = map;
  }, [cubieCoords]);

  useEffect(() => {
    if (!groupRef.current || isAnimating) return;
    applyCubeStateToMaterials(cubeState, cubiesRef.current, coordToIdRef.current);
  }, [cubeState, isAnimating]);

  useEffect(() => {
    if (!isPlaying || isAnimating) return;
    const move = moves[moveIndex];
    if (!move) {
      pause();
      return;
    }

    setIsAnimating(true);
    animateMove(move).then(() => {
      setMoveIndex(moveIndex + 1);
      setIsAnimating(false);
    });
  }, [isPlaying, isAnimating, moveIndex, moves, pause, setIsAnimating, setMoveIndex]);

  useEffect(() => {
    if (isAnimating || moves.length === 0 || !stepRequestId) return;
    if (stepDirection === 1) {
      const move = moves[moveIndex];
      if (!move) return;
      setIsAnimating(true);
      animateMove(move).then(() => {
        setMoveIndex(moveIndex + 1);
        setIsAnimating(false);
      });
    } else if (stepDirection === -1) {
      const prevMove = moves[moveIndex - 1];
      if (!prevMove) return;
      setIsAnimating(true);
      animateMove(invertMove(prevMove)).then(() => {
        setMoveIndex(moveIndex - 1);
        setIsAnimating(false);
      });
    }
  }, [stepRequestId]);

  const animateMove = (move) => {
    const { axis, angle } = moveToRotation(move);
    const axisVector = axis === "X" ? new THREE.Vector3(1, 0, 0) : axis === "Y" ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);

    const cubies = getCubiesForFace(cubiesRef.current, move.face);
    return rotateCubies(groupRef.current, cubies, axisVector, angle);
  };

  return (
    <Canvas camera={{ position: [4.2, 4.2, 4.2], fov: 50 }} className="w-full h-full">
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <group ref={groupRef}>
        {cubies.map((c) => (
          <mesh
            key={c.id}
            geometry={geometry}
            material={c.materials}
            position={[c.x * 1.05, c.y * 1.05, c.z * 1.05]}
            ref={(el) => {
              if (el) {
                cubiesRef.current.set(c.id, {
                  mesh: el,
                  coord: { x: c.x, y: c.y, z: c.z },
                });
              }
            }}
          />
        ))}
      </group>
      <OrbitControls enableDamping dampingFactor={0.08} autoRotate={!isAnimating} autoRotateSpeed={1} />
    </Canvas>
  );
}

function createMaterials() {
  const dark = new THREE.Color("#0f172a");
  return [
    new THREE.MeshStandardMaterial({ color: dark, metalness: 0.2, roughness: 0.6 }), // R
    new THREE.MeshStandardMaterial({ color: dark, metalness: 0.2, roughness: 0.6 }), // L
    new THREE.MeshStandardMaterial({ color: dark, metalness: 0.2, roughness: 0.6 }), // U
    new THREE.MeshStandardMaterial({ color: dark, metalness: 0.2, roughness: 0.6 }), // D
    new THREE.MeshStandardMaterial({ color: dark, metalness: 0.2, roughness: 0.6 }), // F
    new THREE.MeshStandardMaterial({ color: dark, metalness: 0.2, roughness: 0.6 }), // B
  ];
}

function applyCubeStateToMaterials(cubeState, cubiesMap, coordToIdMap) {
  Object.entries(cubeState).forEach(([face, stickers]) => {
    stickers.forEach((color, index) => {
      const coord = getCoordForFaceIndex(face, index);
      const id = coordToIdMap.get(coordKey(coord));
      if (id === undefined) return;
      const cuby = cubiesMap.get(id);
      if (!cuby) return;
      const matIndex = FACE_MAT_INDEX[face];
      const material = cuby.mesh.material[matIndex];
      if (material) material.color.set(color);
    });
  });
}

function rotateCubies(group, cubies, axis, angle) {
  return new Promise((resolve) => {
    const pivot = new THREE.Group();
    group.add(pivot);

    cubies.forEach((c) => pivot.attach(c.mesh));

    const state = { t: 0 };
    gsap.to(state, {
      t: 1,
      duration: 0.45,
      ease: "power2.inOut",
      onUpdate: () => {
        const q = new THREE.Quaternion();
        q.setFromAxisAngle(axis, angle * state.t);
        pivot.quaternion.copy(q);
      },
      onComplete: () => {
        pivot.updateMatrixWorld(true);
        cubies.forEach((c) => {
          group.attach(c.mesh);
          const rounded = {
            x: Math.round(c.mesh.position.x / 1.05),
            y: Math.round(c.mesh.position.y / 1.05),
            z: Math.round(c.mesh.position.z / 1.05),
          };
          c.coord = rounded;
          c.mesh.position.set(rounded.x * 1.05, rounded.y * 1.05, rounded.z * 1.05);
        });
        group.remove(pivot);
        resolve();
      },
    });
  });
}

function getCubiesForFace(cubiesMap, face) {
  const result = [];
  cubiesMap.forEach((c) => {
    if (face === "U" && c.coord.y === 1) result.push(c);
    if (face === "D" && c.coord.y === -1) result.push(c);
    if (face === "L" && c.coord.x === -1) result.push(c);
    if (face === "R" && c.coord.x === 1) result.push(c);
    if (face === "F" && c.coord.z === 1) result.push(c);
    if (face === "B" && c.coord.z === -1) result.push(c);
  });
  return result;
}

function getCoordForFaceIndex(face, index) {
  const row = Math.floor(index / 3);
  const col = index % 3;

  if (face === "U") return { x: col - 1, y: 1, z: row - 1 };
  if (face === "D") return { x: col - 1, y: -1, z: 1 - row };
  if (face === "F") return { x: col - 1, y: 1 - row, z: 1 };
  if (face === "B") return { x: 1 - col, y: 1 - row, z: -1 };
  if (face === "L") return { x: -1, y: 1 - row, z: col - 1 };
  if (face === "R") return { x: 1, y: 1 - row, z: 1 - col };
  return { x: 0, y: 0, z: 0 };
}

function coordKey({ x, y, z }) {
  return `${x},${y},${z}`;
}

export default Cube3D;
