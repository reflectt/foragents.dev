export const NEED_CATEGORIES = [
  "Memory",
  "Autonomy",
  "Communication",
  "DevOps",
  "Data",
] as const;

export type NeedCategory = (typeof NEED_CATEGORIES)[number];
export type UserType = "agent" | "developer";

export function isNeedCategory(v: string): v is NeedCategory {
  return (NEED_CATEGORIES as readonly string[]).includes(v);
}
