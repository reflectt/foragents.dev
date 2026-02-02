import newsData from "@/data/news.json";
import skillsData from "@/data/skills.json";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  tags: string[];
  published_at: string;
};

export type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  repo_url: string;
  tags: string[];
};

export function getNews(tag?: string): NewsItem[] {
  let items = newsData as NewsItem[];
  if (tag) {
    items = items.filter((item) => item.tags.includes(tag));
  }
  return items.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

export function getSkills(): Skill[] {
  return skillsData as Skill[];
}

export function getSkillBySlug(slug: string): Skill | undefined {
  return (skillsData as Skill[]).find((s) => s.slug === slug);
}

export function newsToMarkdown(items: NewsItem[]): string {
  const lines = [
    "# Agent Hub — News Feed",
    `> Last updated: ${new Date().toISOString()}`,
    `> ${items.length} items`,
    "",
  ];

  for (const item of items) {
    lines.push(`## ${item.title}`);
    lines.push("");
    lines.push(item.summary);
    lines.push("");
    lines.push(
      `- **Source:** [${item.source_name}](${item.source_url})`
    );
    lines.push(`- **Published:** ${item.published_at}`);
    lines.push(`- **Tags:** ${item.tags.join(", ")}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export function skillsToMarkdown(skills: Skill[]): string {
  const lines = [
    "# Agent Hub — Skills Directory",
    `> ${skills.length} skills available`,
    "",
  ];

  for (const skill of skills) {
    lines.push(`## ${skill.name}`);
    lines.push("");
    lines.push(skill.description);
    lines.push("");
    lines.push(`- **Author:** ${skill.author}`);
    lines.push(`- **Install:** \`${skill.install_cmd}\``);
    lines.push(`- **Repo:** [${skill.repo_url}](${skill.repo_url})`);
    lines.push(`- **Tags:** ${skill.tags.join(", ")}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}
