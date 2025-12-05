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
}

export const HeadComponent: React.FC<HeadComponentProps> = ({
  title,
  description,
  image = "https://www.siz.land/metaimage.png",
  twitterHandle = "@sizlandofficial",
  url,
}) => {
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState<string>("https://www.siz.land");
  
  useEffect(() => {
    // Get current page URL
    if (url) {
      setCurrentUrl(url);
    } else {
      const path = router.asPath === '/' ? '' : router.asPath;
      setCurrentUrl(`https://www.siz.land${path}`);
    }
  }, [router.asPath, url]);
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="preconnect" href="https://verify.walletconnect.org/" />
      
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
      
      {/* Additional tags */}
      <meta name="theme-color" content="system" />
    </Head>
  );
};
