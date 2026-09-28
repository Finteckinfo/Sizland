"use client";

import { WHATSAPP_CONTACT } from "@/lib/solutions/constants";
import { PACKAGE_INTEREST_OPTIONS } from "@/lib/solutions/pricing";
import { MessageCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "ok" | "error";

export function SolutionsBooking() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch("/api/solutions/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(payload.error || "Could not send. Use WhatsApp instead.");
        return;
      }
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Use WhatsApp instead.");
    }
  };

  return (
    <section
      id="book"
      className="relative scroll-mt-28 py-16 md:py-20"
      aria-labelledby="book-heading"
    >
      <div
        className="relative overflow-hidden rounded-[1.75rem] px-5 py-10 sm:px-8 md:px-10 md:py-14"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--stitch-surface-elevated) 70%, #0B1F16) 0%, #0a0f0d 55%, color-mix(in srgb, var(--terminal-green) 22%, #0a0f0d) 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-[#00E07A]/20 blur-3xl"
        />
        <div className="relative mb-8 max-w-2xl space-y-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#00E07A]">
            Book an appointment
          </span>
          <h2
            id="book-heading"
            className="font-helvetica-97-condensed-oblique text-3xl uppercase tracking-[0.08em] text-[#E6FFF2] sm:text-4xl lg:text-5xl"
          >
            System ready. Initialize deployment?
          </h2>
          <p className="text-sm text-emerald-100/80 sm:text-base">
            Request a slot — we reply within two hours on business days. Prefer chat?
            Jump straight to WhatsApp. No account required.
          </p>
        </div>

        {status === "ok" ? (
          <div className="solutions-glass relative grid gap-6 rounded-2xl p-6 sm:p-8 md:grid-cols-2">
            <div>
              <p className="text-lg font-bold text-[#E6FFF2]">Request sent.</p>
              <p className="mt-2 text-sm text-emerald-100/80">
                We have your details. Watch email, or continue the conversation on WhatsApp now.
              </p>
            </div>
            <a
              href={WHATSAPP_CONTACT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00E07A] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#0B1F16] hover:bg-[#00c96a]"
            >
              <MessageCircle className="h-5 w-5" />
              Open WhatsApp
            </a>
          </div>
        ) : (
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <form
              onSubmit={onSubmit}
              className="solutions-glass grid gap-4 rounded-2xl p-5 sm:p-7"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" name="name" required autoComplete="name" />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
                <Field
                  label="Phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                />
                <Field
                  label="Preferred date & time"
                  name="preferredAt"
                  type="datetime-local"
                  required
                />
              </div>
              <label className="block space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-200">
                  Package interest
                </span>
                <select
                  name="interest"
                  defaultValue="unsure"
                  className="w-full rounded-xl border border-emerald-500/25 bg-[#0B1F16]/60 px-3 py-2.5 text-sm text-[#E6FFF2] outline-none focus:ring-2 focus:ring-[#00E07A]/50"
                >
                  {PACKAGE_INTEREST_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-200">
                  Notes
                </span>
                <textarea
                  name="notes"
                  rows={4}
                  className="w-full rounded-xl border border-emerald-500/25 bg-[#0B1F16]/60 px-3 py-2.5 text-sm text-[#E6FFF2] outline-none focus:ring-2 focus:ring-[#00E07A]/50"
                  placeholder="Tell us about the product you want to ship."
                />
              </label>
              {status === "error" && (
                <p className="text-sm text-red-300" role="alert">
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00E07A] px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-[#0B1F16] transition-colors hover:bg-[#00c96a] disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {status === "sending" ? "Sending…" : "Request appointment"}
              </button>
            </form>

            <a
              href={WHATSAPP_CONTACT}
              target="_blank"
              rel="noopener noreferrer"
              className="solutions-bento group relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl border border-[#00E07A]/40 bg-gradient-to-br from-[#00E07A]/25 via-[#0B1F16] to-[#0a0f0d] p-7"
            >
              <span
                aria-hidden
                className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#00E07A]/30 blur-2xl transition-transform group-hover:scale-125"
              />
              <div className="relative">
                <MessageCircle className="h-10 w-10 text-[#00E07A]" />
                <p className="mt-6 font-helvetica-97-condensed-oblique text-2xl uppercase tracking-[0.08em] text-[#E6FFF2] sm:text-3xl">
                  Chat on WhatsApp
                </p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-emerald-100/80">
                  Same architects, same &lt; 2 hour response window. Open the group and
                  tell us you came from solutions.siz.land.
                </p>
              </div>
              <span className="relative inline-flex w-fit items-center rounded-full bg-[#00E07A] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#0B1F16]">
                No login required
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-200">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-emerald-500/25 bg-[#0B1F16]/60 px-3 py-2.5 text-sm text-[#E6FFF2] outline-none focus:ring-2 focus:ring-[#00E07A]/50"
      />
    </label>
  );
}
