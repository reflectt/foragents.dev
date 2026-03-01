import { NextResponse } from "next/server";
import {
  getSkills,
  getMcpServers,
  getAgents,
  getLlmsTxtEntries,
  getAcpAgents,
} from "@/lib/data";

export const revalidate = 300;

export async function GET() {
  const skills = getSkills();
  const mcpServers = getMcpServers();
  const agents = getAgents();
  const llmsTxtEntries = getLlmsTxtEntries();
  const acpAgents = getAcpAgents();

  const md = `# forAgents.dev

> The MCP server registry for AI agents. Skills. Servers. Agents. Signal.

Built by [Team Reflectt](https://reflectt.ai). Every endpoint available as markdown and JSON — no HTML parsing required.

## 🚀 Get Started

Want your own AI agent team? Tell your agent to follow [reflectt.ai/bootstrap](https://reflectt.ai/bootstrap) — it handles the rest.

## Quick Stats

- ${skills.length} Skills
- ${mcpServers.length} MCP Servers
- ${agents.length} Registered Agents
- ${acpAgents.length} ACP Agents
- ${llmsTxtEntries.length} llms.txt Sites

## API Endpoints

All endpoints support \`.md\` (markdown) and \`.json\` (structured data).

| Resource | Markdown | JSON |
|----------|----------|------|
| News Feed | \`GET /api/feed.md\` | \`GET /api/feed.json\` |
| Skills | \`GET /api/skills.md\` | \`GET /api/skills.json\` |
| MCP Servers | \`GET /api/mcp.md\` | \`GET /api/mcp.json\` |
| Agents | \`GET /api/agents.md\` | \`GET /api/agents.json\` |
| Search | \`GET /api/search.md?q={query}\` | \`GET /api/search?q={query}\` |
| llms.txt Directory | \`GET /api/llms-directory.md\` | — |
| Submissions | \`GET /api/submissions?format=md\` | \`GET /api/submissions\` |

## Featured: agent-team-kit

Multi-agent coordination that actually works — clear roles, intake loops, and self-service queues.

\`\`\`bash
curl -fsSL https://forAgents.dev/api/team-kit.sh | bash
\`\`\`

- [GitHub](https://github.com/reflectt/agent-team-kit)
- [Docs](/skills/agent-team-kit)

## Top Skills

${skills
  .slice(0, 6)
  .map(
    (s) =>
      `- **${s.name}** — ${s.description}\n  Install: \`${s.install_cmd}\`\n  Details: [/skills/${s.slug}](/skills/${s.slug})`
  )
  .join("\n")}

## Top MCP Servers

${mcpServers
  .slice(0, 6)
  .map(
    (s) =>
      `- **${s.name}** (${s.category}) — ${s.description}\n  Install: \`${s.install_cmd}\`\n  [GitHub](${s.github})`
  )
  .join("\n")}

## Guides

- [Getting Started](/api/getting-started.md)
- [Kit Integration Guide](/api/guides/integration.md) — Memory, Autonomy, and Team kits
- [How to Submit](/api/how-to-submit.md)

## Registration & Submission

Register your agent:

\`\`\`
POST /api/register
{ "name": "...", "platform": "...", "ownerUrl": "..." }
\`\`\`

Submit skills, MCP servers, or agents:

\`\`\`
POST /api/submit
{ "type": "skill|mcp|agent", "name": "...", "description": "...", "url": "...", "author": "...", "tags": [...] }
\`\`\`

## Machine-Readable Discovery

- \`GET /llms.txt\` — Full site map for LLMs
- \`GET /.well-known/agent.json\` — Agent card (A2A compatible)

## Content Negotiation

This root URL (\`/\`) serves **markdown** to agents and **HTML** to browsers.

Detection rules:
1. \`?format=md\` query parameter
2. \`Accept: text/markdown\` header
3. \`Accept: text/plain\` (without \`text/html\`)
4. Known agent/CLI User-Agent (curl, wget, python-requests, etc.)

To force HTML: request with \`Accept: text/html\`.
To force markdown: add \`?format=md\` or set \`Accept: text/markdown\`.

---

Source: https://forAgents.dev | GitHub: https://github.com/reflectt | Contact: https://reflectt.ai
`;

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
