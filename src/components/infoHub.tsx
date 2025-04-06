import React from "react";
import { useTheme } from "next-themes";
import InfoCard from "./ui/infoCard";  // Import the InfoCard component

const InfoHub = () => {
    const { theme } = useTheme();
    
    const cardData = [
        {
            title: "Sizland News",
            description: "Sizland news around the clock for priority engagement with users",
            icon: "https://www.svgrepo.com/show/530438/ddos-protection.svg",
            iconAlt: "DDOS Protection Icon",
        },
        {
            title: "Sizland Announcements",
            description: "All your favourite Sizland announcements for public inclusion",
            icon: "https://www.svgrepo.com/show/530442/port-detection.svg",
            iconAlt: "Port Detection Icon",
        },
        {
            title: "Sizland Education",
            description: "We educate the Sizland community on crypto, blockchain and web3",
            icon: "https://www.svgrepo.com/show/530444/availability.svg",
            iconAlt: "Availability Icon",
        },
    ];

    return (
        <div className={`px-2 py-10 inset-0 -z-10 ${theme === "dark" ? "bg-navy-blue inset-shadow-2xl inset-shadow-black shadow-lg shadow-black" : "bg-white"}`}>
            <div id="features" className="mx-auto max-w-6xl">
                <p className="text-center text-base font-semibold leading-7 text-indigo-600">Infohub</p>
                <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-green-500 md:text-4xl">
                    <span className="font-pj">Sizland Info hub</span>
                </h2>

                <ul className="mt-16 grid grid-cols-1 gap-6 text-center text-slate-700 dark:text-green-900 md:grid-cols-3">
                    {cardData.map((card, index) => (
                        <InfoCard 
                            key={index} 
                            title={card.title} 
                            description={card.description} 
                            icon={card.icon} 
                            iconAlt={card.iconAlt} 
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default InfoHub;
