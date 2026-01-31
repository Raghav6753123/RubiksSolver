import React from "react";

function CubeFace({ face, stickers, activeColor, onSticker }) {
  return (
    <div className="bg-slate-700 p-2 rounded-lg">
      <div className="grid grid-cols-3 gap-1 w-32">
        {stickers.map((color, index) => (
          <button
            key={index}
            onClick={() => onSticker(index)}
            className="w-10 h-10 rounded border-2 border-slate-600 hover:border-slate-400 transition-all hover:scale-105 shadow-md"
            style={{ backgroundColor: color }}
            title={`${face}${index}`}
          />
        ))}
      </div>
    </div>
  );
}

export default CubeFace;
