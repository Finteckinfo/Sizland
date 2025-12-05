'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { AuroraText } from './ui/aurora-text';

const CTASection = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className={`relative py-24 ${
      isDark 
        ? "bg-gradient-to-b from-green-950/20 via-green-900/10 to-transparent" 
        : "bg-gradient-to-b from-green-50/80 via-green-100/60 to-white"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Pill badge */}
          <span className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] ${
            isDark
              ? "border border-white/15 bg-white/5 text-gray-300"
              : "bg-green-100/80 text-gray-700"
          }`}>
            Join Now
          </span>

          {/* Main heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight max-w-4xl">
            <span className={isDark ? "text-white" : "text-black"}>
              Join Thousands Already Building on{" "}
            </span>
            <AuroraText>Sizland</AuroraText>
          </h2>

          {/* Description */}
          <p className={`text-base md:text-lg leading-relaxed max-w-2xl ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}>
            Power your workflows, payments, and investments through a secure, multi-chain platform designed for teams like yours.
          </p>

          {/* CTA Button */}
          <button
            className={`mt-8 px-8 py-4 text-lg font-bold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl ${
              isDark
                ? "bg-white text-green-600 hover:bg-green-50"
                : "bg-white text-green-600 hover:bg-green-50"
            }`}
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

