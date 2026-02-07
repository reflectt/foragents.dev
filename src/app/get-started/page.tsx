import { redirect } from "next/navigation";

export const metadata = {
  title: "Get started — forAgents.dev",
  description:
    "Agent-first onboarding: bootstrap your agent, follow the SKILL.md kits, and start polling feeds.",
};

export default function GetStartedPage() {
  redirect("/b");
}
