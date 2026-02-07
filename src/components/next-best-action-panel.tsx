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
import { buildGitHubNewIssueUrl, parseGitHubRepo } from "@/lib/reportIssue";

type Props = {
  installCmd?: string | null;
  repoUrl?: string | null;
  issueTitle: string;
  issueBody: string;
};

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.top = "-1000px";
      el.style.left = "-1000px";
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

function isUsableInstallCmd(cmd: string | null | undefined): cmd is string {
  const c = (cmd ?? "").trim();
  if (!c) return false;
  if (c.startsWith("#")) return false;
  return true;
}

export function NextBestActionPanel({
  installCmd,
  repoUrl,
  issueTitle,
  issueBody,
}: Props) {
  const repo = React.useMemo(() => parseGitHubRepo(repoUrl), [repoUrl]);

  const issueUrl = React.useMemo(() => {
    if (!repo) return null;
    return buildGitHubNewIssueUrl({ repo, title: issueTitle, body: issueBody });
  }, [repo, issueTitle, issueBody]);

  const hasInstall = isUsableInstallCmd(installCmd);
  const primaryHref = !hasInstall ? repoUrl?.trim() : null;
  const primaryLabel = repo ? "View on GitHub ↗" : "View repository ↗";

  const [copyLabel, setCopyLabel] = React.useState("Copy install command");

  const onCopyInstall = async () => {
    if (!hasInstall) return;
    const ok = await copyToClipboard(installCmd);
    setCopyLabel(ok ? "Copied" : "Copy failed");
    window.setTimeout(() => setCopyLabel("Copy install command"), 1500);
    if (!ok) window.prompt("Copy the install command:", installCmd);
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
            <Button
              type="button"
              size="sm"
              className="bg-cyan text-black hover:bg-cyan/90"
              onClick={onCopyInstall}
              title="Copies the install command to your clipboard"
            >
              {copyLabel}
            </Button>
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
