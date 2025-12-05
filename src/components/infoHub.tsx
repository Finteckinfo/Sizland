import React from "react";
import { useTheme } from "next-themes";
import InfoCard from "./ui/infoCard";
import { AuroraText } from "./ui/aurora-text";

const InfoHub = () => {
    const { theme } = useTheme();
    
    const cardData = [
        {
            title: "Sizland News",
            description: "Sizland news around the clock for priority engagement with users",
            icon: "https://www.svgrepo.com/show/530438/ddos-protection.svg",
            iconAlt: "News Icon",
            variant: "default" as const,
        },
        {
            title: "Sizland Announcements",
            description: "All your favourite Sizland announcements for public inclusion",
            icon: "https://www.svgrepo.com/show/530442/port-detection.svg",
            iconAlt: "Announcements Icon",
            variant: "highlight" as const,
        },
        {
            title: "Sizland Education",
            description: "We educate the Sizland community on crypto, blockchain and web3",
            icon: "https://www.svgrepo.com/show/530444/availability.svg",
            iconAlt: "Education Icon",
            variant: "default" as const,
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
                            iconAlt={card.iconAlt}
                            variant={card.variant}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InfoHub;
