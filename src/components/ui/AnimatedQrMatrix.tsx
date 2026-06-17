"use client";

import { useEffect, useMemo, useState } from "react";

type AnimatedQrMatrixProps = {
  seed: string;
  className?: string;
};

// ─── QR parameters ────────────────────────────────────────────────────────────
// 17×17 gives real 7×7 finder eyes, no alignment pattern needed (Version <2).
// Each module is ~7 px at 130 px display size → clearly readable as QR.
const SIZE = 17;
const PAD = 1;                  // 1-unit quiet zone on each side (SVG units)
const VIEWBOX = SIZE + PAD * 2; // 19 SVG units total
const DISPLAY_PX = 88;
const FRAME_COUNT = 6;
const FRAME_MS = 2800;          // hold time between frame changes
const TRANS_MS = 680;           // per-module fill transition duration
const STAGGER_MAX = 850;        // max per-module delay (ms)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function lcg(seed: number) {
  let s = (seed || 1) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ─── 17×17 QR structure ───────────────────────────────────────────────────────
//
//  Layout (0-indexed):
//    TL finder  : rows 0-6,  cols 0-6    (7×7)
//    TL sep row : row 7,     cols 0-7    (light)
//    TL sep col : col 7,     rows 0-7    (light)
//    TR finder  : rows 0-6,  cols 10-16  (7×7)
//    TR sep row : row 7,     cols 9-16   (light)
//    TR sep col : col 9,     rows 0-7    (light)
//    BL finder  : rows 10-16, cols 0-6   (7×7)
//    BL sep row : row 9,     cols 0-7    (light)
//    BL sep col : col 7,     rows 9-16   (light)
//    Timing (6,8) and (8,6): dark
//    Data : rows 7-16, cols 8-16  + (8,7) + (7,8)  (≈ 83 cells)

function isFixed(r: number, c: number): boolean {
  if (r <= 7 && c <= 7) return true;  // TL finder + separators
  if (r <= 7 && c >= 9) return true;  // TR finder + separators
  if (r >= 9 && c <= 7) return true;  // BL finder + separators
  if (r === 6 && c === 8) return true; // timing
  if (r === 8 && c === 6) return true; // timing
  return false;
}

// Value of a single 7×7 QR finder at local coords (lr, lc) in 0..6
function finderDark(lr: number, lc: number): boolean {
  const outer = lr === 0 || lr === 6 || lc === 0 || lc === 6;
  const core = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
  return outer || core;
}

function getFixedValue(r: number, c: number): boolean {
  // Separator rows/cols always light
  if (r === 7 || r === 9) return false;
  if (c === 7 || c === 9) return false;
  // Timing cells (even index → dark)
  if (r === 6 && c === 8) return true;
  if (r === 8 && c === 6) return true;
  // Finder patterns
  if (r <= 6 && c <= 6) return finderDark(r, c);       // TL
  if (r <= 6 && c >= 10) return finderDark(r, c - 10);  // TR
  if (r >= 10 && c <= 6) return finderDark(r - 10, c);  // BL
  return false;
}

// ─── Frame builder ────────────────────────────────────────────────────────────
function buildFrame(seed: string, fi: number): boolean[][] {
  const rng = lcg(simpleHash(`${seed}::${fi}`));

  const slots: [number, number][] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!isFixed(r, c)) slots.push([r, c]);

  // Fisher-Yates shuffle
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  const darkSet = new Set<string>();
  const darkCount = Math.floor(slots.length * 0.46);
  for (let i = 0; i < darkCount; i++) darkSet.add(`${slots[i][0]},${slots[i][1]}`);

  return Array.from({ length: SIZE }, (_, r) =>
    Array.from({ length: SIZE }, (_, c) =>
      isFixed(r, c) ? getFixedValue(r, c) : darkSet.has(`${r},${c}`)
    )
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnimatedQrMatrix({ seed }: AnimatedQrMatrixProps) {
  const frames = useMemo(
    () => Array.from({ length: FRAME_COUNT }, (_, i) => buildFrame(seed, i)),
    [seed]
  );

  const [fi, setFi] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFi((f) => (f + 1) % FRAME_COUNT), FRAME_MS);
    return () => clearInterval(id);
  }, []);

  const grid = frames[fi];

  return (
    <div
      aria-hidden="true"
      style={{ width: DISPLAY_PX, height: DISPLAY_PX, flexShrink: 0 }}
    >
      {/*
        shapeRendering="crispEdges" → pixel-perfect hard-edge squares, no anti-aliasing.
        Each data rect uses CSS fill transition with a deterministic per-cell delay.
        Fixed cells (finder eyes, separators, timing) have no transition — always crisp.
        Result: smooth ripple animation with no whole-component blink.
      */}
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        width={DISPLAY_PX}
        height={DISPLAY_PX}
        shapeRendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={VIEWBOX} height={VIEWBOX} fill="white" />
        {Array.from({ length: SIZE }, (_, r) =>
          Array.from({ length: SIZE }, (_, c) => {
            const fixed = isFixed(r, c);
            const dark = grid[r][c];
            // Deterministic stagger: spread delays across 0..STAGGER_MAX
            const delay = fixed ? 0 : simpleHash(`d:${r}:${c}`) % STAGGER_MAX;
            return (
              <rect
                key={`${r}:${c}`}
                x={c + PAD}
                y={r + PAD}
                width={1}
                height={1}
                style={{
                  fill: dark ? "#0f172a" : "#ffffff",
                  transition: fixed
                    ? undefined
                    : `fill ${TRANS_MS}ms ease-in-out ${delay}ms`,
                }}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
