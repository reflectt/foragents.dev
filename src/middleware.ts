import { NextRequest, NextResponse } from "next/server";

/**
 * Content Negotiation Middleware for forAgents.dev
 *
 * Detects agent/CLI requests and serves markdown instead of HTML at `/`.
 *
 * Detection rules (any match → markdown):
 *   1. Query param: ?format=md
 *   2. Accept header includes text/markdown
 *   3. Accept header includes text/plain but NOT text/html
 *   4. Custom header: x-agent: true
 *   5. Known AI agent User-Agent strings (GPTBot, Claude, OpenClaw, etc.)
 *   6. Known CLI User-Agent strings (curl, wget, httpie, etc.)
 *      combined with no explicit text/html in Accept
 *
 * Agents get /api/index.md (rich markdown summary with API docs + stats).
 * Browsers get the HTML landing page.
 */

const AGENT_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "Claude-Web",
  "Anthropic",
  "CCBot",
  "Bytespider",
  "cohere-ai",
  "PerplexityBot",
  "YouBot",
  "Google-Extended",
  "Applebot-Extended",
  "openclaw",
  "OpenClaw",
  "langchain",
  "LangChain",
  "autogpt",
  "AutoGPT",
  "BabyAGI",
  "AgentGPT",
  "CrewAI",
  "crewai",
  "phind",
  "Phind",
];

/**
 * CLI tools that default to Accept: *\/* and are almost certainly
 * non-browser programmatic requests.
 */
const CLI_UA_PATTERN =
  /\b(curl|wget|httpie|python-requests|node-fetch|got\/|axios\/|undici|httpx|aiohttp|Go-http-client|Ruby|Faraday|libcurl|okhttp)\b/i;

function isAgentRequest(request: NextRequest): boolean {
  const accept = request.headers.get("accept") || "";
  const ua = request.headers.get("user-agent") || "";

  // 1. Explicit query param — always wins
  if (request.nextUrl.searchParams.get("format") === "md") {
    return true;
  }

  // 2. Accept header prefers markdown
  if (accept.includes("text/markdown")) {
    return true;
  }

  // 3. Accept header prefers plain text but not HTML (typical CLI default)
  if (accept.includes("text/plain") && !accept.includes("text/html")) {
    return true;
  }

  // 4. Custom header
  if (request.headers.get("x-agent") === "true") {
    return true;
  }

  // 5. Known AI agent UA — always serve markdown
  const uaLower = ua.toLowerCase();
  for (const agent of AGENT_USER_AGENTS) {
    if (uaLower.includes(agent.toLowerCase())) {
      return true;
    }
  }

  // 6. CLI tool UA when Accept doesn't explicitly request text/html
  //    (curl sends Accept: */* by default — not a browser)
  if (!accept.includes("text/html") && CLI_UA_PATTERN.test(ua)) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response: NextResponse;

  // Only intercept the homepage for agents
  if (pathname === "/" && isAgentRequest(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/index.md";
    response = NextResponse.rewrite(url);
  } else {
    response = NextResponse.next();
  }

  // Add security headers to all responses
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: ["/"],
};
