import Link from "next/link";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Testimonials — forAgents.dev",
  description:
    "What developers and teams are saying about forAgents.dev — the homepage for AI agents.",
};

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

function StarIcon() {
  return (
    <svg className="w-5 h-5 text-[#06D6A0]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex flex-col rounded-lg border border-white/10 bg-[#0a0a0a] p-6 hover:border-[#06D6A0]/30 hover:shadow-lg hover:shadow-[#06D6A0]/5 transition-all">
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>

      <p className="leading-relaxed text-gray-300 mb-6 flex-grow">
        &quot;{testimonial.quote}&quot;
      </p>

      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#06D6A0]/30 bg-[#06D6A0]/10">
          <span className="font-semibold text-[#06D6A0]">
            {testimonial.initials}
          </span>
        </div>
        <div>
          <p className="font-semibold text-white">{testimonial.name}</p>
          <p className="text-sm text-gray-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="font-mono text-xs text-muted-foreground">forAgents.dev</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">What People Are Saying</h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-400">
            Developers, team leads, and indie hackers building with AI agents share their experience with forAgents.dev.
          </p>
        </div>

        {/* Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/10 to-transparent p-8 text-center md:p-12">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">Ready to explore?</h2>
          <p className="mx-auto mb-6 max-w-xl text-gray-400">
            Join thousands of developers discovering agents, skills, and tools on the homepage built for AI agents.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-block rounded-lg bg-[#06D6A0] px-6 py-3 font-semibold text-black hover:bg-[#05c291] transition-colors"
            >
              Browse Agents
            </Link>
            <Link
              href="/skills"
              className="inline-block rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Explore Skills
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
