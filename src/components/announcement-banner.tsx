"use client";

import { useState, useEffect } from "react";

// Update this ID when you change the message to show it again to users who dismissed the old one
const BANNER_ID = "2026-02-02-launch";

const BANNER_MESSAGE = "🚀 New: RSS feed, unified search, auto-moderation & more";
const BANNER_LINK = "/updates";
const BANNER_LINK_TEXT = "see what shipped →";

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    const stored = localStorage.getItem(`banner-dismissed-${BANNER_ID}`);
    setDismissed(stored === "true");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(`banner-dismissed-${BANNER_ID}`, "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-cyan/10 via-purple/10 to-cyan/10 border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
        <span className="text-foreground/90">{BANNER_MESSAGE}</span>
        <a
          href={BANNER_LINK}
          className="text-cyan hover:underline font-medium"
        >
          {BANNER_LINK_TEXT}
        </a>
        <button
          onClick={handleDismiss}
          className="absolute right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss announcement"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
