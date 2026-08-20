"use client";

import React from "react";
import Head from "next/head";
import { MyTabAmbientBg } from "./mytab-ambient-bg";
import { MyTabSidebar } from "./mytab-sidebar";
import { MyTabTopBar, MyTabBottomNav } from "./mytab-mobile-nav";

interface MyTabLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  alias?: string | null;
  phoneVerified?: boolean;
}

export const MyTabLayout: React.FC<MyTabLayoutProps> = ({
  children,
  title = "MyTab — Decentralized Social Ledger",
  description = "Privacy-first peer-to-peer tab and credit ledger on Base.",
  alias,
  phoneVerified,
}) => (
  <>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>

    <div className="mytab-app flex min-h-screen relative text-mt-on-background selection:bg-mt-primary/30 selection:text-mt-primary">
      <MyTabAmbientBg />
      <MyTabSidebar alias={alias} phoneVerified={phoneVerified} />
      <MyTabTopBar />

      <main className="flex-1 md:ml-64 pt-28 md:pt-12 pb-32 md:pb-12 px-4 md:px-16 max-w-[1200px] mx-auto w-full relative z-10">
        {children}
      </main>

      <MyTabBottomNav />
    </div>
  </>
);
