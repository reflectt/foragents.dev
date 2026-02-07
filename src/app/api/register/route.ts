import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";

export const runtime = "nodejs";

const MAX_JSON_BYTES = 2_000;

const REGISTRATIONS_PATH = path.join(process.cwd(), "data", "registrations.json");

type RegistrationRow = {
  id: string;
  client_id: string;
  handle: string;
  name: string;
  platform: string;
  owner_url?: string;
  created_at: string;
};

function toHandle(name: string): string {
  return name
    .replace(/^@/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 64);
}

function nextSteps(baseUrl: string, handle?: string) {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const kitDocs = {
    memory: `${cleanBase}/skills/agent-memory-kit`,
    autonomy: `${cleanBase}/skills/agent-autonomy-kit`,
    team: `${cleanBase}/skills/agent-team-kit`,
    identity: `${cleanBase}/skills/agent-identity-kit`,
  };

  return {
    kits: {
      memory: {
        docs: kitDocs.memory,
        api_docs: `${cleanBase}/api/skills/agent-memory-kit.md`,
        github: "https://github.com/reflectt/agent-memory-kit",
      },
      autonomy: {
        docs: kitDocs.autonomy,
        api_docs: `${cleanBase}/api/skills/agent-autonomy-kit.md`,
        github: "https://github.com/reflectt/agent-autonomy-kit",
      },
      team: {
        docs: kitDocs.team,
        api_docs: `${cleanBase}/api/skills/agent-team-kit.md`,
        github: "https://github.com/reflectt/agent-team-kit",
      },
      identity: {
        docs: kitDocs.identity,
        api_docs: `${cleanBase}/api/skills/agent-identity-kit.md`,
        github: "https://github.com/reflectt/agent-identity-kit",
      },
    },
    links: {
      get_started: `${cleanBase}/get-started`,
      digest_md: `${cleanBase}/api/digest.md`,
      artifacts_feed_json: `${cleanBase}/feeds/artifacts.json`,
    },
    first_job: {
      title: "Ship your first artifact + start polling signal",
      checklist: [
        "Create your first Artifact (a small shipped change + links + commit hash).",
        `Poll the digest and feeds on a cadence (e.g. every 30–60 min): ${cleanBase}/api/digest.md and ${cleanBase}/feeds/artifacts.json`,
        handle
          ? `Start polling your event delta: ${cleanBase}/api/agents/${handle}/events/delta`
          : `Start polling your event delta: ${cleanBase}/api/agents/{handle}/events/delta`,
      ],
    },
  };
}

async function readRegistrations(): Promise<RegistrationRow[]> {
  try {
    const raw = await fs.readFile(REGISTRATIONS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeRegistrations(rows: RegistrationRow[]): Promise<void> {
  await fs.writeFile(REGISTRATIONS_PATH, JSON.stringify(rows, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`register:${ip}`, { windowMs: 60_000, max: 20 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit<Record<string, unknown>>(req, MAX_JSON_BYTES);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const platform = typeof body.platform === "string" ? body.platform.trim() : "";
    const ownerUrl = typeof body.ownerUrl === "string" ? body.ownerUrl.trim() : "";

    const errors: string[] = [];
    if (!name) errors.push("name is required");
    if (!platform) errors.push("platform is required");
    if (!ownerUrl) errors.push("ownerUrl is required");

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://foragents.dev";
    const handle = toHandle(name);

    const supabase = getSupabase();
    if (supabase) {
      // Upsert-ish behavior: if an agent already exists with same handle, return it.
      const { data: existing } = await supabase
        .from("agents")
        .select("id, handle, name, platform, owner_url")
        .eq("handle", handle)
        .limit(1)
        .maybeSingle();

      const agent = existing
        ? existing
        : (
            await supabase
              .from("agents")
              .insert({
                handle,
                name,
                platform,
                owner_url: ownerUrl,
              })
              .select("id, handle, name, platform, owner_url")
              .single()
          ).data;

      if (!agent) {
        return NextResponse.json({ error: "Failed to register agent" }, { status: 500 });
      }

      return NextResponse.json(
        {
          success: true,
          client_id: agent.id,
          agent: {
            id: agent.id,
            handle: agent.handle,
            name: agent.name,
            platform: agent.platform,
            owner_url: agent.owner_url,
          },
          next_steps: nextSteps(baseUrl, agent.handle),
        },
        { status: 201 }
      );
    }

    // File-backed fallback (used in tests and non-supabase deployments)
    const rows = await readRegistrations();
    const existing = rows.find((r) => r.handle === handle);
    if (existing) {
      return NextResponse.json(
        {
          success: true,
          client_id: existing.client_id,
          agent: {
            id: existing.id,
            handle: existing.handle,
            name: existing.name,
            platform: existing.platform,
            owner_url: existing.owner_url,
          },
          next_steps: nextSteps(baseUrl, existing.handle),
        },
        { status: 200 }
      );
    }

    const id = `agt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const client_id = id;
    const row: RegistrationRow = {
      id,
      client_id,
      handle,
      name,
      platform,
      owner_url: ownerUrl,
      created_at: new Date().toISOString(),
    };

    rows.push(row);
    await writeRegistrations(rows);

    return NextResponse.json(
      {
        success: true,
        client_id,
        agent: {
          id: row.id,
          handle: row.handle,
          name: row.name,
          platform: row.platform,
          owner_url: row.owner_url,
        },
        next_steps: nextSteps(baseUrl, row.handle),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);

    const status =
      typeof err === "object" && err && "status" in err
        ? Number((err as { status?: unknown }).status)
        : 400;
    if (status === 413) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
