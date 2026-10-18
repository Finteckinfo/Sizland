"use client";

import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { originForHost, siteConfig } from "@/lib/site";

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
  image = siteConfig.ogImage,
  twitterHandle = siteConfig.twitterHandle,
  url,
  setSocialMetadata = true, // Default to true - set metadata for all pages
}) => {
  const router = useRouter();
  
  // Get current page URL - prioritize provided URL, then router pathname/asPath
  const getCurrentUrl = () => {
    if (url) return url;
    
    const raw =
      router.asPath && router.asPath !== '/'
        ? router.asPath
        : router.pathname && router.pathname !== '/'
          ? router.pathname
          : '';
    const path = raw.split('#')[0];

    const origin =
      typeof window !== "undefined" ? originForHost(window.location.hostname) : siteConfig.url;
    return `${origin}${path || "/"}`;
  };
  
  const currentUrl = getCurrentUrl();
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={currentUrl} />
      <link rel="icon" href="/favicon.ico" />
      
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
