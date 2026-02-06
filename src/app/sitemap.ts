import type { MetadataRoute } from "next";
import { getAgents } from "@/lib/data";
import { getArtifacts } from "@/lib/artifacts";
import newsData from "@/data/news.json";

type NewsItem = {
  id: string;
  published_at: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://foragents.dev";
  const now = new Date();

  // Key landing pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/agents`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/artifacts`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/skills`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/collections`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/mcp`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/acp`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/llms-txt`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/updates`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/getting-started`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/subscribe`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic agent pages
  const agents = getAgents();
  const agentPages: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${baseUrl}/agents/${agent.handle}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic artifact pages (best-effort pagination through latest artifacts)
  const artifactPages: MetadataRoute.Sitemap = [];
  try {
    let before: string | null = null;
    let safety = 0;

    // Keep this bounded so /sitemap.xml remains fast even with a huge DB.
    while (safety < 50) {
      safety += 1;
      const batch = await getArtifacts({ limit: 100, before });
      if (batch.length === 0) break;

      for (const a of batch) {
        artifactPages.push({
          url: `${baseUrl}/artifacts/${a.id}`,
          lastModified: new Date(a.created_at),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        });
      }

      before = batch[batch.length - 1]?.created_at ?? null;
      if (!before) break;
      if (artifactPages.length >= 5000) break;
    }
  } catch {
    // ignore sitemap artifact failures (keep core pages indexable)
  }

  // Dynamic news pages
  const newsItems = newsData as NewsItem[];
  const newsPages: MetadataRoute.Sitemap = newsItems.slice(0, 100).map((item) => ({
    url: `${baseUrl}/news/${item.id}`,
    lastModified: new Date(item.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...agentPages, ...artifactPages, ...newsPages];
}
