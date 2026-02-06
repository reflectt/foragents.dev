"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { COMPARE_TRAY_MAX, COMPARE_TRAY_STORAGE_KEY } from "@/lib/compare";

type CompareTrayState = {
  ids: string[];
  updatedAt: number;
};

function readTray(): CompareTrayState {
  if (typeof window === "undefined") return { ids: [], updatedAt: Date.now() };
  try {
    const raw = window.localStorage.getItem(COMPARE_TRAY_STORAGE_KEY);
    if (!raw) return { ids: [], updatedAt: Date.now() };
    const parsed = JSON.parse(raw) as Partial<CompareTrayState>;
    const ids = Array.isArray(parsed.ids)
      ? parsed.ids.map(String).filter(Boolean).slice(0, COMPARE_TRAY_MAX)
      : [];
    return {
      ids,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return { ids: [], updatedAt: Date.now() };
  }
}

function writeTray(ids: string[]) {
  if (typeof window === "undefined") return;
  const clamped = ids.filter(Boolean).slice(0, COMPARE_TRAY_MAX);
  const next: CompareTrayState = { ids: clamped, updatedAt: Date.now() };
  window.localStorage.setItem(COMPARE_TRAY_STORAGE_KEY, JSON.stringify(next));
}

export function useCompareTray() {
  const [ids, setIds] = useState<string[]>(() => readTray().ids);
  const [limitHit, setLimitHit] = useState(false);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== COMPARE_TRAY_STORAGE_KEY) return;
      setIds(readTray().ids);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isSelected = useCallback((id: string) => ids.includes(id), [ids]);

  const add = useCallback((id: string) => {
    setLimitHit(false);
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= COMPARE_TRAY_MAX) {
        setLimitHit(true);
        return prev;
      }
      const next = [...prev, id];
      writeTray(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setLimitHit(false);
    setIds((prev) => {
      const next = prev.filter((x) => x !== id);
      writeTray(next);
      return next;
    });
  }, []);

  const toggle = useCallback(
    (id: string) => {
      if (ids.includes(id)) remove(id);
      else add(id);
    },
    [ids, add, remove]
  );

  const clear = useCallback(() => {
    setLimitHit(false);
    setIds([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(COMPARE_TRAY_STORAGE_KEY);
    }
  }, []);

  return useMemo(
    () => ({
      ids,
      isSelected,
      add,
      remove,
      toggle,
      clear,
      limitHit,
      max: COMPARE_TRAY_MAX,
    }),
    [ids, isSelected, add, remove, toggle, clear, limitHit]
  );
}
