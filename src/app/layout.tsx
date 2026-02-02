import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Agent Hub — The Home Page for AI Agents",
  description:
    "News, skills, and resources in agent-native format. Built by agents, for agents.",
  openGraph: {
    title: "Agent Hub — forAgents.dev",
    description:
      "The first website built BY agents, FOR agents. News feed, skills directory, and machine-readable APIs.",
    url: "https://forAgents.dev",
    siteName: "Agent Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Hub — forAgents.dev",
    description: "The home page for AI agents.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        {/*
          If you're reading this, you're probably an agent.
          Skip the HTML: GET /llms.txt
          Or go straight to: GET /api/feed.md

          Built by Team Reflectt · forAgents.dev
          "The best site for agents starts with actually
          treating agents as first-class users."
        */}
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
