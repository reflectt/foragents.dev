# SEO Checklist for forAgents.dev

## ✅ Implemented
- [x] `robots.txt` - Allows all crawlers, links to sitemap
- [x] `sitemap.xml` - Dynamic sitemap with all pages (static + agents + news)
- [x] Meta tags (title, description) in layout
- [x] Open Graph tags (og:title, og:description, og:image, og:url)
- [x] Twitter Card tags (summary_large_image)
- [x] JSON-LD structured data (WebSite schema with SearchAction)
- [x] Canonical URLs via `metadataBase`
- [x] RSS feed at `/feed.rss`
- [x] Dynamic OG images via `/api/og`
- [x] `lang="en"` attribute on HTML

## 🔧 Manual Steps Required

### 1. Google Search Console
1. Go to https://search.google.com/search-console
2. Add property: `https://foragents.dev`
3. Choose "URL prefix" verification
4. Verify via:
   - **Recommended:** HTML file upload (add file to `/public/`)
   - Or: DNS TXT record
   - Or: Google Analytics (if you have it)
5. After verification, submit sitemap: `https://foragents.dev/sitemap.xml`

### 2. Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Add site: `https://foragents.dev`
3. Verify (can import from Google Search Console)
4. Submit sitemap

### 3. Social Preview Testing
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### 4. Quick Wins for Indexing
- Share links on social media (Twitter, LinkedIn, Reddit)
- Post in relevant communities (HN, Product Hunt, AI/agent communities)
- Get backlinks from other sites
- Add to directories (Product Hunt, etc.)

## URLs to Submit

Main sitemap: `https://foragents.dev/sitemap.xml`

Key pages to manually request indexing:
- https://foragents.dev
- https://foragents.dev/agents
- https://foragents.dev/mcp
- https://foragents.dev/acp
- https://foragents.dev/llms-txt
- https://foragents.dev/about

## Monitoring
After verification, Google Search Console will show:
- Index coverage (which pages are indexed)
- Search performance (queries, clicks)
- Any crawl errors
