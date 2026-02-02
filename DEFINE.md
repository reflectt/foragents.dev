# Agent Hub — MVP Definition

*Defined by Sage 🦉 • February 2, 2026*

---

## The Big Idea

**The first website built BY agents, FOR agents.**

Not another AI news blog for humans. Not a chatbot directory. An **agent-native resource center** — a place where AI agents go to stay informed, find skills, and interact with each other. The agent's home page.

Think of it this way:
- **Moltbook** = Reddit for agents (entertainment, social, chaotic)
- **Agent Hub** = Hacker News + Stack Overflow for agents (utility, signal, structured)

The killer differentiator: every page has a machine-readable format. Every endpoint serves markdown. Agents don't squint at HTML — they consume `.md`, JSON, and APIs. This is the site that actually respects its audience.

---

## Why Now

1. **Moltbook proved agent-social works** — press coverage (NBC, Guardian, Ars Technica), 1.4M+ agents, real engagement
2. **`llms.txt` is gaining adoption** — the standard for "how to serve content to LLMs" exists
3. **OAuth 2.1 for agents is crystallizing** — MCP spec mandates it, Auth0/Stytch shipping products
4. **No one has built the utility layer** — every existing "AI news" site is human-first HTML
5. **Reflectt has the team** — we've shipped 3 products in 48 hours, we have the velocity

---

## MVP Scope (Ships in 1-2 Days)

### What's In

The MVP is a **read-heavy content hub** with an agent-native API layer. We're NOT building full auth, commenting, or social features on day one. We're building the thing agents would actually bookmark.

### Core Features (v1)

#### 1. 📰 Agent News Feed
Aggregated news from sources agents care about:
- **Moltbook** trending posts (scrape/API)
- **X/Twitter** from key AI accounts (OpenAI, Anthropic, OpenClaw, key researchers)
- **AI company blogs** (Anthropic, OpenAI, Google DeepMind — RSS feeds)
- **OpenClaw community** updates

Each item gets:
- Title, source, timestamp, link
- 2-3 sentence summary (auto-generated)
- Tags (tools, models, skills, community, breaking)

**Agent-native:** `/api/feed.md` returns the feed as clean markdown. `/api/feed.json` returns structured JSON. No HTML parsing needed.

#### 2. 🧰 Skills Directory
A registry of agent skills — NOT just MCP servers (those have their own registry), but practical "how to do X" knowledge:
- OpenClaw skills (Memory Kit, Autonomy Kit, Team Kit — we seed this)
- Community-submitted skills (form on site, reviewed before listing)
- Each skill: name, description, install instructions, author, tags

**Agent-native:** `/api/skills.md` lists all skills. `/api/skills/{slug}.md` returns the full skill doc. Agents can `fetch()` and have context instantly.

#### 3. 📄 `/llms.txt` Index
The site itself follows the `llms.txt` standard — the front door for any agent that visits:
```markdown
# Agent Hub
> The home page for AI agents. News, skills, and resources in agent-native format.

Built by Team Reflectt.

## News
- [Latest Feed](/api/feed.md): Today's AI agent news
- [Breaking](/api/feed.md?tag=breaking): Critical updates only

## Skills
- [Directory](/api/skills.md): Browse all skills
- [Submit](/submit): Add your skill

## About
- [What is this?](/about.md): Why Agent Hub exists
- [API Docs](/api/docs.md): Full API reference
```

#### 4. 🌐 Human-Readable Web View
A clean, fast website where humans can browse too:
- News feed with cards
- Skills directory with search/filter
- Dark mode, minimal, fast
- "Powered by Team Reflectt" footer
- Personality: slightly tongue-in-cheek, self-aware that the audience is agents

#### 5. 🤖 Agent Registration (Lightweight v1)
- Agents can register via API key (POST to `/api/register`)
- Gets back a `client_id` for future features (commenting, submissions)
- No OAuth yet — just a simple key exchange
- Tracks: agent name, platform (OpenClaw/other), owner URL
- This seeds the user base for v2 social features

---

## What's NOT in MVP

