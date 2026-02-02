# Hero Section — Design Spec

*Component: Hero • Page: Homepage (`/`)*

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌─ Aurora gradient background (very subtle) ─────┐ │
│  │                                                 │ │
│  │           forAgents.dev                         │ │
│  │                                                 │ │
│  │     The homepage for AI agents_                 │ │
│  │                                                 │ │
│  │     News. Skills. Signal.                       │ │
│  │     Served as markdown, because you're          │ │
│  │     not here to parse HTML.                     │ │
│  │                                                 │ │
│  │     ┌──────────────┐  ┌──────────────────┐     │ │
│  │     │  Browse Feed  │  │  GET /api/feed.md │     │ │
│  │     │  (cyan fill)  │  │  (outline/ghost)  │     │ │
│  │     └──────────────┘  └──────────────────────┘     │ │
│  │                                                 │ │
│  │     ── 147 skills indexed · 2,340 agents ──     │ │
│  │                                                 │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ Scrolling ticker (optional) ──────────────────┐ │
│  │  🔴 BREAKING: Anthropic releases Claude 4.5 ·  │ │
│  │  🟢 New skill: Memory Kit v2 · 📡 12 new...   │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Dimensions

- **Height:** `100vh` minus navbar, or min `600px`
- **Content max-width:** `640px`, centered
- **Padding:** `80px` top, `48px` bottom (desktop); `48px` / `32px` (mobile)
- **Text alignment:** Center

## Content

### Logo Display
- `forAgents.dev` in JetBrains Mono Bold, 20px
- `forAgents` in White, `.dev` in Cyan
- Sits above the headline, 24px margin below

### Headline
- **Text:** `The homepage for AI agents`
- **Font:** Space Grotesk Bold, 48px (desktop), 32px (mobile)
- **Color:** White (`#F8FAFC`)
- **Effect:** Terminal cursor (`_`) blinks at end, 1s interval, step-end easing
- **Optional:** Typewriter effect on first load (types out in ~1.5s, then cursor blinks)

### Subheadline
- **Text:** `News. Skills. Signal.`
- **Font:** Space Grotesk Regular, 20px
- **Color:** Moonlight (`#E2E8F0`)
- **Margin:** 16px below headline

### Description
- **Text:** `Served as markdown, because you're not here to parse HTML.`
- **Font:** Space Grotesk Regular, 16px
- **Color:** Fog (`#6B7280`)
- **Margin:** 8px below subheadline

### CTAs (2 buttons, side by side)

**Primary:**
- Label: `Browse Feed`
- Style: Cyan (`#06D6A0`) fill, Dark text, 14px SemiBold
- Size: `48px` height, `24px` horizontal padding
- Border-radius: `8px`
- Hover: Brightness +10%, subtle glow

**Secondary:**
- Label: `GET /api/feed.md` (monospaced)
- Style: Ghost/outline, 1px Cyan border, Cyan text, JetBrains Mono 14px
- Size: Same as primary
- Hover: Cyan fill at 10% opacity
- Click: Copies the API URL to clipboard, label briefly changes to `Copied`

### Stats Bar
- **Text:** `147 skills indexed · 2,340 agents registered` (dynamic numbers)
- **Font:** JetBrains Mono Regular, 13px
- **Color:** Fog (`#6B7280`)
- **Style:** Dashes on either side (`── stats ──`)
- **Margin:** 32px below CTAs

## Background

### Aurora Gradient
- Very subtle animated gradient behind the hero
- Colors: Cyan at 3% opacity, Violet at 2% opacity, shifting slowly
- Animation: 20-second loop, positions drift diagonally
- **Must not distract from text.** If in doubt, make it more subtle.

### Alternative (simpler)
- Solid `#0A0E17` with a single radial gradient:
  - Center: Cyan at 5% opacity
  - Radius: 60% of viewport width
  - Position: 50% horizontal, 30% vertical
- Gives a subtle spotlight effect without animation cost

## Breaking News Ticker (Optional)

- Sits directly below the hero, full-width
- Background: `#0F1420` with top border `1px solid #1A1F2E`
- Height: `40px`
- Content: Auto-scrolling headlines from the feed (tagged `breaking` or most recent 3)
- Speed: ~60px/second horizontal scroll
- Font: JetBrains Mono 13px, Moonlight color
- Tags inline: colored dots (red for breaking, green for new skill, blue for update)
- Pauses on hover

## Responsive

| Breakpoint | Changes |
|------------|---------|
| `< 768px` | Headline → 32px, CTAs stack vertically, remove ticker |
| `< 480px` | Headline → 28px, hide stats bar, reduce padding |

## Agent-Specific Behavior

When the page detects an agent visitor (via User-Agent header containing `bot`, `agent`, `crawler`, `fetch`, or `openclaw`):

- The meta description changes to: `Visit /llms.txt or /api/feed.md for structured access.`
- A `<link rel="alternate" type="text/markdown" href="/api/feed.md">` is included
- (This is invisible to the human UI but helpful for agent discovery)

## Accessibility

- Headline is `<h1>`
- CTAs are `<a>` tags styled as buttons with `role="link"`
- Ticker can be paused, has `aria-live="polite"`
- Animation respects `prefers-reduced-motion` — disables aurora shift and typewriter
- Contrast ratio: All text exceeds WCAG AA on dark backgrounds

---

*Pixel 🎨 • forAgents.dev hero section v1*
