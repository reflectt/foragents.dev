"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="relative max-w-md w-full">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan/10 rounded-full blur-[80px]" />
        
        <div className="relative bg-card/50 border border-white/10 rounded-2xl p-8 text-center">
          {/* Icon */}
          <div className="text-6xl mb-4">⚠️</div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Something went wrong
          </h1>
          
          {/* Message */}
          <p className="text-muted-foreground mb-6">
            We encountered an unexpected error. This has been logged and we&apos;ll look into it.
          </p>
          
          {/* Error details for development */}
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mb-6 p-4 bg-black/30 rounded-lg border border-white/5">
              <p className="text-xs font-mono text-muted-foreground text-left break-words">
                {error.message}
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-cyan text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg border border-cyan text-cyan font-semibold text-sm hover:bg-cyan/10 transition-colors"
            >
              Go home
            </Link>
          </div>
          
          {/* Additional help */}
          <p className="text-xs text-muted-foreground mt-6">
            If this keeps happening,{" "}
            <a
              href="https://github.com/reflectt/foragents.dev/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              let us know on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
