"use client";

import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

interface HeadComponentProps {
  title: string;
  description: string;
  image?: string;
  twitterHandle?: string;
  url?: string; // Optional custom URL, defaults to current page URL
  setSocialMetadata?: boolean; // Control whether to set Open Graph/Twitter Card metadata
}

export const HeadComponent: React.FC<HeadComponentProps> = ({
  title,
  description,
  image = "https://www.siz.land/metaimage.png",
  twitterHandle = "@sizlandofficial",
  url,
  setSocialMetadata = true, // Default to true - set metadata for all pages
}) => {
  const router = useRouter();
  
  // Get current page URL - prioritize provided URL, then router pathname/asPath
  const getCurrentUrl = () => {
    if (url) return url;
    
    // Use router.asPath (includes query params) or router.pathname (route pattern)
    const path = router.asPath && router.asPath !== '/' 
      ? router.asPath 
      : (router.pathname && router.pathname !== '/' ? router.pathname : '');
    
    return `https://www.siz.land${path}`;
  };
  
  const currentUrl = getCurrentUrl();
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="preconnect" href="https://verify.walletconnect.org/" />
      
      {setSocialMetadata && (
        <>
          {/* Twitter Card data */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content={twitterHandle} />
          <meta name="twitter:creator" content={twitterHandle} />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={image} />
          
          {/* Open Graph data */}
          <meta property="og:title" content={title} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={currentUrl} />
          <meta property="og:image" content={image} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:description" content={description} />
          <meta property="og:site_name" content="Sizland" />
          <meta property="og:locale" content="en_US" />
        </>
      )}
      
      {/* Additional tags */}
      <meta name="theme-color" content="system" />
    </Head>
  );
};
