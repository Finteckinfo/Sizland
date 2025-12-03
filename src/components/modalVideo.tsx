"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import MetaBalls from "./ui/MetaBalls";

interface ModalVideoProps {
  thumb: string;
  thumbWidth?: number;
  thumbHeight?: number;
  thumbAlt?: string;
  video: string;
  videoWidth?: number;
  videoHeight?: number;
}

const ModalVideo: React.FC<ModalVideoProps> = ({
  thumb,
  thumbWidth = 768,
  thumbHeight = 432,
  thumbAlt = "Watch Video",
  video,
  videoWidth = 1920,
  videoHeight = 1080,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  // Add delay to show the MetaBalls animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 1500); // 1.5 second delay for better user experience

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Enhanced Thumbnail Button with MetaBalls Background */}
      <div className="relative cursor-pointer group w-full aspect-video" onClick={() => setIsOpen(true)}>
        {/* MetaBalls Background Effect with Delay */}
        <div className={`absolute inset-0 rounded-lg overflow-hidden transition-opacity duration-1000 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
          {showAnimation ? (
            <MetaBalls
              color="#10b981"
              cursorBallColor="#059669"
              cursorBallSize={3}
              ballCount={20}
              animationSize={25}
              enableMouseInteraction={true}
              enableTransparency={true}
              hoverSmoothness={0.08}
              clumpFactor={1.2}
              speed={0.4}
              className="w-full h-full"
            />
          ) : (
            // Loading placeholder with subtle animation
            <div className="w-full h-full bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        
        {/* Video Thumbnail with Enhanced Styling - image can bulge out */}
        <div className="relative z-0 w-full aspect-video">
          <Image
            src={thumb}
            width={thumbWidth}
            height={thumbHeight}
            alt={thumbAlt}
            className="w-full h-full object-cover rounded-lg shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-3xl"
          />
          
          {/* Enhanced Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg group-hover:bg-opacity-10 transition-all duration-300 pointer-events-none">
            <div className="relative pointer-events-auto">
              {/* Glowing Background Circle */}
              <div className="absolute inset-0 w-20 h-20 bg-green-500 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-all duration-300 group-hover:scale-110"></div>
              
              {/* Play Button */}
              <div className="relative w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-green-400 group-hover:scale-110 transition-all duration-300">
                <svg
                  className="w-8 h-8 text-white ml-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 22v-20l18 10-18 10z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Border Glow - positioned on top, stays fixed while image bulges */}
        <div className="absolute inset-0 rounded-lg border-2 border-green-400/30 group-hover:border-green-400/50 transition-all duration-300 pointer-events-none z-10"></div>
      </div>

      {/* Video Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-90 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl mx-4">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 text-white p-3 bg-gray-800/80 backdrop-blur-sm rounded-full hover:bg-gray-700/90 transition-all duration-200 hover:scale-110"
              aria-label="Close video modal"
            >
              <X size={24} />
            </button>

            {/* Video Container */}
            <div className="relative aspect-w-16 aspect-h-9 bg-black rounded-2xl overflow-hidden shadow-2xl">
              <video
                src={video}
                width={videoWidth}
                height={videoHeight}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalVideo;
