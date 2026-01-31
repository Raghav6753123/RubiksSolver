import * as THREE from "three";
import { parseMoves } from "./solver";

/**
 * Parse moves and animate them sequentially on the cube
 */
export async function parseAndAnimateMoves(cubeRef, moveString, onComplete) {
  const moves = parseMoves(moveString);

  for (const move of moves) {
    await animateFaceRotation(cubeRef, move.face, move.times);
  }

  onComplete?.();
}

/**
 * Animate a single face rotation
 */
function animateFaceRotation(cubeRef, face, times = 1) {
  return new Promise((resolve) => {
    const duration = 500; // ms per rotation (90 degrees)
    const startTime = Date.now();
    const totalDuration = duration * times;
    const axis = getFaceAxis(face);
    const direction = 1; // Can be -1 for inverse
    const targetRotation = (Math.PI / 2) * times * direction;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // Easing: ease-in-out
      const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      // Get cubies that should rotate
      const cubies = getCubiesForFace(cubeRef.group, face);

      // Apply rotation
      cubies.forEach((cuby) => {
        // Reset rotation
        cuby.rotation.set(0, 0, 0, "XYZ");

        // Apply new rotation around axis
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(axis, targetRotation * easeProgress);
        cuby.quaternion.copy(quaternion);
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Finalize positions
        cubies.forEach((cuby) => {
          cuby.quaternion.normalize();
          updateCubyPosition(cuby, axis, times);
        });
        resolve();
      }
    };

    animate();
  });
}

/**
 * Get the rotation axis for a face (U, D, L, R, F, B)
 */
function getFaceAxis(face) {
  const axes = {
    U: new THREE.Vector3(0, 1, 0), // Up
    D: new THREE.Vector3(0, -1, 0), // Down
    L: new THREE.Vector3(-1, 0, 0), // Left
    R: new THREE.Vector3(1, 0, 0), // Right
    F: new THREE.Vector3(0, 0, 1), // Front
    B: new THREE.Vector3(0, 0, -1), // Back
  };
  return axes[face] || new THREE.Vector3(0, 1, 0);
}

/**
 * Get cubies that belong to a face
 */
function getCubiesForFace(group, face) {
  const cubies = [];
  const threshold = 0.6;

  group.children.forEach((cuby) => {
    const pos = cuby.userData.originalPosition;

    switch (face) {
      case "U":
        if (pos.y === 1) cubies.push(cuby);
        break;
      case "D":
        if (pos.y === -1) cubies.push(cuby);
        break;
      case "L":
        if (pos.x === -1) cubies.push(cuby);
        break;
      case "R":
        if (pos.x === 1) cubies.push(cuby);
        break;
      case "F":
        if (pos.z === 1) cubies.push(cuby);
        break;
      case "B":
        if (pos.z === -1) cubies.push(cuby);
        break;
    }
  });

  return cubies;
}

/**
 * Update cuby position after rotation
 */
function updateCubyPosition(cuby, axis, times) {
  const pos = cuby.userData.originalPosition;
  const angleRad = (Math.PI / 2) * times;

  // Rotate position around axis
  const rotatedPos = new THREE.Vector3(pos.x, pos.y, pos.z);
  rotatedPos.applyAxisAngle(axis, angleRad);

  // Round to nearest grid position
  cuby.userData.originalPosition = {
    x: Math.round(rotatedPos.x),
    y: Math.round(rotatedPos.y),
    z: Math.round(rotatedPos.z),
  };

  // Update visual position
  cuby.position.set(
    cuby.userData.originalPosition.x * 1.05,
    cuby.userData.originalPosition.y * 1.05,
    cuby.userData.originalPosition.z * 1.05
  );
}
