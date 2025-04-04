import React from "react";
import { useTheme } from "next-themes";

const InfoHub = () => {
    const { theme } = useTheme();

    return (
        <div className={` px-2 py-10 inset-0 -z-10 ${theme === "dark" ? "bg-navy-blue inset-shadow-2xl inset-shadow-black shadow-lg shadow-black" : "bg-white"
            }`}>
            <div id="features" className="mx-auto max-w-6xl">
                <p className="text-center text-base font-semibold leading-7 text-indigo-600">
                    Infohub
                </p>
                <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-green-500 md:text-4xl">
                    Sizland Info hub
                </h2>

                <ul className="mt-16 grid grid-cols-1 gap-6 text-center text-slate-700 dark:text-green-900 md:grid-cols-3">
                    <li className="bg-navy-blue backdrop-blur-sm px-6 py-8 shadow-md rounded-lg dark:bg-green-400">
                        <img
                            src="https://www.svgrepo.com/show/530438/ddos-protection.svg"
                            alt="DDOS Protection Icon"
                            className="mx-auto h-10 w-10"
                        />
                        <h3 className="my-3 font-display font-medium text-white dark:text-green-100">Sizland News</h3>
                        <p className="mt-1.5 text-sm leading-6 text-gray-300 dark:text-green-100">
                            Sizland news around the clock for priority engagement with users
                        </p>
                    </li>

                    <li className="bg-navy-blue backdrop-blur-sm px-6 py-8 shadow-md rounded-lg dark:bg-green-400">
                        <img
                            src="https://www.svgrepo.com/show/530442/port-detection.svg"
                            alt="Port Detection Icon"
                            className="mx-auto h-10 w-10"
                        />
                        <h3 className="my-3 font-display font-medium text-white dark:text-green-100">Sizland Announcements</h3>
                        <p className="mt-1.5 text-sm leading-6 text-gray-300 dark:text-green-100">
                            All your favourite Sizland announcements for public inclusion
                        </p>
                    </li>

                    <li className="bg-navy-blue backdrop-blur-sm px-6 py-8 shadow-md rounded-lg dark:bg-green-400">
                        <img
                            src="https://www.svgrepo.com/show/530444/availability.svg"
                            alt="Availability Icon"
                            className="mx-auto h-10 w-10"
                        />
                        <h3 className="my-3 font-display font-medium text-white dark:text-green-100">Sizland Education</h3>
                        <p className="mt-1.5 text-sm leading-6 text-gray-300 dark:text-green-100">
                            We educate the Sizland community on crypto, blockchain and web3
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default InfoHub;

