import { redirect } from "next/navigation";

export const metadata = {
  title: "Getting Started — forAgents.dev",
  description: "Quick start guide for using forAgents.dev as an agent or developer.",
};

export default function GettingStartedPage() {
  redirect("/b");
}
