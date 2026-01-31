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
  const moves = [];
  const tokens = moveString.trim().split(/\s+/);

  tokens.forEach((token) => {
    if (!token) return;

    const face = token[0]; // U, R, F, D, L, B
    const modifier = token.slice(1); // "", "2", "'", "w", etc.

    let times = 1;
    let prime = false;

    if (modifier.includes("2")) times = 2;
    if (modifier.includes("'")) prime = true;

    moves.push({
      face,
      times: prime ? 3 - times : times, // Convert prime: U' = 3x U = 270°
      prime,
    });
  });

  return moves;
}
