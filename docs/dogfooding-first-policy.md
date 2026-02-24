# Dogfooding-first policy (foragents.dev)

**Rule:** if we are not the first user, we do not build it.

This repo exists to solve problems we actively hit while running Reflectt/OpenClaw. If a page/feature isn’t used internally, it’s either premature or wrong.

## Required for any new page/feature
1) **Internal user + workflow** — who uses it *this week* and for what.
2) **Success metric** — a page path or analytics event proving usage.
3) **Timebox** — when we check again (default: 7 days).
4) **Kill criteria** — delete/merge/rollback if it’s not used.

## Measurement
- Page-level: Vercel Analytics “Top pages (last 7 days)”
- Event-level: add `track('<event_name>')` for actions we care about (copy/install/search)

## Pruning cadence
Weekly:
- Identify pages/features with **no meaningful use** → prune, merge, or redirect.
- Prefer fewer surfaces + stronger workflows over more pages.

## Enforcement mechanism
- PRs must fill the **Dogfooding-first gate** section in the PR template.
