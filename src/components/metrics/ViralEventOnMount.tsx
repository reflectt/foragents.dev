"use client";

import { useEffect } from "react";

export function ViralEventOnMount({
  type,
  artifactId,
}: {
  type: "artifact_viewed";
  artifactId: string;
}) {
  useEffect(() => {
    try {
      const payload = JSON.stringify({ type, artifact_id: artifactId });

      // Prefer sendBeacon to avoid blocking navigation.
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/metrics/viral/event", blob);
        return;
      }

      // Fallback.
      void fetch("/api/metrics/viral/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
    } catch {
      // never throw
    }
  }, [type, artifactId]);

  return null;
}
