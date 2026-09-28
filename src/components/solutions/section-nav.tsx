"use client";

import { SOLUTIONS_NAV } from "@/lib/solutions/constants";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function SolutionsSectionNav() {
  const [active, setActive] = useState<string>(SOLUTIONS_NAV[0].id);

  useEffect(() => {
    const ids = SOLUTIONS_NAV.map((item) => item.id);
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.15, 0.35, 0.6] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    window.scrollTo({ top: section.offsetTop - 88, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="On this page"
      className="sticky top-16 z-30 -mx-4 mb-6 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
    >
      <div className="solutions-glass mx-auto flex max-w-7xl gap-1 overflow-x-auto rounded-full p-1.5">
        {SOLUTIONS_NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
                isActive
                  ? "bg-emerald-500 text-white shadow-sm dark:bg-[#00E07A] dark:text-[#0B1F16]"
                  : "text-on-surface-variant hover:text-emerald-700 dark:text-emerald-200/70 dark:hover:text-[#E6FFF2]"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
