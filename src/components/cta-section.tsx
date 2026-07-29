'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { AuroraText } from './ui/aurora-text';
import { SIZLAND_WALLET_URL } from '@/lib/external-apps';

const CTASection = () => {
  const { resolvedTheme: theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className={`relative py-24 ${
      isDark 
        ? "bg-gradient-to-t from-green-950/40 via-green-900/25 to-transparent" 
        : "bg-gradient-to-t from-emerald-100/70 via-surface-elevated/80 to-transparent"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <span className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] ${
            isDark
              ? "border border-white/15 bg-white/5 text-gray-300"
              : "bg-green-100/80 text-gray-700"
          }`}>
            Sovereign Work
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight max-w-4xl">
            <span className={isDark ? "text-white" : "text-black"}>
              Your Identity. Your Reputation.{" "}
            </span>
            <AuroraText>Your Future.</AuroraText>
          </h2>

          <p className={`text-base md:text-lg leading-relaxed max-w-2xl ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}>
            Sizland isn&apos;t just technology; it is a movement toward true digital autonomy for the remote worker. Generate your sovereign DiD and take control of your work history today.
          </p>

          <a
            href={SIZLAND_WALLET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-8 inline-block px-8 py-4 text-lg font-bold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl ${
              isDark
                ? "bg-white text-green-600 hover:bg-green-50"
                : "bg-white text-green-600 hover:bg-green-50"
            }`}
          >
            Generate Your DiD (Non-Custodial)
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
