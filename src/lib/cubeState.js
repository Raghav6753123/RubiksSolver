// Initialize cube state: 6 faces, each with 9 stickers (3x3)
// Standard Rubik's Cube color mapping:
// U: White (#FFFFFF), D: Yellow (#FFD700), L: Green (#00AA00), R: Blue (#0066FF), F: Red (#FF3333), B: Orange (#FF8800)

export function initializeCubeState() {
  return {
    U: Array(9).fill("#FFFFFF"), // White
    D: Array(9).fill("#FFD700"), // Yellow
    L: Array(9).fill("#00AA00"), // Green
    R: Array(9).fill("#0066FF"), // Blue
    F: Array(9).fill("#FF3333"), // Red
    B: Array(9).fill("#FF8800"), // Orange
  };
}

// Convert 2D net state to cube notation string for solver
export function stateFromNet(cubeState) {
  // Convert hex colors to single-letter notation
  const colorMap = {
    "#FFFFFF": "U", // White
    "#FFD700": "D", // Yellow
    "#00AA00": "L", // Green
    "#0066FF": "R", // Blue
    "#FF3333": "F", // Red
    "#FF8800": "B", // Orange
  };

  // Order: U, R, F, D, L, B (standard Rubik's cube notation)
  const faces = ["U", "R", "F", "D", "L", "B"];
  let notation = "";

  faces.forEach((face) => {
    cubeState[face].forEach((hexColor) => {
      notation += colorMap[hexColor] || "?";
    });
  });

  return notation;
}

// Convert notation string back to cube state (for display)
export function netFromState(notation) {
  const colorMap = {
    U: "#FFFFFF", // White
    D: "#FFD700", // Yellow
    L: "#00AA00", // Green
    R: "#0066FF", // Blue
    F: "#FF3333", // Red
    B: "#FF8800", // Orange
  };

  const faces = ["U", "R", "F", "D", "L", "B"];
  const state = {};
  let idx = 0;

  faces.forEach((face) => {
    state[face] = [];
    for (let i = 0; i < 9; i++) {
      state[face].push(colorMap[notation[idx]] || "#000000");
      idx++;
    }
  });

  return state;
}

// Validate cube state (optional, for stricter V1)
export function validateCubeState(cubeState) {
  const colorCounts = {};
  const faces = ["U", "D", "L", "R", "F", "B"];

  faces.forEach((face) => {
    cubeState[face].forEach((color) => {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    });
  });

  // Each color should appear exactly 9 times
  for (const [color, count] of Object.entries(colorCounts)) {
    if (count !== 9) {
      return { valid: false, error: `Invalid color count: ${color} appears ${count} times (expected 9)` };
    }
  }

  return { valid: true };
}
