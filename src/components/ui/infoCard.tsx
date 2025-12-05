"use client";

import React from "react";
import { useTheme } from "next-themes";

type InfoCardProps = {
    title: string;
    description: string;
    icon: string;
    iconAlt: string;
    variant?: "default" | "highlight";
};

const InfoCard: React.FC<InfoCardProps> = ({ title, description, icon, iconAlt, variant = "default" }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Determine card styling based on variant
    const cardClasses = variant === "highlight"
        ? "bg-gradient-to-br from-green-500 via-green-400 to-green-300 shadow-lg"
        : isDark
            ? "bg-neutral-900/80 backdrop-blur-sm shadow-md"
            : "bg-white shadow-md";

    // Determine text colors based on variant and theme
    const titleColor = variant === "highlight"
        ? "text-black"
        : isDark
            ? "text-white"
            : "text-black";

    const descriptionColor = variant === "highlight"
        ? "text-neutral-800"
        : isDark
            ? "text-neutral-300"
            : "text-neutral-600";

    return (
        <div className={`${cardClasses} rounded-xl p-6 transition-all hover:shadow-xl`}>
            {/* Icon at top-left */}
            <div className="mb-4">
                <img
                    src={icon}
                    alt={iconAlt}
                    className="h-10 w-10"
                    style={{
                        filter: variant === "highlight" 
                            ? "brightness(0)" 
                            : isDark 
                                ? "brightness(0) invert(0.6)" 
                                : "brightness(0) invert(0.3)"
                    }}
                />
            </div>

            {/* Title */}
            <h3 className={`${titleColor} font-display font-bold text-lg mb-3 text-left`}>
                {title}
            </h3>

            {/* Description */}
            <p className={`${descriptionColor} text-sm leading-6 text-left`}>
                {description}
            </p>
        </div>
    );
};

export default InfoCard;
