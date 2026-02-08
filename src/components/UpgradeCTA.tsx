"use client";

import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

type UpgradeCTAVariant = "inline" | "modal";

export interface UpgradeCTAProps {
  variant?: UpgradeCTAVariant;
  message: string;
  ctaId: string;
}

const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

function getStorageKey(ctaId: string) {
  return `foragents:upgrade-cta:dismissed:${ctaId}`;
}

function getSessionKey(ctaId: string) {
  return `foragents:upgrade-cta:shown:${ctaId}`;
}

function shouldShowCta(ctaId: string) {
  if (typeof window === "undefined") return false;

  try {
    const shownThisSession = window.sessionStorage.getItem(getSessionKey(ctaId));
    if (shownThisSession === "1") return false;
  } catch {
    // ignore
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(ctaId));
    if (!raw) return true;

    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return true;

    return Date.now() - dismissedAt > DISMISS_MS;
  } catch {
    return true;
  }
}

function markShownThisSession(ctaId: string) {
  try {
    window.sessionStorage.setItem(getSessionKey(ctaId), "1");
  } catch {
    // ignore
  }
}

function persistDismissal(ctaId: string) {
  try {
    window.localStorage.setItem(getStorageKey(ctaId), String(Date.now()));
  } catch {
    // ignore
  }
}

export function UpgradeCTA({ variant = "inline", message, ctaId }: UpgradeCTAProps) {
  const labelId = useId();
  const [isOpen, setIsOpen] = useState(() => shouldShowCta(ctaId));

  useEffect(() => {
    if (!isOpen) return;
    markShownThisSession(ctaId);
  }, [ctaId, isOpen]);

  function dismiss() {
    persistDismissal(ctaId);
    setIsOpen(false);
  }

  if (!isOpen) return null;

  const content = (
    <div className="relative overflow-hidden rounded-xl border border-[#06D6A0]/20 bg-[#0a0a0a]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#06D6A0]/10 via-transparent to-[#06D6A0]/10" />

      <div className="relative flex items-start gap-3 p-4">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#06D6A0]/10 border border-[#06D6A0]/15">
          <Sparkles className="h-4 w-4 text-[#06D6A0]" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p id={labelId} className="text-sm font-medium text-white/90">
            {message}
          </p>
          <p className="mt-1 text-xs text-white/55">
            Premium is $9/mo or $79/yr
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#06D6A0] px-4 text-sm font-semibold text-[#0a0a0a] hover:brightness-110 transition-all"
            >
              Upgrade
            </Link>

            <button
              type="button"
              onClick={dismiss}
              className="inline-flex h-9 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/70 hover:text-white/90 hover:border-white/20 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          aria-label="Dismiss"
          title="Don&apos;t show again for 7 days"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  if (variant === "inline") {
    return <div className="mb-6">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby={labelId} className="w-full max-w-lg">
        {content}
      </div>
    </div>
  );
}
