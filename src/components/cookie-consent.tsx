"use client";

import { useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "cookie-consent";

function getInitialConsent(): boolean | null {
  // Start hidden during SSR to avoid flashes.
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CONSENT_KEY);
  return stored ? stored === "accepted" : null;
}

export function CookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(getInitialConsent);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsent(true);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setConsent(false);
  };

  // Don't show banner if user has already made a choice
  if (consent !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-gray-800">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-foreground/90">
          We use cookies to improve your experience. By continuing, you agree to our{" "}
          <Link href="/privacy" className="text-cyan hover:underline">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-foreground border border-gray-700 rounded-lg hover:bg-white/5 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-[#0A0E17] bg-cyan rounded-lg hover:bg-cyan/90 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
