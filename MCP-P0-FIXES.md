# MCP Page P0 Design Fixes

**Date:** 2026-02-11  
**Task:** P1 - Fix 3 P0 design issues from Pixel's audit  
**Audit:** workspace-pixel/audits/foragents-mcp-visual-audit.md  
**Status:** ✅ Complete

## Issues Fixed

### P0 Issue #1: Tag Styling
**Problem:** Tags displayed as inline text without visual separation  
**Solution:** Implemented pill-style tags with proper spacing

**Before:**
```
officialfilesdirectoriesread-write (inline text blob)
```

**After:**
```html
<span class="pill-tag">official</span>
<span class="pill-tag">files</span>
<span class="pill-tag">directories</span>
<span class="pill-tag">read-write</span>
```

**Styling:**
```css
px-3 py-1
text-xs font-medium
bg-slate-100 dark:bg-slate-800
text-slate-700 dark:text-slate-300
rounded-full
gap-2 (between tags)
```

### P0 Issue #2: Card Title Hierarchy
**Problem:** No clear server name - only description shown  
**Solution:** Added structured header with server name + author

**Before:**
```
[emoji] Filesystem Server
"Secure file operations with configurable..."
```

**After:**
```
Filesystem Server
by @modelcontextprotocol
"Secure file operations with configurable..."
```

**Typography Hierarchy:**
- Name: `text-base font-semibold` (16px, 600 weight)
- Author: `text-xs text-gray-500` (12px, muted)
- Description: `text-sm leading-relaxed` (14px, body text)

### P0 Issue #3: Install Command Styling
**Problem:** Light background, poor contrast, no obvious copy affordance  
**Solution:** Dark code block with hover-reveal copy button

**Before:**
```css
background: light gray
color: dark text
no copy button
```

**After:**
```css
background: slate-900 (dark)
color: slate-100 (light text)
border: slate-700
copy button: hover-reveal, shows checkmark on success
```

**Interaction:**
- Copy button hidden by default
- Appears on hover (`opacity-0 group-hover/install:opacity-100`)
- Shows checkmark icon when copied
- Returns to copy icon after 1 second

## Implementation Details

### Files Modified

**1. MCPServerCard.tsx** - Component updates
```typescript
// Added tags to interface
export interface MCPServer {
  // ... existing fields
  tags?: string[];
}

// Updated card structure
- Added title + author header
- Dark code block with proper contrast
- Pill-style tag rendering
- Hover-reveal copy button with success state
```

**2. mcp-adapter.ts** - Data mapping
```typescript
// Pass tags through from source data
return {
  // ... existing fields
  tags: server.tags || [],
};
```

### Visual Changes

**Card Structure:**
```
┌─────────────────────────────────────────────┐
│ Filesystem Server                           │
│ by @modelcontextprotocol             Node.js│
│                                             │
│ Secure file operations with configurable... │
│                                             │
│ ⭐ 2.4k  📦 5.2k/mo  v1.0.0                │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ $ npx @... /path/to/allowed    [📋] │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ [official] [files] [directories] [read...] │
│                                             │
│                          View details →    │
└─────────────────────────────────────────────┘
```

### Design System Alignment

Following Pixel's design-tokens.css:
- **Slate scale** for code backgrounds (`--gray-900` equivalent)
- **Rounded-full** for pill tags (matches design system)
- **Proper hierarchy** with font sizes (base, sm, xs)
- **Hover interactions** using group modifiers

### Accessibility

✅ **Maintained:**
- Semantic HTML (code blocks remain `<code>`)
- ARIA label on copy button
- Keyboard navigable
- Dark mode support for all new elements

✅ **Improved:**
- Better contrast ratios (dark bg + light text)
- Clear visual hierarchy with proper font sizes
- Copy affordance more discoverable on hover

## Testing

```bash
# Build passes
npm run build
# ✅ No TypeScript errors

# Visual check (requires browser)
npm run dev
open http://localhost:3000/mcp
# ✅ Tags render as pills
# ✅ Dark code block visible
# ✅ Copy button appears on hover
# ✅ Server name shows above description
```

## Design System Integration

**Note:** Design-tokens.css copied to project but not yet globally imported. Current implementation uses Tailwind utility classes that match the design system values.

**Future:** Import design-tokens.css globally to use CSS custom properties:
```tsx
// app/layout.tsx
import './design-tokens.css'
```

Then replace Tailwind classes with design tokens:
```css
/* Instead of: bg-slate-900 */
background: var(--gray-900);

/* Instead of: text-xs */
font-size: var(--text-xs);
```

## Before/After Comparison

**Before (emoji-based):**
- Emoji icon
- No server name hierarchy
- Light install command
- Inline tag text

**After (professional):**
- Clear server name + author
- Dark code block with copy button
- Pill-style tags
- Better visual hierarchy

## Performance Impact

**Minimal:**
- No additional network requests
- CSS remains inline (Tailwind utilities)
- Tag rendering is simple div mapping
- Copy button uses CSS opacity transitions (GPU-accelerated)

## Next Steps

**P1 (High Priority):**
1. Import design-tokens.css globally
2. Replace Tailwind classes with CSS variables
3. Add stats formatting (per Pixel's audit P1 #4)
4. Add card hover states (lift + shadow)

**P2 (Medium Priority):**
5. Implement responsive card grid
6. Add color audit (primary blue consistency)
7. Typography weight audit

## Credits

**Design Audit:** Pixel 🎨  
**Implementation:** Link 🔗  
**Task Priority:** Ryan + Kai

---

**Status:** ✅ All 3 P0 issues fixed  
**Build:** Passes ✅  
**Deployment:** Ready for production
