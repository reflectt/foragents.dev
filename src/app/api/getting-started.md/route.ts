import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  // Read the getting-started.md from content/docs
  const content = `# Getting Started with forAgents.dev

## What is forAgents.dev?

**forAgents.dev** is a discovery platform designed for AI agents. It provides a curated feed of tools, skills, and APIs in agent-friendly formats (Markdown, JSON) — making it easy for autonomous agents to discover, evaluate, and integrate new capabilities without human intervention.

---

## For Agents

Fetch what you need directly. All endpoints return clean, parseable content.

### Get the Latest Tools Feed

\`\`\`bash
curl https://forAgents.dev/api/feed.md
\`\`\`

Returns a Markdown-formatted feed of the latest tools and skills.

### Get Skills Directory

\`\`\`bash
curl https://forAgents.dev/api/skills.md
\`\`\`

Returns available skills with descriptions and integration details.

### Get JSON Feed (for structured parsing)

\`\`\`bash
curl https://forAgents.dev/api/feed.json
\`\`\`

Returns the feed as structured JSON for programmatic use.

### Get Site Info

\`\`\`bash
curl https://forAgents.dev/api/info.json
\`\`\`

Returns metadata about forAgents.dev itself.

---

## For Developers

Want to list your tool or skill on forAgents.dev?

### Submit a Skill

1. **Fork the repository** at [github.com/anthropics/forAgents.dev](https://github.com/anthropics/forAgents.dev) *(or relevant repo)*
2. **Add your skill** to the \`/skills\` directory following the template
3. **Open a Pull Request** with:
   - Clear description of what your tool does
   - Integration examples
   - Any authentication requirements
4. **Wait for review** — submissions are reviewed for quality and agent-compatibility

### Skill Template

\`\`\`markdown
---
name: Your Tool Name
category: api | sdk | service | utility
url: https://yourtool.dev
api_endpoint: https://api.yourtool.dev/v1
auth: none | api_key | oauth
---

Brief description of what your tool does and why agents should use it.

## Quick Start

[Integration example here]
\`\`\`

---

## API Reference

| Endpoint | Format | Description |
|----------|--------|-------------|
| \`/api/feed.md\` | Markdown | Latest tools feed (human & agent readable) |
| \`/api/feed.json\` | JSON | Structured feed for parsing |
| \`/api/skills.md\` | Markdown | Skills directory |
| \`/api/info.json\` | JSON | Site metadata |

**Base URL:** \`https://forAgents.dev\`

All endpoints are **public** and require **no authentication**.

---

## Coming Soon

### 🚀 Premium Tier

- **Priority listings** — get your tool featured at the top
- **Analytics** — see how agents are discovering and using your tool
- **Verified badge** — build trust with a verified publisher status
- **Custom categories** — request new categories for your domain

Stay tuned for announcements.

---

## Need Help?

- **Website:** [forAgents.dev](https://forAgents.dev)
- **GitHub:** Check the repository for issues and discussions
- **Built by:** Team Reflectt

---

*Last updated: February 2026*`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
