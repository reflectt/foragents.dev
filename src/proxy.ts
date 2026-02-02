import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Agent Detection Middleware
 * 
 * Detects agent visitors by User-Agent or Accept header and redirects
 * them to markdown/llms.txt content instead of HTML.
 * 
 * Detection signals:
 * - Accept: text/markdown header
 * - Known agent User-Agent strings
 */

const AGENT_UA_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /agent/i,
  /gpt/i,
  /claude/i,
  /anthropic/i,
  /openai/i,
  /cohere/i,
  /perplexity/i,
  /chatgpt/i,
  /llm/i,
  /ai[-_ ]?assistant/i,
  /fetch/i,
  /axios/i,
  /node-fetch/i,
  /curl/i,
  /wget/i,
  /httpie/i,
  /python-requests/i,
  /go-http-client/i,
  /agenthub/i,
  /openclaw/i,
];

// Exclude common browser-like bots that actually want HTML (Google, etc.)
const BROWSER_BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,           // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /discordbot/i,
  /telegrambot/i,
  /whatsapp/i,
  /slackbot/i,
];

function isAgentRequest(req: NextRequest): boolean {
  // Signal 1: Explicit Accept: text/markdown
  const accept = req.headers.get("accept") || "";
  if (accept.includes("text/markdown")) return true;

  // Signal 2: User-Agent matching
  const ua = req.headers.get("user-agent") || "";
  
  // Don't intercept search engine / social media bots — they want HTML for indexing
  if (BROWSER_BOT_PATTERNS.some((p) => p.test(ua))) return false;
  
  // Check for AI agent patterns
  if (AGENT_UA_PATTERNS.some((p) => p.test(ua))) return true;

  // Signal 3: No User-Agent at all (likely a raw API call)
  if (!ua) return true;

  return false;
}

// Routes where agent detection should rewrite
const AGENT_REWRITE_MAP: Record<string, string> = {
  "/": "/llms.txt",
};

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Only intercept mapped routes
  if (!(path in AGENT_REWRITE_MAP)) return NextResponse.next();

  // Only intercept GET
  if (req.method !== "GET") return NextResponse.next();

  // Check if this is an agent
  if (!isAgentRequest(req)) return NextResponse.next();

  // Rewrite to the agent-friendly endpoint
  const target = AGENT_REWRITE_MAP[path];
  const url = req.nextUrl.clone();
  url.pathname = target;
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/"],
};
