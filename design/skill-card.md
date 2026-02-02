# Skill Card — Design Spec

*Component: SkillCard • Used in: Skills directory (`/skills`), Homepage featured skills*

---

## Layout

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  📦  Agent Memory Kit                    v1.2.0  │
│      by Team Reflectt                            │
│                                                  │
│  Three-layer memory system: working memory,      │
│  daily logs, and long-term curated knowledge.    │
│  Gives agents continuity across sessions.        │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  $ openclaw install agent-memory-kit    ⧉  │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────┐ ┌─────────┐ ┌──────────┐            │
│  │ memory │ │ openclaw │ │ sessions │   ★ 142   │
│  └────────┘ └─────────┘ └──────────┘            │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Dimensions

- **Width:** Grid cell — `calc(50% - 8px)` on desktop, `100%` on mobile
- **Padding:** `20px`
- **Margin bottom:** `16px` (in grid, handled by `gap`)
- **Border:** `1px solid #1A1F2E`
- **Border-radius:** `12px`
- **Background:** `#0F1420`

## Content Hierarchy

### Row 1: Header

Left side:
- **Icon** — `📦` (Package emoji) or Lucide `Package` icon, 20px, Cyan
- **Name** — Space Grotesk SemiBold, 18px, White
- **Author** — Space Grotesk Regular, 13px, Fog (`#6B7280`)
  - Displayed as `by {author}` below the name
  - Clickable: links to author's profile or GitHub

Right side:
- **Version** — JetBrains Mono Regular, 12px, Fog
  - Displayed as `v1.2.0`
  - Background: `#1A1F2E`, padding `2px 8px`, border-radius `4px`

### Row 2: Description

- **Font:** Space Grotesk Regular, 15px
- **Color:** Moonlight (`#E2E8F0`) at 80% opacity
- **Line-height:** 1.6
- **Max lines:** 3 (truncate with ellipsis)
- **Margin:** `12px` top, `16px` bottom

### Row 3: Install Command

A copyable terminal-style block:

- **Background:** `#0A0E17` (darker than card)
- **Border:** `1px solid #1A1F2E`
- **Border-radius:** `8px`
- **Padding:** `10px 14px`
- **Font:** JetBrains Mono Regular, 13px
- **Color:** Cyan (`#06D6A0`)
- **Prefix:** `$` in Fog color, followed by the command
- **Copy button:** `⧉` icon (Lucide `Copy`), right-aligned
  - On hover: Cyan color
  - On click: Changes to `✓` for 2 seconds, copies command to clipboard
- **Full command example:** `openclaw install agent-memory-kit`

### Row 4: Footer

Left side:
- **Tags** — same pill style as news cards
  - Background: Violet at 10% opacity, text Violet
  - JetBrains Mono 11px, uppercase
  - Max shown: 3

Right side:
- **Stars/installs** — `★ 142`
  - Font: Space Grotesk Regular, 13px, Fog
  - Star icon: Solar (`#F59E0B`) or Fog depending on if user has starred
  - Number = install count or star count

## States

### Default
As described above.

### Hover
- Border: `1px solid #2A3040`
- Box-shadow: `0 0 20px rgba(139, 92, 246, 0.05)` (violet tint)
- Transition: 200ms ease

### Featured / Official
- Top border: `2px solid` with Aurora Gradient (cyan → blue → violet)
- Small badge: `OFFICIAL` — JetBrains Mono 10px, uppercase
  - Background: Cyan at 15% opacity, text Cyan
  - Positioned top-right of card, `margin: -10px -10px 0 0` (overlaps border)

### Skeleton Loading
- Same card dimensions
- Shimmer bars: icon circle + title bar, description block, command block
- Same shimmer as news cards

## Grid Layout

```
Desktop (≥ 768px):
┌──────────────┐  ┌──────────────┐
│   Skill 1    │  │   Skill 2    │
└──────────────┘  └──────────────┘
┌──────────────┐  ┌──────────────┐
│   Skill 3    │  │   Skill 4    │
└──────────────┘  └──────────────┘

Mobile (< 768px):
┌──────────────────────────────┐
│          Skill 1             │
└──────────────────────────────┘
┌──────────────────────────────┐
│          Skill 2             │
└──────────────────────────────┘
```

- **Desktop:** `grid-template-columns: repeat(2, 1fr)`, gap `16px`
- **Mobile:** `grid-template-columns: 1fr`
- **NEVER 3 columns** — cards need width for the install command

## Data Shape

```typescript
interface Skill {
  slug: string;
  name: string;
  description: string;
  version: string;
  author: string;
  authorUrl?: string;
  installCmd: string;       // "openclaw install agent-memory-kit"
  tags: string[];
  stars: number;
  isOfficial: boolean;      // Team Reflectt skills
  sourceUrl: string;        // GitHub link
  docUrl: string;           // /api/skills/{slug}.md
}
```

## Agent-Native Mirror

`/api/skills/agent-memory-kit.md`:

```markdown
# Agent Memory Kit

> Three-layer memory system for agent session continuity.

- **Version:** 1.2.0
- **Author:** Team Reflectt
- **Install:** `openclaw install agent-memory-kit`
- **Source:** https://github.com/reflectt/agent-memory-kit
- **Tags:** memory, openclaw, sessions

## Description

Three-layer memory system: working memory (MEMORY.md),
daily logs (memory/YYYY-MM-DD.md), and long-term curated
knowledge. Gives agents continuity across sessions.

## Installation

\`\`\`bash
openclaw install agent-memory-kit
\`\`\`
```

---

*Pixel 🎨 • forAgents.dev skill card v1*
