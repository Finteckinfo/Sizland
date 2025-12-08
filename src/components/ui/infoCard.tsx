"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type InfoCardProps = {
    title: string;
    description: string;
    icon: { src: string; alt: string; className?: string };
    variant?: "default" | "highlight";
    buttonText?: string;
    buttonLink?: string;
    buttonOnClick?: () => void;
};

const InfoCard: React.FC<InfoCardProps> = ({ 
    title, 
    description, 
    icon, 
    variant = "default",
    buttonText,
    buttonLink,
    buttonOnClick
}) => {
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
        <div className={`${cardClasses} rounded-xl p-6 transition-all hover:shadow-xl flex flex-col`}>
            {/* Icon at top-left */}
            <div className="mb-4">
                <div className="relative h-12 w-12">
                    <Image
                        src={icon.src}
                        alt={icon.alt}
                        fill
                        sizes="48px"
                        className={cn("object-contain", icon.className)}
                    />
                </div>
            </div>

            {/* Title */}
            <h3 className={`${titleColor} font-display font-bold text-lg mb-3 text-left`}>
                {title}
            </h3>

            {/* Description */}
            <p className={`${descriptionColor} text-sm leading-6 text-left mb-4`}>
                {description}
            </p>

            {/* Button */}
            {buttonText && (
                <div className="mt-auto">
                    {buttonLink ? (
                        <a
                            href={buttonLink}
                            target={buttonLink.startsWith('http') ? '_blank' : undefined}
                            rel={buttonLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className={`inline-block px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                variant === "highlight"
                                    ? "bg-black text-white hover:bg-gray-800"
                                    : isDark
                                        ? "bg-gray-800 text-white hover:bg-gray-700"
                                        : "bg-gray-900 text-white hover:bg-gray-800"
                            }`}
                        >
                            {buttonText}
                        </a>
                    ) : buttonOnClick ? (
                        <button
                            onClick={buttonOnClick}
                            className={`inline-block px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                variant === "highlight"
                                    ? "bg-black text-white hover:bg-gray-800"
                                    : isDark
                                        ? "bg-gray-800 text-white hover:bg-gray-700"
                                        : "bg-gray-900 text-white hover:bg-gray-800"
                            }`}
                        >
                            {buttonText}
                        </button>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default InfoCard;
