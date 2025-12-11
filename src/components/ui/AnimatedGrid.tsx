"use client";

import React from "react";

type AnimatedGridProps = {
  className?: string;
};

/**
 * Static animated grid used behind the top layout (hero region).
 * - Full-viewport width
 * - Rectangular (width >> height), height controlled by parent
 */
export const AnimatedGrid: React.FC<AnimatedGridProps> = ({ className = "" }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden -z-10 ${
        className || "h-[420px] sm:h-[520px] lg:h-[620px]"
      }`}
    >
      <div className="hero-grid-layer h-full">
        <div className="hero-grid-surface h-full" />
      </div>
    </div>
  );
};

export default AnimatedGrid;
