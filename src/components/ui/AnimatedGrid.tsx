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
      <div className="hero-grid-layer" />
    </div>
  );
};

export default AnimatedGrid;


