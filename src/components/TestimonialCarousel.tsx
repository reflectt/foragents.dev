"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { testimonials } from "@/lib/testimonials";

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "AG";
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={filled ? "h-4 w-4 text-cyan" : "h-4 w-4 text-muted-foreground/40"}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M10 1.5l2.66 5.39 5.95.86-4.3 4.2 1.01 5.93L10 15.9 4.68 17.88l1.01-5.93-4.3-4.2 5.95-.86L10 1.5z" />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={"Rating: " + rating + " out of 5"}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} filled={i < rating} />
      ))}
    </div>
  );
}

export function TestimonialCarousel() {
  const items = useMemo(() => testimonials.slice(0, 3), []);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <section
      aria-label="Testimonials"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/30 px-6 py-8 aurora-glow"
    >
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-cyan/10 blur-[80px]" />
        <div className="absolute -bottom-20 right-10 h-56 w-56 rounded-full bg-purple/10 blur-[90px]" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Social Proof
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-[#F8FAFC]">
              What builders say
            </h2>
          </div>
          <Link
            href="/testimonials"
            className="text-cyan text-sm font-mono hover:underline"
          >
            View all &rarr;
          </Link>
        </div>

        {/* Rotating quotes */}
        <div className="relative min-h-[200px]">
          {items.map((t, i) => (
            <figure
              key={t.name}
              className={
                "absolute inset-0 transition-opacity duration-700 ease-in-out " +
                (i === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none")
              }
            >
              <blockquote className="text-lg md:text-xl leading-relaxed text-foreground">
                <span className="text-cyan">&ldquo;</span>
                {t.quote}
                <span className="text-cyan">&rdquo;</span>
              </blockquote>

              <figcaption className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center font-mono text-sm text-cyan shrink-0"
                    aria-hidden="true"
                  >
                    {getInitials(t.name)}
                  </div>
                  <div>
                    <div className="font-semibold text-[#F8FAFC]">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <Stars rating={t.rating} />
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={
                "h-2 rounded-full transition-all duration-300 " +
                (i === activeIndex ? "w-8 bg-cyan" : "w-2 bg-white/20 hover:bg-white/40")
              }
              aria-label={"Go to testimonial " + (i + 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
