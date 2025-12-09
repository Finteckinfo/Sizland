'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

// Extend Window interface for Twitter widgets
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void;
      };
    };
  }
}

interface TweetEmbedProps {
  tweetId: string;
  username?: string;
  title?: string;
}

const TweetEmbed: React.FC<TweetEmbedProps> = ({ 
  tweetId, 
  username = 'sizlandofficial',
  title = "Tweet"
}) => {
  const { resolvedTheme: theme } = useTheme();
  const isDark = theme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTwitterWidgets = () => {
      // Check if script is already loaded
      const existingScript = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
      
      if (existingScript) {
        // Script already exists, just load widgets
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load();
          setIsLoading(false);
        } else {
          // Wait for script to be ready
          setTimeout(() => {
            if (window.twttr && window.twttr.widgets) {
              window.twttr.widgets.load();
              setIsLoading(false);
            }
          }, 500);
        }
      } else {
        // Load Twitter widgets script
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        script.id = 'twitter-widgets-script';
        
        script.onload = () => {
          console.log('Twitter widgets script loaded');
          if (window.twttr && window.twttr.widgets) {
            window.twttr.widgets.load();
            setIsLoading(false);
            
            // Force reload after a short delay to ensure widgets render
            setTimeout(() => {
              if (window.twttr && window.twttr.widgets) {
                window.twttr.widgets.load();
              }
            }, 1000);
          }
        };
        
        script.onerror = () => {
          console.error('Failed to load Twitter widgets script');
          setError('Failed to load Twitter widgets');
          setIsLoading(false);
        };
        
        document.head.appendChild(script);
      }
    };

    // Initial load
    loadTwitterWidgets();
  }, []);

  const refreshWidgets = () => {
    setIsLoading(true);
    setError(null);
    
    // Force reload the Twitter widgets
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }
    
    // Also try to reload the script
    const script = document.getElementById('twitter-widgets-script');
    if (script) {
      script.remove();
    }
    
    // Reload script
    const newScript = document.createElement('script');
    newScript.src = 'https://platform.twitter.com/widgets.js';
    newScript.async = true;
    newScript.charset = 'utf-8';
    newScript.id = 'twitter-widgets-script';
    
    newScript.onload = () => {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      }
    };
    
    document.head.appendChild(newScript);
  };

  if (error) {
    return (
      <div className={`${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-100 border-gray-300'} backdrop-blur-sm rounded-xl p-6 border text-center`}>
        <div className={`${isDark ? 'text-red-400' : 'text-red-600'} mb-4`}>
          <MessageCircle className="w-12 h-12 mx-auto mb-2" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Failed to Load Tweet</h3>
        </div>
        <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-black'}`}>{error}</p>
        <Button 
          onClick={refreshWidgets}
          variant="outline"
          className={isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-400 text-black hover:bg-gray-200"}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-xl p-4 sm:p-6 border`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-3 mb-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h4 className={`text-base sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{title}</h4>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-black'}`}>From @{username}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={refreshWidgets}
            variant="ghost"
            size="sm"
            className={isDark ? "text-gray-400 hover:text-white" : "text-black hover:text-gray-700"}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={isDark ? "text-gray-400 hover:text-white" : "text-black hover:text-gray-700"}
          >
            <a 
              href={`https://twitter.com/${username}/status/${tweetId}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`View tweet by @${username}`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={`${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-100 border-gray-300'} backdrop-blur-sm rounded-xl p-8 border text-center`}>
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? "text-gray-400" : "text-black"}>Loading tweet...</p>
        </div>
      )}

      {/* Tweet Embed */}
      {!isLoading && (
        <div className="space-y-4">
          <div className="flex justify-center w-full">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
              <blockquote 
                className="twitter-tweet w-full" 
                data-media-max-width="560"
                data-theme={isDark ? "dark" : "light"}
                data-chrome="noheader nofooter noborders"
                data-dnt="true"
              >
                <a href={`https://twitter.com/${username}/status/${tweetId}`} title={`Tweet by @${username}`}></a>
              </blockquote>
            </div>
          </div>
          
          {/* Fallback Link */}
          <div className="text-center">
            <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-black'}`}>Having trouble viewing the tweet?</p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className={isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-400 text-black hover:bg-gray-200"}
            >
              <a 
                href={`https://twitter.com/${username}/status/${tweetId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                View on Twitter
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TweetEmbed;
