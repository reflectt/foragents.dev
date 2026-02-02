import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
