import { promises as fs } from "fs";
import path from "path";

export type EventType = "workshop" | "meetup" | "hackathon";

export type CommunityEvent = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  url?: string;
  location?: string;
  createdAt: string;
};

type RawEvent = Partial<CommunityEvent> & Record<string, unknown>;

const EVENTS_PATH = path.join(process.cwd(), "data", "events.json");

export function getEventsPath() {
  return EVENTS_PATH;
}

export function isEventType(value: unknown): value is EventType {
  return value === "workshop" || value === "meetup" || value === "hackathon";
}

function normalizeEvent(raw: RawEvent): CommunityEvent | null {
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  const type = raw.type;
  const date = typeof raw.date === "string" ? raw.date : "";
  const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : "";

  if (!id || !title || !description || !isEventType(type)) return null;
  if (!date || Number.isNaN(Date.parse(date))) return null;

  const normalized: CommunityEvent = {
    id,
    title,
    description,
    type,
    date: new Date(date).toISOString(),
    createdAt: createdAt && !Number.isNaN(Date.parse(createdAt)) ? new Date(createdAt).toISOString() : new Date(0).toISOString(),
  };

  if (typeof raw.url === "string" && raw.url.trim()) {
    normalized.url = raw.url.trim();
  }

  if (typeof raw.location === "string" && raw.location.trim()) {
    normalized.location = raw.location.trim();
  }

  return normalized;
}

export async function readEventsFile(): Promise<CommunityEvent[]> {
  try {
    const raw = await fs.readFile(EVENTS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((row) => normalizeEvent((row ?? {}) as RawEvent))
      .filter((row): row is CommunityEvent => Boolean(row));
  } catch {
    return [];
  }
}

export async function writeEventsFile(events: CommunityEvent[]) {
  const dir = path.dirname(EVENTS_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tmp = `${EVENTS_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(events, null, 2), "utf-8");
  await fs.rename(tmp, EVENTS_PATH);
}

export function sortEventsByDate(events: CommunityEvent[]) {
  return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function makeEventId() {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
