"use client";

import { AuroraText } from "@/components/ui/aurora-text";
import { WHITEPAPER_URL } from "@/lib/solutions/constants";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SolutionsHero() {
  const scrollToStack = () => {
    const section = document.getElementById("stack");
    if (!section) return;
    window.scrollTo({ top: section.offsetTop - 88, behavior: "smooth" });
  };

  return (
    <section id="overview" className="relative scroll-mt-28 pt-4 pb-16 sm:pt-6 md:pt-8 md:pb-20">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <div className="space-y-7">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">
              Network status · operational
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-on-surface sm:text-5xl lg:text-6xl dark:text-white">
            Establish your{" "}
            <AuroraText>digital economy.</AuroraText>
          </h1>

          <p className="font-helvetica-97-condensed-oblique text-2xl uppercase leading-[1.15] tracking-[0.06em] text-[#0B1F16] sm:text-3xl dark:text-[#E6FFF2]">
            Infrastructure, explained. Then booked.
          </p>

          <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant md:text-xl dark:text-gray-300">
            Sizland is the technical bedrock for token access, treasury, and automation.
            Read how the stack works, what we need to start a build, then pick a package
            in your currency.
          </p>

          <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
            <button
              type="button"
              onClick={scrollToStack}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 px-6 py-3 text-sm font-bold text-white transition-all hover:from-emerald-500 hover:to-emerald-700 sm:px-8 sm:text-base"
            >
              Read infrastructure
            </button>
            <Link
              href="/ratecard"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-600/50 px-6 py-3 text-sm font-bold text-gray-800 transition-all hover:bg-emerald-50 sm:px-8 sm:text-base dark:border-emerald-500/40 dark:text-gray-200 dark:hover:bg-emerald-500/10"
            >
              Rate card
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link
              href={WHITEPAPER_URL}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-600/50 px-6 py-3 text-sm font-bold text-gray-800 transition-all hover:bg-emerald-50 sm:px-8 sm:text-base dark:border-emerald-500/40 dark:text-gray-200 dark:hover:bg-emerald-500/10"
            >
              Whitepaper PDF
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_70%_40%,color-mix(in_srgb,var(--neon-accent)_28%,transparent),transparent_62%)]"
          />
          <div className="solutions-glass solutions-glow relative aspect-[4/3] overflow-hidden rounded-[1.75rem] lg:aspect-square lg:translate-x-4 lg:-translate-y-2">
            <Image
              src="/firstimage.png"
              alt="Sizland solutions — digital economy infrastructure"
              fill
              className="object-contain p-4"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
