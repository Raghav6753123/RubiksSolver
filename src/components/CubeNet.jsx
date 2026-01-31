import React, { useState } from "react";
import CubeFace from "./CubeFace";

const COLORS = [
  { name: "White", code: "#FFFFFF" },
  { name: "Yellow", code: "#FFD700" },
  { name: "Green", code: "#00AA00" },
  { name: "Blue", code: "#0066FF" },
  { name: "Red", code: "#FF3333" },
  { name: "Orange", code: "#FF8800" },
];

const FACES = ["U", "D", "L", "R", "F", "B"];
const FACE_LABELS = {
  U: "Up",
  D: "Down",
  L: "Left",
  R: "Right",
  F: "Front",
  B: "Back",
};

function CubeNet({ cubeState, onSticker }) {
  const [activeColor, setActiveColor] = useState(COLORS[0].code);

  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <div>
        <p className="text-sm text-slate-400 mb-3">Select color:</p>
        <div className="flex gap-3 flex-wrap">
          {COLORS.map((color) => (
            <button
              key={color.code}
              onClick={() => setActiveColor(color.code)}
              className={`w-12 h-12 rounded-full border-2 transition-all duration-200 shadow-md hover:scale-110 ${
                activeColor === color.code
                  ? "border-white scale-110"
                  : "border-slate-700 hover:border-slate-500"
              }`}
              style={{ backgroundColor: color.code }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Cube Net */}
      <div className="grid grid-cols-3 gap-4">
        {FACES.map((face) => (
          <div key={face} className="flex flex-col items-center">
            <p className="text-xs text-slate-400 mb-2 font-semibold uppercase">{FACE_LABELS[face]}</p>
            <CubeFace
              face={face}
              stickers={cubeState[face]}
              activeColor={activeColor}
              onSticker={(index) => onSticker(face, index, activeColor)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CubeNet;
