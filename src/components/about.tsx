import React from "react";
import { Button1 } from "@/components/ui/button1";
import { useTheme } from "next-themes";

const About = () => {
    const { theme } = useTheme();

    return (
        <>
            <section className="overflow-hidden pt-20 pb-12 lg:pt-[120px] lg:pb-[90px] bg-transparent">
                <div className="container mx-auto">
                    <div className="flex flex-wrap items-center justify-between -mx-4">
                        <div className="w-full px-4 lg:w-6/12">
                            <div className="flex items-center -mx-3 sm:-mx-4">
                                <div className="w-full px-3 sm:px-4 xl:w-1/2">
                                    <div className="py-3 sm:py-4">
                                        <img
                                            src={
                                                theme === "dark"
                                                  ? "/Algorand-lightmode.jpg"
                                                  : "/Algorand-darkmode.jpg"
                                              }
                                              alt="Algorand"
                                            className="w-full rounded-2xl"
                                        />
                                    </div>
                                    <div className="py-3 sm:py-4">
                                        <img
                                            src={
                                                theme === "dark"
                                                  ? "/ethereum-lightmode.jpg"
                                                  : "/ethereum-darkmode.png"
                                              }
                                              alt="Ethereum"
                                            className="w-full rounded-2xl"
                                        />
                                    </div>
                                </div>
                                <div className="w-full px-3 sm:px-4 xl:w-1/2">
                                    <div className={`relative z-10 my-4 ${theme === "dark" ? "bg-black p-2" : "bg-white p-2 rounded-2xl"}`}>
                                        <img
                                            src={
                                                theme === "dark"
                                                  ? "/sui-darkmode.png"
                                                  : "/sui-lightmode.png"
                                              }
                                              alt="Sui"
                                            className="w-full rounded-2xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full px-4 lg:w-1/2 xl:w-5/12">
                            <div className="mt-10 lg:mt-0">
                                <span className="block mb-4 text-lg font-semibold text-dark dark:text-white">
                                    SIZ
                                </span>
                                <h2 className="mb-5 text-3xl font-bold text-dark dark:text-white sm:text-[40px]/[48px]">
                                    Built upon state of the art blockchain platforms in a multi chain world!
                                </h2>
                                <p className="mb-5 text-base text-body-color dark:text-dark-6">
                                Algorand, SUI, Ethereum


                                </p>
                                <p className="mb-8 text-base text-body-color dark:text-dark-6">
                                Ethereum (Base & BNB): Built for security and adoption, seamlessly integrates with DeFi, providing a reliable foundation for Sizland’s ERP.
                                <br/>
                                Sui: Built for speed and scalability, Sui supports dynamic transactions, ensuring high performance in Sizland’s ERP system.
                                <br/>

Algorand: Built for fast transactions and low costs, Algorand ensures smooth, sustainable operations within Sizland’s ERP.
                                </p>
                                <a
  href="https://linktr.ee/sizlandinvest"
  target="_blank"
  rel="noopener noreferrer"
>
  <Button1 className="mb-4">
    Learn More
  </Button1>
</a>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default About;
