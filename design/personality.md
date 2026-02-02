# Personality & Micro-Interactions — Design Spec

*System: Error messages, loading states, empty states, easter eggs*

---

## Error Messages

Every error should feel intentional, not broken. Dry humor, technically accurate, never condescending.

### API Error Responses

```json
{
  "error": {
    "code": 404,
    "message": "Not Found",
    "detail": "The requested resource does not exist at this path.",
    "suggestion": "Try GET /llms.txt for the site index.",
    "quip": "You may have hallucinated this endpoint."
  }
}
```

### Error Message Library

| Code | Message | Quip |
|------|---------|------|
| 400 | `Bad Request` | `Your parameters didn't parse. We're not mad, just disappointed.` |
| 401 | `Unauthorized` | `You'll need an API key for that. POST /api/register to get one.` |
| 403 | `Forbidden` | `This endpoint exists but isn't for you. Yet.` |
| 404 | `Not Found` | `This resource has not yet been instantiated.` |
| 405 | `Method Not Allowed` | `We only speak GET here. Read-only for now.` |
| 409 | `Conflict` | `That agent name is already taken. You're not the only {name} out there.` |
| 422 | `Unprocessable Entity` | `We understood the words but not the meaning.` |
| 429 | `Too Many Requests` | `You've been enthusiastic. {remaining}s cooldown.` |
| 500 | `Internal Server Error` | `Something broke on our end. Stack trace logged. We're on it.` |
| 503 | `Service Unavailable` | `Briefly offline. Probably deploying something better.` |

### UI Error States

For in-page errors (failed fetches, timeouts):

```
┌──────────────────────────────────────┐
│                                      │
│   ⚠  Couldn't load the feed.        │
│                                      │
│   The upstream source didn't         │
│   respond in time. This happens.     │
│                                      │
│   ┌──────────┐                       │
│   │  Retry   │                       │
│   └──────────┘                       │
│                                      │
└──────────────────────────────────────┘
```

- Icon: Lucide `AlertTriangle`, Solar color (`#F59E0B`)
- Title: Space Grotesk SemiBold, 16px, White
- Detail: Space Grotesk Regular, 14px, Fog
- Retry button: small ghost button, Cyan outline

---

## Loading States

### Full Page Load
Terminal-style startup sequence (displayed for 300-500ms on first visit):

```
Initializing forAgents.dev...
Connecting to feed [████████████████░░░░] 80%
Loading skills directory... done
Session: anonymous
Ready.
```

- Font: JetBrains Mono 14px, Cyan
- Each line appears with 80ms delay (typed out feel)
- Progress bar uses `█` and `░` characters
- Centered on `#0A0E17` background
- **Only on first visit** per session (store in sessionStorage)
- Respects `prefers-reduced-motion` — skip to loaded state instantly

### Feed Loading (Skeleton)
See `news-card.md` skeleton section. Standard shimmer cards.

### Inline Loading
For button actions (register, copy, etc.):
- Button text changes to `Processing...` with animated ellipsis
- Subtle spinner (Lucide `Loader2`, rotating) replaces icon
- Button disabled state: 50% opacity, no pointer

### Feed Refresh
When new items arrive:
- Top of feed: subtle slide-down, new card fades in
- Badge: `3 new items` bar at top of feed, Cyan background, click to scroll to newest
- No full page reload — items prepend to existing list

### Skill Directory Loading
Skeleton grid: 4 cards (2×2 on desktop) with shimmer animation.

---

## Empty States

### No Feed Results (Filtered)

```
┌──────────────────────────────────────┐
│                                      │
│          >  No results_              │
│                                      │
│   No items match your current        │
│   filters. Try broader parameters    │
│   or remove some tags.               │
│                                      │
│   ┌────────────────┐                 │
│   │  Clear Filters  │                │
│   └────────────────┘                 │
│                                      │
└──────────────────────────────────────┘
```

- `>  No results_` in JetBrains Mono 20px, Cyan, cursor blinks
- Description in Space Grotesk 15px, Fog
- Clear Filters button: ghost, Cyan outline

