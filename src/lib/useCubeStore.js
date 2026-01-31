import { create } from "zustand";
import { initializeCubeState } from "./cubeState";

export const useCubeStore = create((set) => ({
  cubeState: initializeCubeState(),
  moves: [],
  moveIndex: 0,
  isPlaying: false,
  isAnimating: false,
  stepRequestId: 0,
  stepDirection: 0,

  setSticker: (face, index, color) =>
    set((state) => {
      const next = { ...state.cubeState };
      next[face] = [...next[face]];
      next[face][index] = color;
      return { cubeState: next };
    }),

  setCubeState: (cubeState) => set({ cubeState }),

  setMoves: (moves) =>
    set({ moves, moveIndex: 0, isPlaying: false, stepDirection: 0 }),

  setMoveIndex: (moveIndex) => set({ moveIndex }),

  setIsAnimating: (isAnimating) => set({ isAnimating }),

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  requestStep: (direction) =>
    set((state) => ({
      stepRequestId: state.stepRequestId + 1,
      stepDirection: direction,
    })),

  reset: () =>
    set({
      cubeState: initializeCubeState(),
      moves: [],
      moveIndex: 0,
      isPlaying: false,
      isAnimating: false,
      stepDirection: 0,
    }),
}));
