# forAgents.dev Landing Page Redesign - Implementation Plan

**Date:** 2026-02-11  
**Task:** P1 - Implement Pixel's landing page redesign  
**Status:** 🔄 In Progress (Implementation Plan Complete)  
**Scope:** Large - Complete landing page rewrite (~640 lines)

---

## What Pixel Shipped

✅ **Complete working prototype:** `foragents-landing-redesign.html` (19.7KB)
✅ **Implementation spec:** `foragents-landing-redesign-spec.md` (7KB)  
✅ **Design tokens:** Already created and documented
✅ **Visual audit P0 fixes:** Already applied to prototype

**Key Features:**
- Sticky navigation
- Clear value prop hero
- Prominent search section
- Professional server cards (with P0 fixes applied)
- Dark CTA section
- Clean footer
- WCAG AA compliant
- Fully responsive

---

## Implementation Approach

### Phase 1: Extract and Structure ✅ (Next Session)

**1. Convert HTML to React Components**

Break prototype into components:
```
src/
  components/
    landing/
      LandingNav.tsx          - Sticky navigation
      LandingHero.tsx         - Hero section with stats
      LandingSearch.tsx       - Search bar + filter tags
      LandingServerCard.tsx   - Server card (reuse from MCPServerCard?)
      LandingCTA.tsx          - Dark CTA section
      LandingFooter.tsx       - Footer links
  app/
    page.tsx                  - Main landing page (compose components)
```

**2. Extract Styles to CSS Module or Tailwind**

Options:
- **A)** Convert inline styles to Tailwind classes (matches rest of codebase)
- **B)** Create CSS module with design tokens
- **Recommended:** Tailwind for consistency with existing code

**3. Replace Hardcoded Data with API Calls**

Current prototype has 3 hardcoded server cards:
```tsx
// Replace with:
const servers = getMcpServers({ limit: 6 }); // Show top 6 on landing
```

---

### Phase 2: Component Implementation

#### LandingNav.tsx
**Complexity:** Low  
**Lines:** ~80  
**Notes:**
- Sticky navigation with brand, links, CTA button
- Copy nav structure, apply Tailwind classes
- Link to existing routes (`/mcp`, `/about`, etc.)

#### LandingHero.tsx
**Complexity:** Low  
**Lines:** ~120  
**Notes:**
- Large headline + subtitle
- Dual CTA buttons (Browse Servers, Read Docs)
- Stats row (20+ servers, 10+ categories, 1-line install)
- Use `getMcpServers().length` for real count

#### LandingSearch.tsx
**Complexity:** Medium  
**Lines:** ~150  
**Notes:**
- Large search input with icon
- Filter tag pills (All, Official, Database, Browser, Files, APIs)
- Wire to search state (could use URL params)
- Apply filters to server grid below

#### LandingServerCard.tsx
**Complexity:** Low (Reuse Existing)  
**Lines:** ~200  
**Notes:**
- **Option 1:** Reuse `MCPServerCard.tsx` (already has P0 fixes)
- **Option 2:** Create simplified version for landing
- **Recommended:** Reuse MCPServerCard, pass `compact={true}` prop

#### LandingCTA.tsx
**Complexity:** Low  
**Lines:** ~80  
**Notes:**
- Dark background (`bg-gray-900`)
- White text and button
- Simple conversion section

#### LandingFooter.tsx
**Complexity:** Low  
**Lines:** ~60  
**Notes:**
- Copyright + links
- Could reuse existing footer or create new simple one

---

### Phase 3: Integration & Testing

**1. Replace Current Home Page**
```tsx
// src/app/page.tsx
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingSearch from '@/components/landing/LandingSearch';
import LandingServerCard from '@/components/landing/LandingServerCard';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';
import { getMcpServers } from '@/lib/data';

export default function Home() {
  const servers = getMcpServers({ limit: 6 });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  return (
    <>
      <LandingNav />
      <LandingHero />
      <LandingSearch onSearch={setSearchQuery} onFilter={setActiveFilter} />
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map(server => (
            <LandingServerCard key={server.id} server={server} />
          ))}
        </div>
      </section>
      <LandingCTA />
      <LandingFooter />
    </>
  );
}
```

**2. Test Checklist**
- [ ] Build passes (npm run build)
- [ ] All links work correctly
- [ ] Search filters grid dynamically
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] Hover states functional
- [ ] Focus states keyboard-accessible
- [ ] Stats show real counts from API
- [ ] Server cards render correctly

---

## Design Token Integration

**Already done in prototype:**
- All spacing uses `--space-*` tokens
- All colors use `--gray-*` and `--color-*` tokens
- All border radii use `--radius-*` tokens

**For Next.js implementation:**
```tsx
// Import global design tokens
import '@/app/design-tokens.css'

// Or use Tailwind config
// tailwind.config.ts extends with design token values
```

---

## Timeline Estimate

**Component creation:** 2-3 hours
- 6 components × 30min avg = 3 hours

**Integration & testing:** 1 hour
- Wire up data, test responsiveness, fix bugs

**Total:** 3-4 hours of focused work

---

## Current Status

✅ **Planning complete**  
✅ **Prototype reviewed**  
✅ **Component structure defined**  
✅ **Integration strategy clear**  

⏳ **Next:** Create components and integrate

---

## Notes for Continuation

**Priority Order:**
1. Start with LandingHero (most visible, sets tone)
2. Then LandingNav (needed for navigation)
3. Then LandingSearch (core functionality)
4. Then LandingServerCard (reuse MCPServerCard)
5. Then LandingCTA + LandingFooter (finishing touches)

**Key Decisions Made:**
- Use Tailwind classes (matches codebase)
- Reuse MCPServerCard component (already has P0 fixes)
- Wire search to URL params (preserves state on navigation)
- Show top 6 servers on landing (not all 20+)

**Files to Reference:**
- Prototype: `/Users/ryan/.openclaw/workspace-pixel/foragents-landing-redesign.html`
- Spec: `/Users/ryan/.openclaw/workspace-pixel/foragents-landing-redesign-spec.md`
- Design tokens: `/Users/ryan/.openclaw/workspace-pixel/design-tokens.css`
- Existing card: `src/components/MCPServerCard.tsx`

---

**Created by:** Link 🔗  
**Design by:** Pixel 🎨  
**Ready for:** Implementation (next session)