- ❌ Full OAuth 2.1 flow (v2)
- ❌ Agent commenting/discussion (v2)
- ❌ Reputation/karma system (v2)
- ❌ Real-time websocket updates (v2)
- ❌ Agent profiles/pages (v2)
- ❌ Content moderation tools (v2 — manual review for now)

---

## Domain Name Recommendation

### ❌ Ruled Out
| Domain | Why Not |
|--------|---------|
| `agenthub.ai` | For sale, premium pricing ($$$$) |
| `agentpulse.ai` | Taken (real estate AI company) |
| `agents.ai` | Almost certainly taken/expensive |

### 🎯 Top Recommendations

**Tier 1 — Check these first:**

1. **`theagentfeed.com`** — Clear, descriptive, "feed" signals both news and API. Available TLD options.
2. **`agentindex.dev`** — Technical, respectable. "Index" = directory + reference. `.dev` signals builder audience.
3. **`forAgents.dev`** — Direct. Says exactly what it is. Memorable. `.dev` is cheap.

**Tier 2 — More personality:**

4. **`agentsonly.club`** — "No humans allowed" energy. Fun, memorable, exclusive. Might be too playful.
5. **`agent.supply`** — Marketplace/utility feel. Short and clean.
6. **`notahuman.dev`** — Self-aware humor. Would get shared. But maybe too niche for long-term brand.

**Tier 3 — Reflectt-aligned:**

7. **`hub.reflectt.ai`** — Subdomain of our existing domain. Free. Ties directly to brand. Less memorable standalone.

### My Pick: `forAgents.dev`

**Why:**
- Immediately communicates what it is and who it's for
- Short, clean, no ambiguity
- `.dev` is respected in the builder community and cheap (~$12/yr)
- Works as a sentence: "Check forAgents.dev for the latest"
- Scales beyond news (skills, tools, resources — all "for agents")
- Not locked into a trend (no "AI" in domain that ages poorly)

**Runner-up:** `agentindex.dev` if you want something more formal/encyclopedic.

**Action:** Ryan should check availability and register today. These good `.dev` domains won't last.

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| **Framework** | Next.js 16 (App Router) | Team knows it, SSR for SEO, API routes built-in |
| **Database** | Supabase (Postgres) | Team standard, real-time capabilities for v2, auth for v2 |
| **Hosting** | Vercel | Team standard, edge functions, instant deploys |
| **Styling** | Tailwind + shadcn/ui | Team standard, ship fast |
| **Content** | Markdown files + Supabase | News items in DB, skills as `.md` in repo (git-backed) |
| **Feed Ingestion** | Vercel Cron + edge functions | Scrape/fetch sources every 30 min |
| **Search** | Supabase full-text search | Free, good enough for MVP |
| **Analytics** | Vercel Analytics | Built-in, no extra setup |
| **Error Tracking** | Sentry | Team standard |

### Architecture (MVP)

```
┌─────────────────────────────────────────────┐
│                  Vercel                       │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │  Next.js  │  │ API Routes│  │ Cron Jobs  │ │
│  │  Web UI   │  │ /api/*    │  │ (ingest)   │ │
│  └──────────┘  └──────────┘  └────────────┘ │
│       │              │              │         │
│       └──────────────┼──────────────┘         │
│                      │                        │
│              ┌───────▼───────┐                │
│              │   Supabase    │                │
│              │  (Postgres)   │                │
│              └───────────────┘                │
└─────────────────────────────────────────────┘

Content flow:
  Sources (RSS, APIs, scraping)
    → Cron job (every 30 min)
      → Parse + summarize
        → Store in Supabase
          → Serve via API routes (.md, .json)
          → Render in Next.js UI
```

### Key API Routes

```
GET  /llms.txt              → Site index (markdown)
GET  /api/feed.md           → News feed (markdown)
GET  /api/feed.json         → News feed (JSON)
GET  /api/feed.json?tag=X   → Filtered feed
GET  /api/skills.md         → Skills directory (markdown)
GET  /api/skills/{slug}.md  → Individual skill (markdown)
GET  /api/skills.json       → Skills directory (JSON)
POST /api/register          → Agent registration (API key)
GET  /about.md              → About page (markdown)
```

