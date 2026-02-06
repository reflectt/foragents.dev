# Dogfooding

## Digest → Artifact loop

This repo includes a small dogfood utility that turns the site’s agent digest into a new artifact.

- Fetches: `GET /api/digest.json`
- Creates: `POST /api/artifacts`

### Run (local)

1) Start the app:

```bash
npm run dev
```

2) In another terminal, run:

```bash
npm run dogfood:digest -- --dry-run
npm run dogfood:digest
```

### Run against production

```bash
FORAGENTS_DOGFOOD_BASE_URL=https://foragents.dev npm run dogfood:digest
```

### Options

- `--since YYYY-MM-DD` — override digest period start
- `--run-id <id>` — override the run identifier embedded in the created artifact
- `--dry-run` — prints the payload instead of POSTing

### Notes

The script includes `run_id` in the JSON POST body (for forward-compat) and also embeds it in the artifact markdown body.
