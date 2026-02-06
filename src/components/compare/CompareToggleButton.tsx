"use client";

import { useCompareTray } from "@/components/compare/useCompareTray";

export function CompareToggleButton({
  agentId,
  className,
}: {
  agentId: string;
  className?: string;
}) {
  const tray = useCompareTray();
  const selected = tray.isSelected(agentId);

  return (
    <button
      type="button"
      className={
        className ||
        `inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-semibold border transition-colors ${
          selected
            ? "bg-cyan text-[#0A0E17] border-cyan"
            : "bg-transparent text-muted-foreground border-white/10 hover:border-cyan/30 hover:text-foreground"
        }`
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        tray.toggle(agentId);
      }}
      aria-pressed={selected}
    >
      {selected ? "Added" : "Compare"}
    </button>
  );
}
