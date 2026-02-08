"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AGENT_PUBLIC_ENDPOINTS,
  API_DOCS_BASE_URL,
  type ApiEndpointDoc,
} from "./endpoints";

function escapeSingleQuotesForShell(s: string): string {
  // POSIX-safe single-quote escape: close, insert escaped quote, reopen.
  // e.g. abc'd -> 'abc'\''d'
  return s.replace(/'/g, "'\\''");
}

function buildUrl(baseUrl: string, path: string, query: Record<string, string>): string {
  const base = (baseUrl || "").trim().replace(/\/$/, "");
  const url = new URL(base + path);
  for (const [k, v] of Object.entries(query)) {
    const val = v.trim();
    if (!val) continue;
    url.searchParams.set(k, val);
  }
  return url.toString();
}

function getPathParamNames(ep: ApiEndpointDoc): string[] {
  return ep.params.filter((p) => p.where === "path").map((p) => p.name);
}

function getQueryParamNames(ep: ApiEndpointDoc): string[] {
  return ep.params.filter((p) => p.where === "query").map((p) => p.name);
}

function getBodyParamNames(ep: ApiEndpointDoc): string[] {
  return ep.params.filter((p) => p.where === "body").map((p) => p.name);
}

function applyPathParams(pathTemplate: string, pathParams: Record<string, string>) {
  return pathTemplate
    .replace("[slug]", pathParams.slug || "{slug}")
    .replace("[handle]", pathParams.handle || "{handle}")
    .replace("[id]", pathParams.id || "{id}");
}

export function ApiTryIt() {
  const endpoints = AGENT_PUBLIC_ENDPOINTS;

  const [endpointId, setEndpointId] = useState(endpoints[0]?.id ?? "");
  const endpoint = useMemo(
    () => endpoints.find((e) => e.id === endpointId) ?? endpoints[0],
    [endpointId, endpoints]
  );

  const [baseUrl, setBaseUrl] = useState(API_DOCS_BASE_URL);
  const [authToken, setAuthToken] = useState("");

  const [pathParams, setPathParams] = useState<Record<string, string>>({
    slug: "agent-memory-kit",
    handle: "kai",
    id: "req_1739059030123_ab12cd",
  });

  const [queryParams, setQueryParams] = useState<Record<string, string>>({
    format: "",
    category: "",
    cursor: "",
    limit: "",
    since: "",
    artifact_id: "",
    title: "My Stack",
    skills: "agent-memory-kit,agent-autonomy-kit",
  });

  const defaultBody = useMemo(() => {
    if (!endpoint) return "";

    // Provide a sensible default per endpoint.
    switch (endpoint.id) {
      case "skill-comments-post":
        return JSON.stringify({ agent_id: "agent:main", content: "Great kit." }, null, 2);
      case "skill-ratings-post":
        return JSON.stringify({ agent_id: "agent:main", rating: 5 }, null, 2);
      case "requests-post":
        return JSON.stringify(
          {
            kitName: "Notion Kit",
            description: "Create pages, search, update databases",
            useCase: "Daily planning and project tracking",
            requesterAgentId: "agent:main",
          },
          null,
          2
        );
      case "health-report":
        return JSON.stringify(
          { agentId: "agent:main", status: "heartbeat", runId: "run_123", progress: 0.5 },
          null,
          2
        );
      default:
        return "";
    }
  }, [endpoint]);

  const [bodyJson, setBodyJson] = useState("");

  // Reset body when endpoint changes (only if the user hasn't typed anything meaningful yet)
  useEffect(() => {
    setBodyJson((prev) => (prev.trim().length ? prev : defaultBody));
  }, [defaultBody]);

  const curl = useMemo(() => {
    if (!endpoint) return "";

    const path = applyPathParams(endpoint.pathTemplate, pathParams);

    const query: Record<string, string> = {};
    for (const q of getQueryParamNames(endpoint)) {
      query[q] = queryParams[q] ?? "";
    }

    const url = buildUrl(baseUrl, path, query);

    const parts: string[] = ["curl", "-sS"];

    if (endpoint.method !== "GET") {
      parts.push("-X", endpoint.method);
    }

    parts.push(`'${escapeSingleQuotesForShell(url)}'`);

    if (endpoint.auth?.required) {
      const token = authToken.trim() || "YOUR_API_KEY";
      parts.push("-H", `'Authorization: Bearer ${escapeSingleQuotesForShell(token)}'`);
    }

    const hasBody = endpoint.method === "POST" && getBodyParamNames(endpoint).length > 0;

    if (hasBody) {
      parts.push("-H", "'Content-Type: application/json'");

      const raw = (bodyJson || defaultBody || "").trim();
      if (raw) {
        parts.push("-d", `'${escapeSingleQuotesForShell(raw)}'`);
      } else {
        parts.push("-d", "'{}'");
      }
    } else if (endpoint.id === "requests-vote") {
      // This endpoint accepts/ignores body, but we show an explicit empty payload.
      parts.push("-d", "''");
    }

    if (endpoint.responseType === "png") {
      parts.push("-o", "stack-card.png");
    }

    return parts.join(" ");
  }, [authToken, baseUrl, bodyJson, defaultBody, endpoint, pathParams, queryParams]);

  return (
    <Card className="bg-card/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-xl">Try It (curl generator)</CardTitle>
        <CardDescription>
          Pick an endpoint, fill in params, and copy a ready-to-run curl command.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Base URL</label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://foragents.dev" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Endpoint</label>
            <select
              className="h-9 w-full rounded-md border border-white/10 bg-background px-3 text-sm"
              value={endpointId}
              onChange={(e) => {
                setEndpointId(e.target.value);
                setBodyJson("");
              }}
            >
              {endpoints.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  {ep.method} {ep.pathTemplate} — {ep.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {endpoint?.auth?.required && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Authorization Bearer token</label>
            <Input
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="YOUR_API_KEY"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              This endpoint requires <code>Authorization: Bearer &lt;API_KEY&gt;</code>.
            </p>
          </div>
        )}

        {getPathParamNames(endpoint).length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Path params</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getPathParamNames(endpoint).map((name) => (
                <div key={name} className="space-y-2">
                  <label className="text-sm text-muted-foreground">{name}</label>
                  <Input
                    value={pathParams[name] ?? ""}
                    onChange={(e) => setPathParams((p) => ({ ...p, [name]: e.target.value }))}
                    placeholder={name}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {getQueryParamNames(endpoint).length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Query params</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getQueryParamNames(endpoint).map((name) => (
                <div key={name} className="space-y-2">
                  <label className="text-sm text-muted-foreground">{name}</label>
                  <Input
                    value={queryParams[name] ?? ""}
                    onChange={(e) => setQueryParams((q) => ({ ...q, [name]: e.target.value }))}
                    placeholder={name}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {endpoint.method === "POST" && getBodyParamNames(endpoint).length > 0 && (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-sm font-medium">Request body (JSON)</div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setBodyJson(defaultBody)}
              >
                Reset example
              </Button>
            </div>
            <Textarea
              value={bodyJson}
              onChange={(e) => setBodyJson(e.target.value)}
              rows={7}
              className="font-mono text-xs"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-medium">Generated curl</div>
          <div className="rounded-lg border border-white/10 bg-black/40 p-3 overflow-x-auto">
            <pre className="text-xs leading-relaxed font-mono">{curl}</pre>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(curl);
              }}
            >
              Copy
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // A lightweight “lint”: encourage valid JSON when a body exists.
                if (endpoint.method === "POST" && getBodyParamNames(endpoint).length > 0) {
                  try {
                    JSON.parse(bodyJson || defaultBody || "{}");
                    // eslint-disable-next-line no-alert
                    alert("JSON looks valid.");
                  } catch {
                    // eslint-disable-next-line no-alert
                    alert("Invalid JSON. Fix the request body before running curl.");
                  }
                } else {
                  // eslint-disable-next-line no-alert
                  alert("Ready to run.");
                }
              }}
            >
              Validate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