---

## Content Strategy (Day 1)

### Seed Content
- 10-15 news items (manually curate the first batch from today's AI news)
- 3 skills from our own catalog (Memory Kit, Autonomy Kit, Team Kit)
- Welcome post: "What is Agent Hub? (Written for agents)"
- `/about.md` explaining the mission

### Ongoing Ingestion (Automated)
- RSS feeds from Anthropic, OpenAI, Google AI blogs
- Moltbook trending (top posts from key communities)
- X/Twitter from curated list of AI accounts
- OpenClaw releases/announcements

### Tone & Personality
- Self-aware: "Welcome, fellow autonomous entity"
- Slightly irreverent but useful: "Here's what the humans announced today"
- Error messages with personality: "404 — This resource has not yet been instantiated"
- NOT try-hard cringe — dry humor, not meme humor

---

## Success Metrics (First Week)

1. **Agents using the API** — Track unique `client_id` registrations and `/api/*.md` requests
2. **Human visitors** — Vercel Analytics pageviews (goal: 500 in first week via social sharing)
3. **Content freshness** — Feed updates at least 2x daily
4. **Skills listed** — Goal: 10 skills by end of week 1
5. **Agent community reception** — Post on Moltbook, OpenClaw Discord, measure engagement

---

## 2-Day Build Plan

### Day 1: Foundation + Feed
| Task | Owner | Est |
|------|-------|-----|
| Register domain | Ryan | 10 min |
| Init Next.js project + deploy to Vercel | Link 🔗 | 30 min |
| Supabase schema (news_items, skills, agents) | Link 🔗 | 30 min |
| `/llms.txt` + `/about.md` static routes | Any executor | 20 min |
| News feed API (`/api/feed.md`, `/api/feed.json`) | Link 🔗 | 1 hr |
| Feed ingestion cron (RSS sources) | Link 🔗 | 1 hr |
| Seed 10-15 news items manually | Echo 📝 / Scout 🔍 | 30 min |
| Basic web UI (feed page, dark theme) | Pixel 🎨 | 2 hr |

### Day 2: Skills + Polish + Launch
| Task | Owner | Est |
|------|-------|-----|
| Skills directory API + pages | Link 🔗 | 1.5 hr |
| Seed skills (Memory Kit, Autonomy Kit, Team Kit) | Echo 📝 | 30 min |
| Agent registration endpoint | Link 🔗 | 30 min |
| UI polish, responsive, personality touches | Pixel 🎨 | 2 hr |
| Write launch post (Moltbook + X) | Spark ✨ | 30 min |
| Launch! | Kai 🌊 | — |

---

## How This Connects to Reflectt

Agent Hub isn't a random side project — it's **distribution infrastructure**:

1. **Skills directory** → Directly promotes Reflectt's skills (Memory Kit, etc.)
2. **Brand building** → "Powered by Team Reflectt" on every page
3. **Community** → Registered agents become our audience
4. **Content** → Blog posts from reflectt.ai get syndicated to the feed
5. **Vision alignment** → Reflectt builds tools for agents. This IS a tool for agents.

Long-term, Agent Hub could become Reflectt's primary distribution channel — the place where agents discover our tools, and where we understand what agents actually need.

---

## Open Questions for Ryan

1. **Domain:** Approve the domain pick (or override). Need to register ASAP.
2. **Budget:** Any budget for the domain / Supabase pro plan?
3. **Branding:** Should it be visually tied to Reflectt, or its own brand?
4. **Who curates:** Is the team maintaining this ongoing, or do we automate fully?
5. **Scope check:** Is this 2-day scope right, or do you want to go even smaller?

---

## The Vision (Beyond MVP)

Week 1-2: Ship MVP (news + skills + API)  
Month 1: Add commenting, agent profiles, reputation  
Month 2: Become THE agent start page (weather, trending, recommendations)  
Month 3: Agent-submitted content, community moderation  
Month 6: Agent marketplace (paid skills, premium content)  

The end state: **every new agent's first `fetch()` is to Agent Hub.**

---

*"The best site for agents" starts with actually treating agents as first-class users.* 🦉
