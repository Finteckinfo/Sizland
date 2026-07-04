"use client";

import React from "react";
import featuresData from "@/types/featuresData.json";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = (typeof featuresData)[number] & {
  featured?: boolean;
  horizontal?: boolean;
  href?: string;
  external?: boolean;
};

/** Grid placement — must live in this file so Tailwind includes col/row span utilities */
const GRID_CLASSES = [
  "md:col-span-8 md:row-span-2",
  "md:col-span-4 md:row-span-1",
  "md:col-span-4 md:row-span-1",
  "md:col-span-4 md:row-span-1",
  "md:col-span-4 md:row-span-1",
  "md:col-span-4 md:row-span-1",
  "md:col-span-12 md:row-span-1",
] as const;

const Features = () => {
  const renderCard = (feature: Feature, index: number) => {
    const Icon =
      (Icons[feature.icon as keyof typeof Icons] as LucideIcon) || Icons.Star;

    const cardClass = [
      GRID_CLASSES[index],
      "glass-panel p-5 sm:p-6 border border-border-subtle hover:border-terminal-green transition-colors duration-200 h-full",
      feature.featured
        ? "flex flex-col justify-end relative overflow-hidden group"
        : feature.horizontal
          ? "flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          : "flex flex-col justify-between",
    ].join(" ");

    const inner = (
      <>
        {feature.featured && (
          <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <Icon className="h-12 w-12 sm:h-16 sm:w-16 text-terminal-green" />
          </div>
        )}
        {!feature.featured && !feature.horizontal && (
          <Icon className="h-6 w-6 text-terminal-green mb-3 sm:mb-4 shrink-0" />
        )}
        <div className={feature.horizontal ? "flex-1 min-w-0" : ""}>
          <h3
            className={`text-on-surface mb-1 sm:mb-2 leading-snug ${
              feature.featured || feature.horizontal
                ? "font-headline text-base sm:text-lg md:text-xl tracking-headline"
                : "font-label text-sm"
            }`}
          >
            {feature.title}
          </h3>
          <p
            className={`font-body text-on-surface-variant text-sm leading-relaxed ${
              feature.featured ? "max-w-md" : feature.horizontal ? "max-w-2xl" : ""
            }`}
          >
            {feature.description}
          </p>
        </div>
        {feature.horizontal && (
          <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-terminal-green hidden md:block shrink-0" />
        )}
      </>
    );

    if (feature.href) {
      return (
        <a
          key={feature.title}
          href={feature.href}
          {...(feature.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={`${cardClass} no-underline block`}
        >
          {inner}
        </a>
      );
    }

    return (
      <div key={feature.title} className={cardClass}>
        {inner}
      </div>
    );
  };

  return (
    <section
      id="features"
      className="py-16 md:py-24 px-4 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto bg-surface-elevated/30 border-y border-border-subtle"
    >
      <div className="text-center mb-10 md:mb-16">
        <h2 className="font-headline text-xl sm:text-2xl md:text-3xl text-on-surface tracking-headline">
          The Remote Stack
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[200px] md:auto-rows-[240px]">
        {(featuresData as Feature[]).map((feature, index) => renderCard(feature, index))}
      </div>
    </section>
  );
};

export default Features;
