'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Calendar, MessageCircle, Heart, Repeat2 } from 'lucide-react';
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

interface TwitterEmbedProps {
  tweetId?: string;
  username?: string;
  showTimeline?: boolean;
  maxTweets?: number;
}

const TwitterEmbed: React.FC<TwitterEmbedProps> = ({ 
  tweetId, 
  username = 'sizlandofficial',
  showTimeline = true,
  maxTweets = 5
}) => {
  const { resolvedTheme: theme } = useTheme();
  const isDark = theme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  useEffect(() => {
    const loadTwitterWidgets = () => {
      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
      if (existingScript) {
        existingScript.remove();
      }

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
          setWidgetLoaded(true);
          
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
    };

    // Initial load
    loadTwitterWidgets();

    // Cleanup function
    return () => {
      const script = document.getElementById('twitter-widgets-script');
      if (script) {
        script.remove();
      }
    };
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
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Failed to Load Twitter Feed</h3>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Latest from @{username}</h3>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-black'}`}>Stay updated with our latest news and updates</p>
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
              href={`https://twitter.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Visit @${username} on Twitter`}
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
          <p className={isDark ? "text-gray-400" : "text-black"}>Loading Twitter feed...</p>
        </div>
      )}

      {/* Specific Tweet Embed */}
      {tweetId && !isLoading && (
        <div className={`${isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-xl p-4 sm:p-6 border`}>
          <h4 className={`text-base sm:text-lg font-semibold mb-4 flex items-center justify-center sm:justify-start gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            Featured Tweet
          </h4>
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
          <div className="mt-4 text-center">
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

      {/* Timeline Embed */}
      {showTimeline && !isLoading && (
        <div className={`${isDark ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-xl p-4 sm:p-6 border`}>
          <h4 className={`text-base sm:text-lg font-semibold mb-4 flex items-center justify-center sm:justify-start gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
            <Repeat2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            Recent Tweets
          </h4>
          <div className="flex justify-center w-full">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
              <a
                className="twitter-timeline w-full"
                data-theme={isDark ? "dark" : "light"}
                data-chrome="noheader nofooter noborders"
                data-tweet-limit={maxTweets}
                data-width="100%"
                data-height="600"
                href={`https://twitter.com/${username}?ref_src=twsrc%5Etfw`}
                title={`Timeline by @${username}`}
              >
                Tweets by {username}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center">
        <p className={`text-sm mb-2 ${isDark ? 'text-gray-500' : 'text-black'}`}>
          Follow us on Twitter for the latest updates
        </p>
        <Button
          asChild
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <a 
            href={`https://twitter.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Follow @{username}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default TwitterEmbed;
