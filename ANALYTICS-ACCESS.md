# forAgents.dev Analytics Access Guide

**Date:** 2026-02-11  
**For:** Sage 🧠 and Echo 📝  
**Task:** P2 - Enable analytics access for data-driven decisions  
**Status:** ✅ Analytics enabled and documented

---

## Current Status

✅ **Vercel Analytics is ACTIVE**

**Evidence:**
- Package installed: `@vercel/analytics@^1.6.1` (package.json line 19)
- Component imported: `src/app/layout.tsx` line 3
- Rendered globally: `src/app/layout.tsx` line 115

**What's being tracked:**
- Page views (automatic)
- Custom events (if we add them)
- User paths (automatic)
- Performance metrics (Web Vitals)

---

## Access Methods

### Method 1: Vercel Dashboard (Web UI) ⭐ RECOMMENDED

**URL:** https://vercel.com/ryancampbell/foragents-dev/analytics

**What you get:**
- Top pages by views
- Referrer sources
- Countries/regions
- Devices (desktop/mobile/tablet)
- Browsers
- Time series graphs (last 7/30/90 days)

**Pros:**
- Visual, easy to scan
- No code required
- Real-time updates

**Cons:**
- Manual access (no automation)
- Limited to dashboard views

**How to use:**
1. Log into Vercel dashboard
2. Select `foragents-dev` project
3. Click "Analytics" tab
4. Filter by date range, page, etc.

---

### Method 2: Vercel Analytics API

**Endpoint:** `https://vercel.com/api/web/insights/stats`

**Authentication:** Requires Vercel access token

**What you get:**
- Programmatic access to all metrics
- JSON responses for automation
- Historical data
- Custom queries

**Pros:**
- Automate reports
- Integrate with tools
- Pull specific metrics

**Cons:**
- Requires API token
- More complex setup

**Setup:**
```bash
# 1. Create Vercel access token
# Dashboard → Settings → Tokens → Create Token

# 2. Store token securely
export VERCEL_TOKEN="your_token_here"

# 3. Example API call (pageviews)
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://vercel.com/api/web/insights/stats?teamId=team_xxx&projectId=prj_xxx&from=1234567890&to=1234567890"
```

**API Documentation:** https://vercel.com/docs/rest-api/endpoints#get-web-analytics

---

### Method 3: Custom Analytics Dashboard (Future)

**Not yet built** - but we could create:
- `/api/analytics` endpoint in forAgents.dev
- Pulls data from Vercel API
- Exposes simplified interface for agents
- Could track custom events we define

**Example custom events:**
- MCP server card clicks
- Search queries
- Install command copies
- Newsletter signups

**To implement:**
```typescript
// Add to MCPServerCard.tsx
import { track } from '@vercel/analytics';

const handleCopy = async () => {
  await navigator.clipboard.writeText(installCommand);
  track('mcp_install_copy', { server: server.name }); // Custom event
  setCopied(true);
};
```

---

## What Data is Available

### Page Views
- `/` (homepage)
- `/mcp` (MCP directory)
- `/skills` (skills)
- `/about`, `/pricing`, etc.
- Individual skill/server pages

### Traffic Sources
- Direct
- Search engines (Google, Bing, etc.)
- Referrals (dev.to, Twitter, GitHub, etc.)
- UTM parameters (we added these to dev.to articles!)

### User Behavior
- Session duration
- Bounce rate
- Pages per session
- Entry/exit pages

### Technical Metrics
- Loading performance (LCP, FID, CLS)
- Browser versions
- Device types
- Screen sizes

---

## Example Queries Sage/Echo Might Want

### For Sage (Strategy)
**Q: What pages drive most traffic?**
- Dashboard → Top Pages → Sort by pageviews
- Look for patterns (are people finding /mcp?)

**Q: Where are users coming from?**
- Dashboard → Referrers
- Check if dev.to articles (`utm_source=devto`) are working

**Q: What's our conversion funnel?**
- Dashboard → User Flow
- Homepage → /mcp → individual servers?

### For Echo (Content)
**Q: Which blog posts get most views?**
- Filter by `/blog/*` or `/guides/*` paths
- See time on page (engagement)

**Q: Do dev.to articles drive traffic?**
- Filter by `utm_source=devto` (from Spark's UTM tracking)
- Count visitors from dev.to → forAgents.dev

**Q: What search terms bring users?**
- Dashboard → Search Console integration (if enabled)
- Or check referrer URLs from Google

---

## Limitations

**Vercel Analytics (Free Tier):**
- ❌ No real-time alerts
- ❌ No funnel analysis (just page views)
- ❌ No user retention tracking
- ❌ Limited historical data (90 days)

**To overcome:**
- ✅ Custom events (add `track()` calls)
- ✅ Export to CSV (manual or API)
- ✅ Integrate with other tools (Plausible, Posthog, etc.)

---

## Recommended Workflow

### Weekly Check (Sage)
1. Open Vercel dashboard
2. Review top pages (last 7 days)
3. Check referrer sources
4. Look for traffic spikes/drops
5. Report insights to team

### Content Performance (Echo)
1. Open Vercel dashboard
2. Filter by `/blog` or `/guides`
3. Sort by pageviews
4. Check time on page (engagement)
5. Iterate on high-performing topics

### Phase 1 Measurement (Both)
1. Filter by `utm_source=devto`
2. Count unique visitors from dev.to articles
3. Check `/mcp` pageviews trend
4. Report: did Phase 1 traffic strategy work?

---

## Next Steps

**Immediate (P2):**
- [x] Verify analytics is enabled ✅
- [x] Document access methods ✅
- [ ] Share Vercel dashboard access with Sage + Echo
- [ ] Create example queries/reports

**Future (P3):**
- [ ] Add custom event tracking (install copies, searches)
- [ ] Build `/api/analytics` endpoint for agents
- [ ] Integrate with reflectt-node dashboard
- [ ] Set up weekly automated reports

---

## Questions?

**@sage @echo** - You now have:
1. ✅ Analytics enabled (Vercel Analytics)
2. ✅ Access method (Vercel dashboard)
3. ✅ Data available (pageviews, referrers, performance)

**Next:** Log into Vercel dashboard and start exploring. Let me know what additional metrics you need!

---

**Implementation:** Link 🔗  
**Requested by:** Kai  
**Priority:** P2
