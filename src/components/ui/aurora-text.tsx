"use client";

import React, { memo } from "react";
import { useTheme } from "next-themes";

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

export const AuroraText = memo(
  ({
    children,
    className = "",
    colors,
    speed = 1,
  }: AuroraTextProps) => {
    const { theme, systemTheme } = useTheme();
    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = currentTheme === "dark";

    // Default colors based on theme if not provided
    // Dark mode: white → lighter green shades
    const defaultColors = isDark
      ? ["#f9fafb", "#e5e7eb", "#22c55e", "#4ade80", "#a7f3d0", "#22c55e"]
      // Light mode: black → darker green shades so text stays readable on light bg
      : ["#000000", "#111827", "#14532d", "#15803d", "#16a34a", "#22c55e"];

    const finalColors = colors || defaultColors;

    const gradientStyle: React.CSSProperties = {
      backgroundImage: `linear-gradient(135deg, ${finalColors.join(", ")}, ${finalColors[0]})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      animationDuration: `${10 / speed}s`,
    };

    return (
      <span className={`relative inline-block ${className}`}>
        <span className="sr-only">{children}</span>
        <span
          className="animate-aurora relative bg-[length:200%_auto] bg-clip-text text-transparent"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    );
  }
);

AuroraText.displayName = "AuroraText";

export default AuroraText;


