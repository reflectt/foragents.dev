"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { buildGitHubNewIssueUrl, parseGitHubRepo } from "@/lib/reportIssue";

type Props = {
  installCmd?: string | null;
  repoUrl?: string | null;
  issueTitle: string;
  issueBody: string;
  skillSlug?: string;
};

function extractPrimaryInstallCmd(cmd: string | null | undefined): string | null {
  const raw0 = (cmd ?? "").trim();
  if (!raw0) return null;

  // Accept both real newlines and literal "\\n" sequences.
  const raw = raw0.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");

  // Support install_cmd strings that start with one or more comment lines.
  // We copy the first non-empty, non-comment line.
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    return trimmed;
  }

  return null;
}

export function NextBestActionPanel({
  installCmd,
  repoUrl,
  issueTitle,
  issueBody,
  skillSlug,
}: Props) {
  const repo = React.useMemo(() => parseGitHubRepo(repoUrl), [repoUrl]);

  const issueUrl = React.useMemo(() => {
    if (!repo) return null;
    return buildGitHubNewIssueUrl({ repo, title: issueTitle, body: issueBody });
  }, [repo, issueTitle, issueBody]);

  const primaryInstallCmd = extractPrimaryInstallCmd(installCmd);

  const hasInstall = Boolean(primaryInstallCmd);
  const primaryHref = !hasInstall ? repoUrl?.trim() : null;
  const primaryLabel = repo ? "View on GitHub ↗" : "View repository ↗";

  const handleCopySuccess = async () => {
    // Track the install if skillSlug is provided
    if (skillSlug) {
      try {
        await fetch("/api/track/install", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skillSlug }),
        });
      } catch (error) {
        // Silent fail - don&apos;t interrupt user experience
        console.error("Failed to track install:", error);
      }
    }
  };

  const handleCopyError = () => {
    if (primaryInstallCmd) {
      window.prompt("Copy the install command:", primaryInstallCmd);
    }
  };

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm text-[#F8FAFC]">Next best action</CardTitle>
        <CardDescription>
          Do the most useful thing in one click.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          {hasInstall ? (
            <CopyButton
              text={primaryInstallCmd!}
              label="Copy install command"
              variant="default"
              size="sm"
              className="bg-cyan text-black hover:bg-cyan/90"
              showIcon={false}
              onCopySuccess={handleCopySuccess}
              onCopyError={handleCopyError}
            />
          ) : primaryHref ? (
            <Button asChild size="sm" className="bg-cyan text-black hover:bg-cyan/90">
              <a href={primaryHref} target="_blank" rel="noopener noreferrer">
                {primaryLabel}
              </a>
            </Button>
          ) : null}

          {issueUrl ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/5"
            >
              <a href={issueUrl} target="_blank" rel="noopener noreferrer">
                Report issue ↗
              </a>
            </Button>
          ) : repoUrl?.trim() && !hasInstall ? null : repoUrl?.trim() ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/5"
            >
              <a href={repoUrl.trim()} target="_blank" rel="noopener noreferrer">
                View repository ↗
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
