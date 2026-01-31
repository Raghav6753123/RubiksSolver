# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Already in `/workspaces/RubiksSolver` directory

## Installation & Run

```bash
# Install dependencies (already done)
npm install

# Start dev server
npm run dev

# Output will show:
# ✓ 200 modules transformed.
# ➜  Local:   http://localhost:5173/
```

Then open **http://localhost:5173** in your browser.

## Test the App (5 min walkthrough)

### Step 1: Paint the 2D Net
1. Look at the **left panel** with 6 faces (U, D, L, R, F, B)
2. Click a **color button** at the top (e.g., Red)
3. Click stickers in the **2D grid** to paint them red
4. Notice the **3D cube on the right** updates in real-time

### Step 2: Solve
1. Click the **"Solve" button** (cyan/blue button)
2. Watch the solution appear below the button (e.g., "U R U' R' ...")
3. The **3D cube animates** the moves step-by-step on the right

### Step 3: Inspect 3D Cube
1. **Click + drag** the 3D cube to rotate it manually
2. **Scroll** to zoom in/out
3. Verify colors match what you painted in 2D net

### Step 4: Reset
1. Click **"Reset"** button to clear everything
2. Start over with a solved cube

---

## Backend Solver Setup (Optional)

### For Testing Without Backend
- The app currently uses a **demo solver** that returns placeholder moves: `"U R U' R' U' F' U F"`
- This is perfect for testing the UI and animation flow

### When You Have C++ Backend Ready

1. **Ensure your C++ server is running** on port 5000 (or set env var):
   ```bash
   # In your C++ solver project
   ./solver_server --port 5000
   ```

2. **Update the API endpoint** in [src/lib/solver.js](src/lib/solver.js):
   - Uncomment lines 23-30
   - Comment out line 35 (demo solver)

3. **Expected HTTP Signature**:
   ```
   POST /solve
   Content-Type: application/json
   Body: {
     "state": "UUUUUUUUURRRRRRRRR..." // 54-char notation (6 faces × 9 stickers)
   }
   
   Response:
   {
     "moves": "U R2 F' L D2 B' ..."  // Space-separated move notation
   }
   ```

4. **Notation Format**:
   - Each face (U, R, F, D, L, B) has 9 stickers in **row-major order** (top-left to bottom-right)
   - Example: `UUUUUUUUU` = 9 white stickers (Up face)
   - Order of faces in string: U, R, F, D, L, B

---

## Troubleshooting

### Port 5173 already in use?
```bash
npm run dev -- --port 5174
```

### Module not found errors?
```bash
rm -rf node_modules package-lock.json
npm install
```

### 3D canvas not rendering?
- Check browser console for WebGL errors
- Ensure your GPU drivers are up to date
- Try a different browser (Chrome/Firefox/Safari)

### Solver returning empty moves?
- Check backend is running on correct port
- Verify API endpoint format matches expected signature
- Check browser Network tab for failed requests

---

## Project Structure Quick Reference

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main layout (split-screen) + state management |
| `src/components/Cube3D.jsx` | 3D rendering + animation |
| `src/components/CubeNet.jsx` | 2D net input interface |
| `src/lib/cubeState.js` | State conversion (colors ↔ notation) |
| `src/lib/solver.js` | Backend API adapter (swap point for C++) |
| `src/lib/cubeAnimation.js` | Move animation engine |

---

## Environment Variables

```bash
# Custom solver API endpoint (default: http://localhost:5000)
export REACT_APP_SOLVER_API=http://my-solver-server.com:8080
npm run dev
```

---

**Ready to test? Run `npm run dev` and open http://localhost:5173** 🎉
