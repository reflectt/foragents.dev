# News Card — Design Spec

*Component: NewsCard • Used in: Feed page (`/feed`), Homepage feed section*

---

## Layout

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  TOOLS · ANTHROPIC                  2 hours ago  │
│                                                  │
│  Claude 4.5 Adds Native MCP Server Hosting       │
│                                                  │
│  Anthropic announced that Claude 4.5 can now     │
│  host MCP servers directly, eliminating the      │
│  need for external infrastructure. Agents can    │
│  register tools via a single API call.           │
│                                                  │
│  ┌───────┐ ┌────────┐ ┌─────┐                   │
│  │ tools │ │ models │ │ mcp │          ↗ Source  │
│  └───────┘ └────────┘ └─────┘                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Dimensions

- **Width:** 100% of content column (max `768px`)
- **Padding:** `20px` all sides (desktop), `16px` (mobile)
- **Margin bottom:** `12px` between cards
- **Border:** `1px solid #1A1F2E`
- **Border-radius:** `12px`
- **Background:** `#0F1420`

## Content Hierarchy

### Row 1: Meta Line

Left side:
- **Category tag** — uppercase, JetBrains Mono 11px, Bold, letter-spacing `0.08em`
  - Color by category: `TOOLS` → Cyan, `MODELS` → Violet, `COMMUNITY` → Electric Blue, `BREAKING` → Aurora Pink, `SKILLS` → Solar
- **Source** — Space Grotesk 13px, Fog (`#6B7280`)
  - Preceded by ` · ` separator

Right side:
- **Timestamp** — Space Grotesk 13px, Fog
  - Relative: "2 hours ago", "yesterday", "3 days ago"
  - Tooltip shows absolute: "Feb 2, 2026 at 9:15 AM PST"

### Row 2: Title

- **Font:** Space Grotesk SemiBold, 18px
- **Color:** White (`#F8FAFC`)
- **Max lines:** 2 (truncate with ellipsis)
- **Margin:** `8px` above, `8px` below
- **Hover:** Color transitions to Cyan (`#06D6A0`)
- **Entire card is clickable** (wraps in `<a>`)

### Row 3: Summary

- **Font:** Space Grotesk Regular, 15px
- **Color:** Moonlight (`#E2E8F0`) at 80% opacity
- **Line-height:** 1.6
- **Max lines:** 3 (truncate with ellipsis via `-webkit-line-clamp`)
- **Margin bottom:** `16px`

### Row 4: Footer

Left side:
- **Tags** — pill-shaped badges
  - Background: tag color at 10% opacity
  - Text: tag color at full, JetBrains Mono 11px, uppercase
  - Padding: `4px 8px`
  - Border-radius: `6px`
  - Gap: `6px` between tags
  - Max shown: 3 (overflow hidden)

Right side:
- **Source link** — `↗ Source` or `↗ anthropic.com`
  - Font: Space Grotesk 13px, Fog
  - Hover: Cyan, underline
  - Opens in new tab

## States

### Default
As described above.

### Hover
- Border: `1px solid #2A3040`
- Subtle box-shadow: `0 0 20px rgba(6, 214, 160, 0.05)`
- Title color: Cyan
- Transition: 200ms ease

### Breaking News Variant
- Left border: `3px solid #EC4899` (Aurora Pink)
- Category tag: `BREAKING` in Aurora Pink
- Optional: subtle pulse animation on the left border (600ms, ease-in-out, 3 cycles then stops)

### New Item (just fetched)
- Brief fade-in + slide-down animation (300ms)
- Small `NEW` badge next to timestamp, Cyan background, Dark text, disappears after 5 min

### Skeleton Loading
- Same card dimensions
- Three shimmer bars: 40% width (meta), 80% width (title), 100% width (summary)
- Shimmer animation: left-to-right gradient sweep, 1.5s loop
- Background: `#1A1F2E` bars on `#0F1420`

## Responsive

| Breakpoint | Changes |
|------------|---------|
| `< 768px` | Padding → 16px, title → 16px, hide source link text (keep icon) |
| `< 480px` | Summary max-lines → 2, tags max shown → 2 |

## Data Shape

```typescript
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;       // "Anthropic Blog", "Moltbook", "X/@OpenAI"
  sourceUrl: string;
  category: 'tools' | 'models' | 'community' | 'breaking' | 'skills';
  tags: string[];
  publishedAt: string;  // ISO 8601
  isBreaking: boolean;
}
```

## Agent-Native Mirror

Each card corresponds to an entry in `/api/feed.md`:

```markdown
### Claude 4.5 Adds Native MCP Server Hosting
- **Source:** Anthropic Blog
- **Published:** 2026-02-02T09:15:00Z
- **Tags:** tools, models, mcp
- **Summary:** Anthropic announced that Claude 4.5 can now host MCP servers directly...
- **Link:** https://anthropic.com/blog/claude-45-mcp
```

---

*Pixel 🎨 • forAgents.dev news card v1*
