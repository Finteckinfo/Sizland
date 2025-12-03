import React from "react";

type AnimatedGridProps = {
  className?: string;
};

/**
 * Animated grid used behind the hero section.
 * The subtle green lines and moving "lights" are driven by CSS only,
 * keeping this component purely presentational.
 */
export const AnimatedGrid: React.FC<AnimatedGridProps> = ({ className = "" }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="hero-grid-layer">
        {/* Grid surface */}
        <div className="hero-grid-surface" />

        {/* Perimeter light streaks */}
        <div className="hero-grid-perimeter">
          <span className="grid-streak grid-streak-top-1" />
          <span className="grid-streak grid-streak-top-2" />
          <span className="grid-streak grid-streak-right-1" />
          <span className="grid-streak grid-streak-right-2" />
          <span className="grid-streak grid-streak-bottom-1" />
          <span className="grid-streak grid-streak-bottom-2" />
          <span className="grid-streak grid-streak-left-1" />
          <span className="grid-streak grid-streak-left-2" />
        </div>
      </div>
    </div>
  );
};

export default AnimatedGrid;


