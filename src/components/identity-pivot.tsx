import React from "react";
import { Key, Shield, RefreshCw } from "lucide-react";
import ScrollReveal from "./ui/scroll-reveal";

const IdentityPivot = () => {
  const features = [
    {
      icon: Key,
      title: "Device-derived cryptographic identity",
      description:
        "Your DiD is mathematically derived from keys generated on your own device—not imported from a chain explorer or custodial vault.",
    },
    {
      icon: Shield,
      title: "Zero Data Policy by design",
      description:
        "Identity is not anchored to a single public blockchain explorer. Your digital footprint stays off the public ledger until you choose to interact.",
    },
    {
      icon: RefreshCw,
      title: "Rotatable public addresses",
      description:
        "You only point to public addresses when settling on a specific chain—and replace them instantly if compromised, without rebuilding your core identity.",
    },
  ];

  return (
    <section
      id="solutions"
      className="py-8 md:py-24 px-4 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-gutter items-center">
        <ScrollReveal className="md:col-span-5 space-y-4 md:space-y-6">
          <h2 className="font-headline text-xl sm:text-2xl md:text-3xl text-on-surface tracking-headline leading-snug">
            Why We Built the{" "}
            <span className="text-terminal-green">Identity Layer</span> First.
          </h2>
          <div className="w-12 h-1 bg-terminal-green" />
          <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed">
            We successfully built the backend for task-based ERP payment automation—but a purely transparent on-chain payment model threatens user privacy. Every transaction becomes a permanent public record, linking workers, clients, and earnings across the open web.
          </p>
          <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed">
            To enforce a strict Zero Data Policy, we built an off-chain, client-side DiD engine. Your identity is derived locally from cryptographic keys on your device, making your footprint untraceable until you deliberately interact with a chain.
          </p>
        </ScrollReveal>

        <ScrollReveal className="md:col-span-7" delay={0.12}>
          <div className="glass-panel stitch-card p-5 sm:p-8 rounded border border-border-subtle relative overflow-hidden hover:border-terminal-green/50">
            <div className="absolute -right-20 -top-20 w-64 h-64 border border-terminal-green/20 rounded-full pointer-events-none animate-[spin_60s_linear_infinite]" />
            <div className="absolute -right-10 -top-10 w-48 h-48 border border-terminal-green/40 rounded-full pointer-events-none animate-[spin_40s_linear_infinite_reverse]" />
            <div className="relative z-10 space-y-5 sm:space-y-6">
              {features.map((item, index) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 sm:gap-4 transition-transform duration-200 hover:translate-x-1"
                  style={{ transitionDelay: `${index * 40}ms` }}
                >
                  <item.icon className="text-terminal-green mt-0.5 h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-body text-on-surface mb-1 font-semibold text-sm sm:text-base">
                      {item.title}
                    </div>
                    <div className="font-body text-on-surface-variant text-sm leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default IdentityPivot;
