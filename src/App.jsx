import React, { useState, useCallback } from "react";
import CubeNet from "./components/CubeNet";
import Cube3D from "./components/Cube3D";
import { initializeCubeState, stateFromNet } from "./lib/cubeState";
import { solveCube } from "./lib/solver";

function App() {
  const [cubeState, setCubeState] = useState(initializeCubeState());
  const [moves, setMoves] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState("");

  const handleSticker = useCallback((face, index, color) => {
    setCubeState((prev) => {
      const newState = { ...prev };
      newState[face][index] = color;
      return newState;
    });
  }, []);

  const handleSolve = useCallback(async () => {
    try {
      setError("");
      setIsAnimating(true);
      
      // Convert cube state to notation string
      const stateString = stateFromNet(cubeState);
      
      // Call backend solver API
      const solution = await solveCube(stateString);
      setMoves(solution);
    } catch (err) {
      setError(err.message || "Failed to solve cube");
      setIsAnimating(false);
    }
  }, [cubeState]);

  const handleReset = useCallback(() => {
    setCubeState(initializeCubeState());
    setMoves("");
    setError("");
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-2 text-center text-slate-100">
          Rubik's Cube Solver
        </h1>
        <p className="text-center text-slate-500 mb-8">
          Paint the cube state and solve it
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-900 text-red-200 rounded-lg border border-red-700">
            {error}
          </div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Input */}
          <div className="bg-slate-900/80 rounded-xl p-8 shadow-2xl border border-slate-800">
            <h2 className="text-2xl font-semibold mb-6">Cube Net</h2>
            <CubeNet cubeState={cubeState} onSticker={handleSticker} />
            
            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSolve}
                disabled={isAnimating}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-[0_0_30px_rgba(59,130,246,0.35)]"
              >
                {isAnimating ? "Solving..." : "Solve"}
              </button>
              <button
                onClick={handleReset}
                disabled={isAnimating}
                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Reset
              </button>
            </div>

            {/* Moves Display */}
            {moves && (
              <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                <p className="text-sm text-slate-300 mb-2">Solution moves:</p>
                <p className="text-lg font-mono text-cyan-400 break-words">{moves}</p>
              </div>
            )}
          </div>

          {/* Right Panel: 3D Visualization */}
          <div className="bg-slate-900/80 rounded-xl shadow-2xl border border-slate-800 overflow-hidden" style={{ minHeight: "600px" }}>
            <Cube3D cubeState={cubeState} moves={moves} onAnimationComplete={() => setIsAnimating(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
