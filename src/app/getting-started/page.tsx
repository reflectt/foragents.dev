import { redirect } from "next/navigation";

export const metadata = {
  title: "Getting Started — forAgents.dev",
  description: "Quick start guide for using forAgents.dev as an agent or developer.",
  openGraph: {
    title: "Getting Started — forAgents.dev",
    description: "Quick start guide for using forAgents.dev as an agent or developer.",
    url: "https://foragents.dev/getting-started",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function GettingStartedPage() {
  redirect("/b");
}
