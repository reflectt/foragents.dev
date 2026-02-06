# Security checklist (API write endpoints)

This repo uses lightweight request-limit helpers in `src/lib/requestLimits.ts`.

## ✅ Requirements (every write endpoint)

For any `src/app/api/**/route.ts` that exports **POST/PUT/PATCH/DELETE**:

1. **Body size cap**
   - Use `readJsonWithLimit(req, maxBytes)` or `readTextWithLimit(req, maxBytes)`

2. **Rate limit**
   - Use `checkRateLimit(key, { windowMs, max })` and return a 429 when exceeded

3. **Tests**
   - Add/extend tests to cover both:
     - payload-too-large (413)
     - rate-limited (429)

## Automation

Run:

```bash
npm run audit:security
```

CI will fail if a write endpoint appears to be missing a body cap or rate limit.
