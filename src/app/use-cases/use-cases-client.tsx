/* eslint-disable react/no-unescaped-entities */
"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Industry =
  | "all"
  | "devops"
  | "customer-support"
  | "data-analysis"
  | "content-creation"
  | "security"
  | "automation";

type Difficulty = "beginner" | "intermediate" | "advanced";

type UseCaseEntry = {
  id: string;
  title: string;
  description: string;
  industry: Exclude<Industry, "all">;
  difficulty: Difficulty;
  skills: string[];
  tags: string[];
  updatedAt: string;
};

type UseCasesResponse = {
  useCases: UseCaseEntry[];
  total: number;
};

const INDUSTRY_OPTIONS: Array<{ value: Industry; label: string }> = [
  { value: "all", label: "All industries" },
  { value: "devops", label: "DevOps" },
  { value: "customer-support", label: "Customer Support" },
  { value: "data-analysis", label: "Data Analysis" },
  { value: "content-creation", label: "Content Creation" },
  { value: "security", label: "Security" },
  { value: "automation", label: "Automation" },
];

const DIFFICULTY_OPTIONS: Array<{ value: Difficulty; label: string }> = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function UseCasesClient() {
  const [useCases, setUseCases] = useState<UseCaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [industry, setIndustry] = useState<Industry>("all");
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitIndustry, setSubmitIndustry] = useState<Exclude<Industry, "all">>("devops");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [skillsInput, setSkillsInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const fetchUseCases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (industry !== "all") params.set("industry", industry);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/use-cases?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Unable to load use cases (${response.status})`);
      }

      const data = (await response.json()) as UseCasesResponse;
      setUseCases(data.useCases);
    } catch {
      setError("Couldn't load use cases right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [industry, search]);

  useEffect(() => {
    void fetchUseCases();
  }, [fetchUseCases]);

  const industriesRepresented = useMemo(
    () => new Set(useCases.map((useCase) => useCase.industry)).size,
    [useCases]
  );

  const difficultiesRepresented = useMemo(
    () => new Set(useCases.map((useCase) => useCase.difficulty)).size,
    [useCases]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage(null);

    const skills = skillsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    if (skills.length === 0) {
      setSubmitMessage("Please include at least one skill.");
      return;
    }

    if (tags.length === 0) {
      setSubmitMessage("Please include at least one tag.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/use-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          industry: submitIndustry,
          difficulty,
          skills,
          tags,
        }),
      });

      const data = (await response.json()) as
        | { useCase?: UseCaseEntry; error?: string; details?: string[] }
        | undefined;

      if (!response.ok || !data?.useCase) {
        const details = data?.details?.join("; ");
        throw new Error(details || data?.error || "Failed to submit use case");
      }

      setTitle("");
      setDescription("");
      setSubmitIndustry("devops");
      setDifficulty("beginner");
      setSkillsInput("");
      setTagsInput("");
      setSubmitMessage("Use case submitted. Thanks for sharing!");
      setError(null);

      const searchable = [
        data.useCase.title,
        data.useCase.description,
        data.useCase.skills.join(" "),
        data.useCase.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const shouldAdd =
        (industry === "all" || data.useCase.industry === industry) &&
        (!search.trim() || searchable.includes(search.trim().toLowerCase()));

      if (shouldAdd) {
        setUseCases((current) => [data.useCase as UseCaseEntry, ...current]);
      }
    } catch (err) {
      setSubmitMessage((err as Error).message || "Failed to submit use case");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-10">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Use Cases from Real Teams</h1>
        <p className="text-slate-300 max-w-3xl mx-auto">
          Discover how teams use agent workflows in production. Filter by industry, search by
          skills and tags, and submit your own case study.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3 bg-slate-900/25 border border-white/10 rounded-2xl p-5">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">Industry</p>
          <select
            value={industry}
            onChange={(event) => setIndustry(event.target.value as Industry)}
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2"
          >
            {INDUSTRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Search</p>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, description, skills, tags, or difficulty"
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2"
          />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-900/25 p-5 text-center">
          <p className="text-sm text-slate-400">Visible use cases</p>
          <p className="text-3xl font-bold text-[#06D6A0] mt-1">{useCases.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/25 p-5 text-center">
          <p className="text-sm text-slate-400">Industries represented</p>
          <p className="text-3xl font-bold text-[#06D6A0] mt-1">{industriesRepresented}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/25 p-5 text-center">
          <p className="text-sm text-slate-400">Difficulties represented</p>
          <p className="text-3xl font-bold text-[#06D6A0] mt-1">{difficultiesRepresented}</p>
        </div>
      </section>

      <section>
        {loading && (
          <div className="rounded-xl border border-white/10 bg-slate-900/20 p-6 text-slate-300">
            Loading use cases...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && useCases.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-slate-900/20 p-6 text-slate-300">
            No use cases match this filter yet.
          </div>
        )}

        {!loading && !error && useCases.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {useCases.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-white/10 bg-slate-900/30 p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold text-[#F8FAFC]">{entry.title}</h2>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded-full border border-[#06D6A0]/30 bg-[#06D6A0]/10 text-[#06D6A0]">
                      {entry.industry}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full border border-white/20 bg-white/5 text-slate-200">
                      {entry.difficulty}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{entry.description}</p>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.skills.map((skill) => (
                      <span
                        key={`${entry.id}-${skill}`}
                        className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={`${entry.id}-${tag}`}
                        className="text-xs px-2 py-1 rounded-md border border-[#06D6A0]/30 bg-[#06D6A0]/10 text-[#06D6A0]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-sm text-slate-400">
                  Updated {new Date(entry.updatedAt).toLocaleDateString()}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/30 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Share Your Use Case</h2>
        <p className="text-slate-400 mb-6">
          Submit your case study with clear skills and tags so others can discover it.
        </p>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="Title"
            className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            rows={4}
            placeholder="Description"
            className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10 resize-none"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={submitIndustry}
              onChange={(event) => setSubmitIndustry(event.target.value as Exclude<Industry, "all">)}
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10"
            >
              {INDUSTRY_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as Difficulty)}
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10"
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <input
            value={skillsInput}
            onChange={(event) => setSkillsInput(event.target.value)}
            required
            placeholder="Skills (comma separated): monitoring, incident-response, ci-cd"
            className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10"
          />

          <input
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            required
            placeholder="Tags (comma separated): reliability, automation"
            className="w-full px-4 py-3 rounded-lg bg-[#0a0a0a] border border-white/10"
          />

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Submit Use Case"}
            </button>

            {submitMessage && <p className="text-sm text-slate-300">{submitMessage}</p>}
          </div>
        </form>
      </section>
    </div>
  );
}
