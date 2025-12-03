import React from "react";

type GlowBackgroundProps = {
  /** "top" glow sits behind the hero / header, "bottom" sits near the footer */
  position?: "top" | "bottom";
  /** Optional extra classes to fine‑tune placement per page */
  className?: string;
};

/**
 * Soft green radial glow used behind the page.
 * - Dark mode: black base with vibrant green glow
 * - Light mode: white base with softer mint glow
 *
 * This is purely decorative and intentionally does not accept content.
 */
export const GlowBackground: React.FC<GlowBackgroundProps> = ({
  position = "top",
  className = "",
}) => {
  const basePositionClass =
    position === "top"
      ? "top-[-12vh] md:top-[-16vh]"
      : "bottom-[-30vh] md:bottom-[-40vh]";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${basePositionClass} ${className}`}
    >
      {/* Core oval glow */}
      <div className="glow-ellipse glow-ellipse-primary" />

      {/* Extra ring for stronger bottom glow */}
      {position === "bottom" && (
        <div className="glow-ellipse glow-ellipse-secondary" />
      )}
    </div>
  );
};

export default GlowBackground;


