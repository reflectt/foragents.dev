"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type SubmissionType = "contact" | "partner" | "contributor" | "kit-request" | "glossary";
type SubmissionStatus = "new" | "reviewed" | "archived";

type Submission = {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  submittedAt: string;
  title: string;
  summary: string;
  submitter: string;
  email?: string;
  sourceFile: string;
  data: Record<string, unknown>;
};

type StatusFilter = SubmissionStatus | "all";
type TypeFilter = SubmissionType | "all";

type ApiResponse = {
  submissions?: Submission[];
  total?: number;
  error?: string;
};

const TYPE_OPTIONS: TypeFilter[] = [
  "all",
  "contact",
  "partner",
  "contributor",
  "kit-request",
  "glossary",
];

const STATUS_OPTIONS: StatusFilter[] = ["all", "new", "reviewed", "archived"];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString();
}

export default function AdminSubmissionsPage() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("foragents_admin_secret");
    if (stored) {
      setSecret(stored);
      setIsAuthenticated(true);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/submissions?${params.toString()}`, {
        cache: "no-store",
      });

      const payload = (await res.json()) as ApiResponse;

      if (!res.ok) {
        throw new Error(payload.error || "Failed to load submissions");
      }

      const nextSubmissions = payload.submissions || [];
      setSubmissions(nextSubmissions);

      setSelectedId((current) => {
        if (!nextSubmissions.length) return null;
        if (current && nextSubmissions.some((item) => item.id === current)) return current;
        return nextSubmissions[0]?.id ?? null;
      });
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
      setSubmissions([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchSubmissions();
    }
  }, [fetchSubmissions, isAuthenticated]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!secret.trim()) return;

    localStorage.setItem("foragents_admin_secret", secret.trim());
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("foragents_admin_secret");
    setSecret("");
    setIsAuthenticated(false);
    setSubmissions([]);
    setSelectedId(null);
    setError(null);
  };

  const updateStatus = async (submission: Submission, status: SubmissionStatus) => {
    setActionLoading(submission.id);
    setError(null);

    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: submission.id,
          type: submission.type,
          status,
        }),
      });

      const payload = (await res.json()) as ApiResponse;
      if (!res.ok) {
        throw new Error(payload.error || "Failed to update submission status");
      }

      await fetchSubmissions();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unknown error");
    } finally {
      setActionLoading(null);
    }
  };

  const selectedSubmission = useMemo(
    () => submissions.find((submission) => submission.id === selectedId) ?? null,
    [selectedId, submissions]
  );

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
        <div className="mx-auto max-w-md">
          <h1 className="mb-6 text-2xl font-bold">🔐 Admin Login</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">Admin Secret</label>
              <input
                type="password"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                placeholder="Enter ADMIN_SECRET"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium transition-colors hover:bg-emerald-700"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-sm text-zinc-500">
            The secret is stored in localStorage for convenience.
          </p>

          <Link href="/" className="mt-4 block text-sm text-emerald-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">📥 Admin Submissions</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Unified review queue for contact forms, partner applications, contributor applications,
              kit requests, and glossary suggestions.
            </p>
          </div>

          <button onClick={handleLogout} className="text-sm text-zinc-400 hover:text-zinc-200">
            Logout
          </button>
        </div>

        <div className="mb-6 grid gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-500">Type</label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wide text-zinc-500">Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-700 bg-red-900/40 p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-zinc-500">
            No submissions found for the selected filters.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
              {submissions.map((submission) => {
                const isSelected = submission.id === selectedSubmission?.id;

                return (
                  <button
                    key={submission.id}
                    onClick={() => setSelectedId(submission.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-900/10"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                        {submission.type}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          submission.status === "new"
                            ? "bg-blue-900/40 text-blue-300"
                            : submission.status === "reviewed"
                              ? "bg-emerald-900/40 text-emerald-300"
                              : "bg-zinc-700 text-zinc-200"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>

                    <h2 className="font-medium text-zinc-100">{submission.title}</h2>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{submission.summary}</p>
                    <p className="mt-2 text-xs text-zinc-500">{formatDate(submission.submittedAt)}</p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              {selectedSubmission ? (
                <>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-100">{selectedSubmission.title}</h2>
                      <p className="mt-1 text-sm text-zinc-400">
                        Submitted by {selectedSubmission.submitter} on {formatDate(selectedSubmission.submittedAt)}
                      </p>
                      {selectedSubmission.email && (
                        <p className="text-sm text-zinc-500">{selectedSubmission.email}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateStatus(selectedSubmission, "reviewed")}
                        disabled={actionLoading === selectedSubmission.id}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {actionLoading === selectedSubmission.id ? "Saving..." : "Mark reviewed"}
                      </button>

                      <button
                        onClick={() => updateStatus(selectedSubmission, "archived")}
                        disabled={actionLoading === selectedSubmission.id}
                        className="rounded-md bg-zinc-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-600 disabled:opacity-60"
                      >
                        {actionLoading === selectedSubmission.id ? "Saving..." : "Archive"}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 rounded-md border border-zinc-800 bg-zinc-950 p-4">
                    <h3 className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Summary</h3>
                    <p className="whitespace-pre-wrap text-sm text-zinc-300">{selectedSubmission.summary}</p>
                  </div>

                  <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
                    <h3 className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Submission details</h3>
                    <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words text-xs text-zinc-300">
                      {JSON.stringify(selectedSubmission.data, null, 2)}
                    </pre>
                  </div>
                </>
              ) : (
                <p className="text-sm text-zinc-400">Select a submission to view details.</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-zinc-800 pt-4">
          <Link href="/" className="text-sm text-emerald-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
