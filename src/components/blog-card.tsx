'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { ExternalLink } from 'lucide-react';

interface BlogCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  tweetUrl?: string;
  isLoading?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({
  title,
  description,
  imageUrl,
  tweetUrl,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [imageError, setImageError] = useState(false);

  // Use placeholder image if no image URL or if there's an error
  const displayImage = imageError || !imageUrl 
    ? '/sizland-platform.png' 
    : imageUrl;

  return (
    <div className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg ${
      isDark 
        ? 'bg-neutral-900/80 border border-gray-800/50' 
        : 'bg-black/5 border border-gray-200/50'
    }`}>
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden">
        {isLoading ? (
          <div className={`w-full h-full flex items-center justify-center ${
            isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
          }`}>
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Image
            src={displayImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${
          isDark ? 'text-white' : 'text-black'
        }`}>
          {title}
        </h3>
        <p className={`text-sm leading-6 line-clamp-3 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {description}
        </p>
        
        {tweetUrl && (
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 inline-flex items-center gap-2 text-sm font-medium transition-colors ${
              isDark 
                ? 'text-green-400 hover:text-green-300' 
                : 'text-green-600 hover:text-green-700'
            }`}
          >
            Read more
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};

export default BlogCard;

