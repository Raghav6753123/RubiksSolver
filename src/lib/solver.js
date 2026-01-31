// Backend API solver adapter
// This abstraction layer allows you to swap the solver implementation later
// (e.g., replace with C++ backend via HTTP API)

const SOLVER_API_BASE =
  import.meta.env.VITE_SOLVER_API || "http://localhost:5000";

/**
 * Solve a Rubik's cube given its current state
 * @param {string} stateString - Cube state in notation format (54 chars, 6 faces x 9 stickers)
 * @returns {Promise<string>} Solution as move string (e.g., "U R2 F' L")
 */
export async function solveCube(stateString) {
  try {
    // For prototype: use a simple JS solver library as fallback
    // Later: replace with HTTP call to C++ backend
    
    // Fallback to demo solver (returns random moves)
    if (!stateString || stateString.length !== 54) {
      throw new Error("Invalid cube state notation");
    }

    // TODO: Replace with actual backend API call
    // const response = await fetch(`${SOLVER_API_BASE}/solve`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ state: stateString }),
    // });
    // if (!response.ok) throw new Error("Solver API error");
    // const { moves } = await response.json();
    // return moves;

    // Temporary: return demo moves
    return demoSolve(stateString);
  } catch (error) {
    throw new Error(`Solver failed: ${error.message}`);
  }
}

/**
 * Demo solver for testing (returns predefined moves)
 */
function demoSolve(stateString) {
  // Return a simple demo solution
  return "U R U' R' U' F' U F";
}

/**
 * Parse move string into individual moves
 * @param {string} moveString - e.g., "U R2 F' L"
 * @returns {Array<{face: string, times: number, prime: boolean}>}
 */
export function parseMoves(moveString) {
  return parseMoveString(moveString);
}

/**
 * Parse move string into array of { face, turns, notation }
 * turns: 1=90°, 2=180°, 3=270° (prime)
 */
export function parseMoveString(moveString) {
  const moves = [];
  const tokens = moveString.trim().split(/\s+/).filter(Boolean);

  tokens.forEach((token) => {
    const face = token[0];
    const modifier = token.slice(1);
    let turns = 1;

    if (modifier.includes("2")) turns = 2;
    if (modifier.includes("'")) turns = 3;

    moves.push({ face, turns, notation: token });
  });

  return moves;
}

/**
 * Invert a move (e.g., R -> R', R' -> R, R2 -> R2)
 */
export function invertMove(move) {
  if (!move) return null;
  const turns = move.turns === 2 ? 2 : move.turns === 1 ? 3 : 1;
  return { ...move, turns };
}

/**
 * Translate a move into axis + angle data for 3D rotation
 */
export function moveToRotation(move) {
  const axisMap = {
    U: "Y",
    D: "Y",
    L: "X",
    R: "X",
    F: "Z",
    B: "Z",
  };

  const signMap = {
    U: 1,
    D: -1,
    L: -1,
    R: 1,
    F: 1,
    B: -1,
  };

  const axis = axisMap[move.face] || "Y";
  const sign = signMap[move.face] || 1;
  const angle = (Math.PI / 2) * move.turns * sign;

  return { axis, angle };
}
