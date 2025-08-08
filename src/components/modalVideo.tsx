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
              aria-label="Close video modal"
            >
              <X size={24} />
            </button>

            {/* Video */}
            <div className="aspect-w-16 aspect-h-9">
              {video.includes('youtube.com') || video.includes('youtu.be') ? (
                <iframe
                  src={video}
                  width={videoWidth}
                  height={videoHeight}
                  className="w-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={video}
                  width={videoWidth}
                  height={videoHeight}
                  controls
                  autoPlay
                  className="w-full rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.style.display = 'none';
                    const container = target.parentElement;
                    if (container) {
                      container.innerHTML = `
                        <div class="flex items-center justify-center w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <div class="text-center">
                            <p class="text-gray-600 dark:text-gray-400 mb-2">Video not available</p>
                            <p class="text-sm text-gray-500 dark:text-gray-500">Please add your video file to /public/videos/sizland-intro.mp4</p>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalVideo;
