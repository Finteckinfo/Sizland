import React from "react";

type InfoCardProps = {
    title: string;
    description: string;
    icon: string;
    iconAlt: string;
};

const InfoCard: React.FC<InfoCardProps> = ({ title, description, icon, iconAlt }) => {
    return (
        <li className="bg-navy-blue backdrop-blur-sm px-6 py-8 shadow-md rounded-2xl dark:bg-green-400">
            <img
                src={icon}
                alt={iconAlt}
                className="mx-auto h-10 w-10"
            />
            <h3 className="my-3 font-display font-medium text-white dark:text-green-100">{title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-gray-300 dark:text-green-100">{description}</p>
        </li>
    );
};

export default InfoCard;
