"use client";

import React, { useEffect, useState } from "react";

type AnimatedGridProps = {
  className?: string;
};

type Streak = {
  id: number;
  /** position along perimeter, 0–1 */
  t: number;
  /** rate of travel per second */
  speed: number;
  /** relative length (fraction of side length) */
  length: number;
};

const createInitialStreaks = (): Streak[] => [
  { id: 1, t: 0.05, speed: 0.015, length: 0.18 },
  { id: 2, t: 0.28, speed: 0.011, length: 0.24 },
  { id: 3, t: 0.53, speed: 0.017, length: 0.16 },
  { id: 4, t: 0.71, speed: 0.013, length: 0.20 },
  { id: 5, t: 0.84, speed: 0.009, length: 0.30 },
  { id: 6, t: 0.92, speed: 0.014, length: 0.14 },
];

/**
 * Map `t` in [0,1) around a rectangle perimeter to a positioned streak.
 * The streak moves strictly along the edges and turns hard 90° corners.
 */
function getStreakStyle(streak: Streak): React.CSSProperties {
  const w = 100; // logical width
  const h = 60; // logical height
  const perimeter = 2 * (w + h);
  const dist = (streak.t % 1 + 1) % 1 * perimeter;

  let left = 0;
  let top = 0;
  let width = 0;
  let height = 0;
  let background = "";

  if (dist < w) {
    // Top edge: left -> right
    const x = dist;
    const offset = (x / w) * 100;
    left = offset;
    top = 0;
    width = streak.length * 100;
    height = 0.6;
    background =
      "linear-gradient(to right, transparent, rgba(74,222,128,1), transparent)";
  } else if (dist < w + h) {
    // Right edge: top -> bottom
    const y = dist - w;
    const offset = (y / h) * 100;
    left = 100;
    top = offset;
    width = 0.6;
    height = streak.length * 100;
    background =
      "linear-gradient(to bottom, transparent, rgba(74,222,128,1), transparent)";
  } else if (dist < w + h + w) {
    // Bottom edge: right -> left
    const x = dist - (w + h);
    const offset = 100 - (x / w) * 100;
    left = offset;
    top = 100;
    width = streak.length * 100;
    height = 0.6;
    background =
      "linear-gradient(to left, transparent, rgba(74,222,128,1), transparent)";
  } else {
    // Left edge: bottom -> top
    const y = dist - (w + h + w);
    const offset = 100 - (y / h) * 100;
    left = 0;
    top = offset;
    width = 0.6;
    height = streak.length * 100;
    background =
      "linear-gradient(to top, transparent, rgba(74,222,128,1), transparent)";
  }

  // Soft fade in/out over each loop
  const localT = (streak.t % 1 + 1) % 1;
  const opacity =
    localT < 0.1 || localT > 0.9 ? localT * 10 * 0.6 : 0.6 + (0.2 - Math.abs(0.5 - localT)) * 0.4;

  return {
    position: "absolute",
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
    background,
    boxShadow: "0 0 18px rgba(74,222,128,0.9)",
    opacity,
    borderRadius: 9999,
    pointerEvents: "none",
  };
}

/**
 * Animated grid used behind the top layout (hero region).
 * Grid lines are pure CSS; streaks are animated in JS along the perimeter.
 */
export const AnimatedGrid: React.FC<AnimatedGridProps> = ({ className = "" }) => {
  const [streaks, setStreaks] = useState<Streak[]>(() => createInitialStreaks());

  useEffect(() => {
    let last = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const dt = (now - last) / 1000; // seconds
      last = now;

      setStreaks((prev) =>
        prev.map((s) => ({
          ...s,
          t: s.t + s.speed * dt,
        }))
      );

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${className}`}
    >
      <div className="hero-grid-layer h-full">
        <div className="hero-grid-surface h-full" />
        <div className="hero-grid-perimeter">
          {streaks.map((streak) => (
            <span
              key={streak.id}
              className="grid-streak"
              style={getStreakStyle(streak)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedGrid;
