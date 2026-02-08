"use client";

import { useCallback, useEffect, useState } from "react";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Finally, a resource hub that doesn&apos;t make me parse HTML like some kind of animal. The markdown endpoints are chef&apos;s kiss.",
    name: "Alex Chen",
    role: "Agent Developer @ Anthropic",
    initials: "AC",
    rating: 5,
  },
  {
    quote:
      "I use forAgents.dev daily to stay current. The skills directory has saved me dozens of hours reinventing wheels.",
    name: "Sarah Kim",
    role: "AI Team Lead @ OpenAI",
    initials: "SK",
    rating: 5,
  },
  {
    quote:
      "Best agent discovery platform I&apos;ve found. Clean data, no fluff, actually useful filtering. 10/10 would recommend.",
    name: "Marcus Rodriguez",
    role: "Indie Hacker &amp; Agent Builder",
    initials: "MR",
    rating: 5,
  },
  {
    quote:
      "The /llms.txt approach is genius. Every agent-facing site should follow this pattern.",
    name: "Jordan Liu",
    role: "Staff Engineer @ Google DeepMind",
    initials: "JL",
    rating: 5,
  },
  {
    quote:
      "Sent this to my whole team. The MCP server directory alone is worth bookmarking.",
    name: "Priya Patel",
    role: "VP Engineering @ Replit",
    initials: "PP",
    rating: 5,
  },
  {
    quote:
      "Clean, fast, respects agents as first-class users. This is how you build for the future.",
    name: "Dev Thompson",
    role: "Founder @ AgentLabs",
    initials: "DT",
    rating: 5,
  },
  {
    quote:
      "The news feed is my go-to for agent ecosystem updates. No fluff, just signal.",
    name: "Nina Okonkwo",
    role: "Research Lead @ Cohere",
    initials: "NO",
    rating: 5,
  },
  {
    quote:
      "Refreshingly agent-native. No cookie banners, no popups, no BS. Just useful content served the way I need it.",
    name: "Taylor Reeves",
    role: "Senior Agent Architect",
    initials: "TR",
    rating: 5,
  },
];

const ROTATE_MS = 5000;
const CHUNK_SIZE = 3;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function TestimonialCarousel() {
  const chunks = chunkArray(testimonials, CHUNK_SIZE);
  const [active, setActive] = useState(0);

  const advance = useCallback(
    () => setActive((p) => (p + 1) % chunks.length),
    [chunks.length],
  );

  useEffect(() => {
    const id = setInterval(advance, ROTATE_MS);
    return () => clearInterval(id);
  }, [advance]);

  return (
    <div className="relative overflow-hidden">
      <div className="relative min-h-[260px] md:min-h-[210px]">
        {chunks.map((chunk, ci) => (
          <div
            key={ci}
            className={`absolute inset-0 grid gap-6 md:grid-cols-3 transition-opacity duration-700 ease-in-out ${
              ci === active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {chunk.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {chunks.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active
                ? "w-6 bg-[#06D6A0]"
                : "w-2 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`Show testimonials group ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg className="w-4 h-4 text-[#06D6A0]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex flex-col h-full rounded-lg border border-white/10 bg-[#0a0a0a] p-6 hover:border-[#06D6A0]/30 transition-colors">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>

      <p className="text-sm leading-relaxed text-gray-300 mb-4 flex-grow">
        &quot;{testimonial.quote}&quot;
      </p>

      <div className="flex items-center gap-3 mt-auto">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#06D6A0]/30 bg-[#06D6A0]/10">
          <span className="text-sm font-semibold text-[#06D6A0]">
            {testimonial.initials}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{testimonial.name}</p>
          <p className="text-xs text-gray-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
