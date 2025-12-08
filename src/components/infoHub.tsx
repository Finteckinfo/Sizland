import React from "react";
import { useTheme } from "next-themes";
import InfoCard from "./ui/infoCard";
import { AuroraText } from "./ui/aurora-text";

const InfoHub = () => {
    const { theme } = useTheme();
    
    const cardData = [
        {
            title: "What We're Building",
            description: "Task → Approval → Instant Payout. We're building the boring rails remote teams need for clean operations and fast payments.",
            icon: { src: "https://www.svgrepo.com/show/530438/ddos-protection.svg", alt: "Building Icon" },
            variant: "default" as const,
            buttonText: "Try Our Platform",
            buttonLink: "/wallet",
        },
        {
            title: "Community",
            description: "Join our growing community of remote teams and blockchain enthusiasts. Follow our daily updates and be part of the journey.",
            icon: { src: "https://www.svgrepo.com/show/530442/port-detection.svg", alt: "Community Icon" },
            variant: "highlight" as const,
            buttonText: "Join our community",
            buttonLink: "https://twitter.com/sizlandofficial",
        },
        {
            title: "Daily Updates",
            description: "We ship in public, daily. Follow our progress as we build the future of remote team management and blockchain solutions.",
            icon: { src: "https://www.svgrepo.com/show/530444/availability.svg", alt: "Updates Icon" },
            variant: "default" as const,
            buttonText: "Follow Updates",
            buttonLink: "https://twitter.com/sizlandofficial",
        },
    ];

    return (
        <section className="relative py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Pill badge */}
                <div className="flex justify-center mb-4">
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300">
                        Infohub
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-center font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-16 leading-tight">
                    <span className={theme === "dark" ? "text-white" : "text-black"}>
                        Sizland Info{" "}
                    </span>
                    <AuroraText>hub</AuroraText>
                </h2>

                {/* Cards grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {cardData.map((card, index) => (
                        <InfoCard 
                            key={index} 
                            title={card.title} 
                            description={card.description} 
                            icon={card.icon}
                            variant={card.variant}
                            buttonText={card.buttonText}
                            buttonLink={card.buttonLink}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InfoHub;
