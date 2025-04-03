"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

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

  return (
    <>
      {/* Thumbnail Button */}
      <div className="relative cursor-pointer" onClick={() => setIsOpen(true)}>
        <Image
          src={thumb}
          width={thumbWidth}
          height={thumbHeight}
          alt={thumbAlt}
          className="rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
          <svg
            className="w-16 h-16 text-white opacity-80 hover:opacity-100 transition-opacity duration-300"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M3 22v-20l18 10-18 10z" />
          </svg>
        </div>
      </div>

      {/* Video Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="relative w-full max-w-4xl">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-white p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
            >
              <X size={24} />
            </button>

            {/* Video */}
            <div className="aspect-w-16 aspect-h-9">
              <video
                src={video}
                width={videoWidth}
                height={videoHeight}
                controls
                autoPlay
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalVideo;
