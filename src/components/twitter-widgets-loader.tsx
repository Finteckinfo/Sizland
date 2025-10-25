'use client';

import { useEffect } from 'react';

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

const TwitterWidgetsLoader = () => {
  useEffect(() => {
    // Check if Twitter widgets script is already loaded
    if (document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
      return;
    }

    // Load Twitter widgets script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    script.id = 'twitter-widgets-global';
    
    script.onload = () => {
      console.log('Global Twitter widgets script loaded');
      // Load widgets after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load();
        }
      }, 1000);
    };
    
    script.onerror = () => {
      console.error('Failed to load global Twitter widgets script');
    };
    
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const script = document.getElementById('twitter-widgets-global');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default TwitterWidgetsLoader;
