"use client";

import { auditBlocks, infrastructureModules } from "@/lib/solutions/content";
import {
  ChevronRight,
  Coins,
  Database,
  Globe,
  Settings,
  Shield,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

const MODULE_ICONS: Record<string, LucideIcon> = {
  Coins,
  TrendingUp,
  Shield,
  Settings,
  Database,
  Globe,
};

function IconWrap({ name }: { name: string }) {
  const Icon = MODULE_ICONS[name] || Settings;
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
      <Icon size={24} aria-hidden />
    </div>
  );
}

export function SolutionsBento() {
  const featured = infrastructureModules[0];
  const medium = infrastructureModules.slice(1, 3);
  const compact = infrastructureModules[3];

  return (
    <section id="stack" className="relative scroll-mt-28 py-16 md:py-20" aria-labelledby="stack-heading">
      <div className="mb-10 grid items-end gap-6 lg:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <div className="max-w-xl space-y-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">
            Infrastructure modules
          </span>
          <h2
            id="stack-heading"
            className="text-3xl font-bold leading-tight tracking-tight text-on-surface sm:text-4xl lg:text-5xl dark:text-white"
          >
            A hardened stack, composed as you grow.
          </h2>
        </div>
        <p className="text-base leading-relaxed text-on-surface-variant md:text-lg dark:text-gray-300">
          Each cell is a live segment of the Sizland architecture — economy, growth SDK,
          treasury, automation, sovereignty, and a global mesh.
        </p>
      </div>

      <div className="grid auto-rows-fr gap-4 md:grid-cols-6 md:grid-rows-2">
        <article className="solutions-glass solutions-bento md:col-span-3 md:row-span-2 p-6 sm:p-8">
          <IconWrap name={featured.icon} />
          <h3 className="mt-5 text-xl font-bold tracking-tight text-on-surface dark:text-white">
            {featured.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant sm:text-base dark:text-gray-300">
            {featured.description}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {featured.features.map((feature) => (
              <li
                key={feature}
                className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300"
              >
                {feature}
              </li>
            ))}
          </ul>
        </article>

        {medium.map((module) => (
          <article
            key={module.id}
            className="solutions-glass solutions-bento md:col-span-3 p-6"
          >
            <IconWrap name={module.icon} />
            <h3 className="mt-4 text-base font-bold text-on-surface dark:text-white">
              {module.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-gray-300">
              {module.description}
            </p>
            <ul className="mt-4 space-y-1.5">
              {module.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-on-surface-variant dark:text-gray-300">
                  <ChevronRight className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-6">
        <article className="solutions-glass solutions-bento md:col-span-2 p-6">
          <IconWrap name={compact.icon} />
          <h3 className="mt-4 text-base font-bold text-on-surface dark:text-white">
            {compact.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-gray-300">
            {compact.description}
          </p>
        </article>

        {auditBlocks.map((block) => (
          <article key={block.id} className="solutions-glass solutions-bento md:col-span-2 p-6">
            <IconWrap name={block.icon} />
            <h3 className="mt-4 text-base font-bold text-on-surface dark:text-white">
              {block.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-gray-300">
              {block.description}
            </p>
          </article>
        ))}

        <figure className="solutions-glass relative min-h-[220px] overflow-hidden md:col-span-6 lg:col-span-6">
          <Image
            src="/secondimage.png"
            alt="Sizland global network — Online 25,000 nodes, 100+ VPN locations"
            fill
            className="object-cover"
          />
          <figcaption className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-[#0B1F16]/80 to-transparent px-5 py-4 font-mono text-xs font-semibold uppercase tracking-wider text-[#E6FFF2]">
            <span>Online 25,000</span>
            <span>VPN 100+</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
