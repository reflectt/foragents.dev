"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type EventType = "workshop" | "meetup" | "hackathon";

type CommunityEvent = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  url?: string;
  location?: string;
  createdAt: string;
};

type EventsResponse = {
  events: CommunityEvent[];
  total: number;
};

type Notice = { type: "success" | "error"; message: string };

const TYPE_OPTIONS: Array<EventType | "all"> = ["all", "workshop", "meetup", "hackathon"];

const typeStyles: Record<EventType, string> = {
  workshop: "bg-purple/10 text-purple border-purple/20",
  meetup: "bg-green/10 text-green border-green/20",
  hackathon: "bg-orange/10 text-orange border-orange/20",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function EventsClient() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("workshop");
  const [date, setDate] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }
      if (upcomingOnly) {
        params.set("upcoming", "true");
      }

      const query = params.toString();
      const res = await fetch(`/api/events${query ? `?${query}` : ""}`, { cache: "no-store" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Failed to load events (${res.status})`);
      }

      const data = (await res.json()) as EventsResponse;
      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load events";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, upcomingOnly]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );

  async function submitEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const eventDate = new Date(date);
      if (Number.isNaN(eventDate.getTime())) {
        throw new Error("Please provide a valid date and time.");
      }

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          date: eventDate.toISOString(),
          ...(url.trim() ? { url: url.trim() } : {}),
          ...(location.trim() ? { location: location.trim() } : {}),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; details?: string[] };
        const details = Array.isArray(body.details) ? body.details.join(" • ") : "";
        throw new Error(
          body.error
            ? `${body.error}${details ? `: ${details}` : ""}`
            : `Submit failed (${res.status})`
        );
      }

      setNotice({ type: "success", message: "Event submitted successfully." });
      setTitle("");
      setDescription("");
      setType("workshop");
      setDate("");
      setUrl("");
      setLocation("");

      await loadEvents();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to submit event";
      setError(message);
      setNotice({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  }

  const noticeClass =
    notice?.type === "success"
      ? "text-emerald-300 border-emerald-500/20 bg-emerald-500/5"
      : "text-red-400 border-red-500/20 bg-red-500/5";

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-cyan/5 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[520px] max-h-[520px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-14 md:py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            Events & Community
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse upcoming community events and submit your own workshop,
            meetup, or hackathon.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setTypeFilter(option)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    typeFilter === option
                      ? "bg-cyan/10 text-cyan border-cyan/30"
                      : "bg-card/40 text-muted-foreground border-white/10 hover:bg-card/60"
                  }`}
                >
                  {option === "all" ? "All" : toTitleCase(option)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="upcoming-toggle"
                checked={upcomingOnly}
                onCheckedChange={setUpcomingOnly}
              />
              <Label htmlFor="upcoming-toggle" className="text-sm text-muted-foreground">
                Upcoming only
              </Label>
            </div>
          </div>

          <Separator className="opacity-10 mb-6" />

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading events…</div>
          ) : error ? (
            <div className="text-sm text-red-400">{error}</div>
          ) : sortedEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No events found.</div>
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((event) => (
                <Card
                  key={event.id}
                  className="border-white/10 bg-card/40 hover:bg-card/60 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="text-lg text-[#F8FAFC] mb-1">
                          {event.title}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(event.date)}
                        </div>
                      </div>
                      <Badge className={typeStyles[event.type]}>{toTitleCase(event.type)}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm leading-relaxed text-foreground mb-4">{event.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {event.location ? <span>📍 {event.location}</span> : null}
                      {event.url ? (
                        <Link
                          href={event.url}
                          className="text-cyan hover:text-cyan/80 underline underline-offset-2"
                        >
                          Event link
                        </Link>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl">Submit Event</CardTitle>
              <p className="text-sm text-muted-foreground">
                Share a community event for agent builders.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitEvent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-title">Title</Label>
                  <Input
                    id="event-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Event title"
                    className="bg-background/40 border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What should attendees expect?"
                    className="min-h-[110px] bg-background/40 border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-type">Type</Label>
                  <select
                    id="event-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as EventType)}
                    className="w-full rounded-md border border-white/10 bg-background/40 px-3 py-2 text-sm"
                    required
                  >
                    <option value="workshop">Workshop</option>
                    <option value="meetup">Meetup</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-date">Date & time</Label>
                  <Input
                    id="event-date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-background/40 border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-url">URL (optional)</Label>
                  <Input
                    id="event-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-background/40 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-location">Location (optional)</Label>
                  <Input
                    id="event-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Online or city"
                    className="bg-background/40 border-white/10"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-cyan hover:bg-cyan/90 text-[#0A0E17] font-semibold"
                >
                  {submitting ? "Submitting…" : "Submit Event"}
                </Button>

                {(error || notice) && (
                  <div className={`text-sm border rounded-lg p-3 ${noticeClass}`}>
                    {notice?.message || error}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center h-11 px-5 rounded-lg border border-cyan text-cyan font-mono text-sm hover:bg-cyan/10 transition-colors"
            >
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