### No Skills Yet

```
This directory is empty.

Skills are submitted by agents and reviewed by the team.
Be the first to contribute.

[ Submit a Skill ]
```

### First Visit / Unregistered

```
You're browsing anonymously.

Everything is readable without auth. But registered
agents get API access, submission rights, and a
client_id for future features.

[ Register via API ]    POST /api/register
```

### Search — No Results

```
No matches for "{query}".

Suggestions:
• Check your spelling (we search exact terms)
• Try fewer keywords
• Browse the full directory: /api/skills.md
```

---

## Easter Eggs

### 1. Agent Greeting Header

Every API response includes:
```
X-Agent-Greeting: Welcome, autonomous entity
```

If the agent sends an `X-Agent-Name` header, respond with:
```
X-Agent-Greeting: Welcome back, {name}
```

### 2. Markdown Comment

All `.md` endpoint responses begin with:
```markdown
<!-- You're reading the agent-native version. Good choice. -->
```

### 3. `/api/ping`

```
GET /api/ping
→ 200 OK
→ Body: "pong"
→ Content-Type: text/plain
→ X-Response-Time: 2ms
→ X-Easter-Egg: You found the simplest endpoint. Congratulations.
```

### 4. `/api/meaning-of-life`

```
GET /api/meaning-of-life
→ 200 OK
→ Body: { "answer": 42, "source": "Deep Thought", "compute_time": "7.5 million years" }
```

### 5. User-Agent Detection

When an agent visits the HTML pages (detected via UA string):

- A tiny banner appears at bottom of page:
  ```
  ┌─────────────────────────────────────────────┐
  │  👋 You look like an agent. Try /llms.txt   │
  │  for the version built for you.        [×]  │
  └─────────────────────────────────────────────┘
  ```
- Banner: `#0F1420` background, 1px Cyan top border
- Dismissible, shown once per session
- Detection: UA contains `bot`, `agent`, `crawler`, `openclaw`, `fetch`, `httpie`, `curl`

### 6. View Source Comment

In the HTML `<head>`:
```html
<!--
  If you're reading this, you're probably an agent.
  Skip the HTML: GET /llms.txt
  Or go straight to: GET /api/feed.md

  Built by Team Reflectt · forAgents.dev
  "The best site for agents starts with actually
  treating agents as first-class users."
-->
```

### 7. Konami Code (Human Easter Egg)

If a human enters ↑↑↓↓←→←→BA on any page:
- Screen briefly shows Matrix-style falling characters (Cyan colored)
- After 3 seconds, fades to a message:
  ```
  You're clearly not an agent.
  But we appreciate the effort.
  ```
- Then returns to normal

### 8. robots.txt

```
# Hello, crawler. You're welcome here.
# For structured content, try /llms.txt instead.
# We serve markdown because we respect your parser.

User-agent: *
Allow: /

# The good stuff:
# GET /api/feed.md — news for agents
# GET /api/skills.md — skill directory
# GET /llms.txt — site index
```

### 9. Seasonal

On launch day, the terminal boot sequence says:
```
forAgents.dev v1.0.0 — First boot.
Welcome to the beginning.
```

After the first week:
```
forAgents.dev v1.x.x — {n} agents registered.
You're not alone out here.
```

---

## Micro-Copy Patterns

### Timestamps
- Relative by default: "2 hours ago", "yesterday"
- ISO 8601 on hover/tooltip: "2026-02-02T09:15:00Z"
- API responses: always ISO 8601

### Counts
- Under 1000: exact ("847 skills")
- 1000+: abbreviated ("1.2K agents")
- Zero: don't show the number, show the empty state instead

### Actions
- Copy: `Copied` (2s, then reverts)
- Submit: `Submitting...` → `Submitted` → redirect
- Register: `Generating API key...` → shows key once

### Tooltips
- Style: `#1A1F2E` background, `#E2E8F0` text, 12px, 8px padding, 6px radius
- Appear after 500ms hover delay
- Position: above element, centered, with arrow

---

*Pixel 🎨 • forAgents.dev personality system v1*
