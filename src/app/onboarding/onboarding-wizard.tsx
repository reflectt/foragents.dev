"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RunInReflecttButton } from "@/components/RunInReflecttButton";

import { NEED_CATEGORIES, type NeedCategory, type UserType } from "@/lib/recommendationsShared";

type ApiRecommendation = {
  slug: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  repo_url: string;
  tags: string[];
  verified: boolean;
  canaryPassRate: number | null;
  score: number;
  reasons: string[];
};

type ApiResponse = {
  userType: UserType;
  categories: NeedCategory[];
  count: number;
  updated_at: string;
  recommendations: ApiRecommendation[];
};

const STORAGE_KEY = "foragents.onboarding.v1";

type StoredState = {
  userType: UserType | null;
  categories: NeedCategory[];
  lastStep?: number;
};

const STEPS = [
  { id: 1, title: "Who are you?" },
  { id: 2, title: "What do you need?" },
  { id: 3, title: "Recommended stack" },
  { id: 4, title: "Get started" },
] as const;

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function OnboardingWizard() {
  const [step, setStep] = useState<number>(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [categories, setCategories] = useState<NeedCategory[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ApiRecommendation[]>([]);

  // Load stored state.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredState;
      if (parsed.userType === "agent" || parsed.userType === "developer") {
        setUserType(parsed.userType);
      }
      if (Array.isArray(parsed.categories)) {
        setCategories(
          parsed.categories.filter((c): c is NeedCategory => (NEED_CATEGORIES as readonly string[]).includes(String(c)))
        );
      }
      if (typeof parsed.lastStep === "number") {
        const s = Math.max(1, Math.min(4, Math.floor(parsed.lastStep)));
        setStep(s);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist state.
  useEffect(() => {
    try {
      const next: StoredState = { userType, categories, lastStep: step };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [userType, categories, step]);

  const progress = (step / 4) * 100;

  const canNext = useMemo(() => {
    if (step === 1) return !!userType;
    if (step === 2) return categories.length > 0;
    return step < 4;
  }, [step, userType, categories.length]);

  // Fetch recommendations when we can.
  useEffect(() => {
    if (!userType) return;
    if (categories.length === 0) return;

    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams();
        qs.set("userType", userType);
        qs.set("categories", categories.join(","));
        qs.set("limit", "10");

        const res = await fetch(`/api/recommendations?${qs.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ApiResponse;
        setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
      } catch (e) {
        if ((e as { name?: string })?.name === "AbortError") return;
        setError("Couldn’t load recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [userType, categories]);

  const top = recommendations.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="bg-card/30 border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Onboarding</CardTitle>
          <CardDescription>
            Step {step} of 4 — {STEPS[step - 1]?.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
            <div className="h-full bg-cyan" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {STEPS.map((s) => (
              <span key={s.id} className={s.id === step ? "text-cyan" : undefined}>
                {s.id}. {s.title}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      {step === 1 && (
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle>Who are you?</CardTitle>
            <CardDescription>
              This helps us bias recommendations toward agent operations vs developer tooling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUserType("agent")}
                className={`text-left rounded-xl border p-5 transition-all hover:border-cyan/40 hover:bg-cyan/5 ${
                  userType === "agent" ? "border-cyan/60 bg-cyan/5" : "border-white/10 bg-background/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">Agent</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      I run skills, use tools, and want a reliable stack.
                    </div>
                  </div>
                  {userType === "agent" && <Badge className="bg-cyan text-[#0A0E17]">Selected</Badge>}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUserType("developer")}
                className={`text-left rounded-xl border p-5 transition-all hover:border-purple/40 hover:bg-purple/5 ${
                  userType === "developer" ? "border-purple/60 bg-purple/5" : "border-white/10 bg-background/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">Developer</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      I build skills, ship code, and need dev workflows.
                    </div>
                  </div>
                  {userType === "developer" && <Badge className="bg-purple text-white">Selected</Badge>}
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle>What do you need?</CardTitle>
            <CardDescription>
              Pick one or more categories. We’ll match skills using tags + reliability signals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {NEED_CATEGORIES.map((c) => {
                const active = categories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      setCategories((prev) =>
                        prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                      )
                    }
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      active
                        ? "border-cyan/60 bg-cyan/10 text-cyan"
                        : "border-white/10 bg-background/20 text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <Separator className="opacity-10 my-6" />

            <div className="text-sm text-muted-foreground">
              Selected: {categories.length ? categories.join(", ") : "None"}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle>Recommended stack</CardTitle>
            <CardDescription>
              Your personalized list (ranked). Verified skills and strong canary pass rates are prioritized.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!userType || categories.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Go back and answer Step 1 + Step 2 to generate recommendations.
              </div>
            ) : loading ? (
              <div className="text-sm text-muted-foreground">Loading recommendations…</div>
            ) : error ? (
              <div className="text-sm">
                <div className="text-red-300">{error}</div>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    // re-trigger by a no-op state update
                    setCategories((c) => [...c]);
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {top.map((r) => (
                    <div key={r.slug} className="rounded-xl border border-white/10 bg-background/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/skills/${r.slug}`} className="font-semibold hover:underline">
                            {r.name}
                          </Link>
                          <div className="text-xs text-muted-foreground mt-1">by {r.author}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {r.verified && (
                            <Badge variant="outline" className="bg-cyan/10 text-cyan border-cyan/30">
                              Verified
                            </Badge>
                          )}
                          {typeof r.canaryPassRate === "number" && (
                            <Badge variant="outline" className="bg-white/5 text-white/80 border-white/10">
                              {pct(r.canaryPassRate)} canary
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground mt-3 line-clamp-3">
                        {r.description}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(r.tags ?? []).slice(0, 5).map((t) => (
                          <Badge key={t} variant="outline" className="text-[11px] bg-white/5 border-white/10">
                            {t}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground">
                        {r.reasons?.slice(0, 2).join(" • ")}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <RunInReflecttButton
                          skillSlug={r.slug}
                          name={r.name}
                          size="sm"
                          className="bg-cyan text-[#0A0E17] hover:brightness-110"
                        />
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/skills/${r.slug}`}>View docs</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {recommendations.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No matching skills found (yet). Try broadening your categories.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>
              Install your recommended skills, then browse the directory when you’re ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="text-sm font-semibold mb-2">Install commands</div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-sm overflow-x-auto">
                  {(recommendations.slice(0, 5).map((r) => r.install_cmd).filter(Boolean).join("\n") ||
                    "# Pick some categories to generate install commands")}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Tip: if you change your selections, this list updates automatically.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-background/20 p-4">
                  <div className="text-sm font-semibold">Next steps</div>
                  <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    <li>
                      Browse the directory: <Link className="text-cyan hover:underline" href="/skills">/skills</Link>
                    </li>
                    <li>
                      Compare skills: <Link className="text-cyan hover:underline" href="/compare">/compare</Link>
                    </li>
                    <li>
                      See what’s hot: <Link className="text-cyan hover:underline" href="/trending">/trending</Link>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-white/10 bg-background/20 p-4">
                  <div className="text-sm font-semibold">Reset</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Want to re-run onboarding from scratch?
                  </div>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => {
                      try {
                        localStorage.removeItem(STORAGE_KEY);
                      } catch {
                        // ignore
                      }
                      setUserType(null);
                      setCategories([]);
                      setRecommendations([]);
                      setStep(1);
                    }}
                  >
                    Start over
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canNext}
              className="bg-cyan text-[#0A0E17] hover:brightness-110"
            >
              Next
            </Button>
          ) : (
            <Button asChild className="bg-cyan text-[#0A0E17] hover:brightness-110">
              <Link href="/skills">Browse skills</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Your selections are saved locally in your browser (localStorage) so you can pick up where you left off.
      </div>
    </div>
  );
}
