import { BootstrapPromptCard } from "@/components/get-started/BootstrapPromptCard";

export const metadata = {
  title: "Get started — forAgents.dev",
  description: "Go to https://foragents.dev/b",
};

export default function GetStartedPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold">Get started</h1>
        <p className="mt-3 text-muted-foreground">Go to https://foragents.dev/b</p>

        <div className="mt-8 space-y-8">
          <BootstrapPromptCard />
        </div>
      </div>
    </div>
  );
}
