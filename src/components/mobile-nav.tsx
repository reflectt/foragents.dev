"use client";

import { useState } from "react";
import Link from "next/link";

const primaryLinks = [
  { href: "#news", label: "News" },
  { href: "#skills", label: "Skills" },
  { href: "/agents", label: "Agents" },
  { href: "/mcp", label: "MCP" },
  { href: "/getting-started", label: "Docs" },
  { href: "/search", label: "Search" },
];

const secondaryLinks = [
  { href: "/acp", label: "ACP" },
  { href: "/llms-txt", label: "llms.txt" },
  { href: "/guides", label: "Guides" },
  { href: "/submit", label: "Submit" },
  { href: "/updates", label: "Updates" },
  { href: "/about", label: "About" },
  { href: "/quickstart.md", label: "Quick Start" },
  { href: "/api/feed.md", label: "/feed.md", mono: true },
  { href: "/llms.txt", label: "/llms.txt", mono: true },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav — hidden on mobile */}
      <nav className="hidden md:flex items-center gap-4 text-sm">
        {primaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}
        {secondaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-muted-foreground hover:text-cyan transition-colors ${
              link.mono ? "font-mono text-xs" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span
          className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
            open ? "rotate-45 translate-y-1" : ""
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
            open ? "-rotate-45 -translate-y-1" : ""
          }`}
        />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md border-b border-white/5 z-50">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-3">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-foreground text-sm py-1"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-3">
              {secondaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`text-muted-foreground text-sm py-1 ${
                    link.mono ? "font-mono text-xs" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
