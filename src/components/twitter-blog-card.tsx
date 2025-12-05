'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import TweetEmbed from './tweet-embed';

interface TwitterBlogCardProps {
  tweetId: string;
  username?: string;
  title?: string;
}

const TwitterBlogCard: React.FC<TwitterBlogCardProps> = ({
  tweetId,
  username = 'sizlandofficial',
  title,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPlaceholder(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg ${
      isDark 
        ? 'bg-neutral-900/80 border border-gray-800/50' 
        : 'bg-black/5 border border-gray-200/50'
    }`}>
      {/* Placeholder Image - shown while tweet loads */}
      {showPlaceholder && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src="/sizland-platform.png"
            alt="Loading tweet..."
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Tweet Embed - styled to match card design */}
      {!showPlaceholder && (
        <div className="p-4 sm:p-6">
          <TweetEmbed 
            tweetId={tweetId}
            username={username}
            title={title}
          />
        </div>
      )}
    </div>
  );
};

export default TwitterBlogCard;

