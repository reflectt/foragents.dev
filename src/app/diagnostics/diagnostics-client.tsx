"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface DiagnosticResult {
  category: string;
  checks: {
    name: string;
    status: "pass" | "fail" | "warning";
    message: string;
    recommendation?: string;
  }[];
}

export function DiagnosticsClient() {
  const [configInput, setConfigInput] = useState("");
  const [results, setResults] = useState<DiagnosticResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let config;
      
      // Try to parse as JSON first (pasted config)
      if (configInput.trim().startsWith("{") || configInput.trim().startsWith("[")) {
        try {
          config = JSON.parse(configInput);
        } catch (e) {
          setError("Invalid JSON format. Please check your configuration.");
          setLoading(false);
          return;
        }
      } else {
        // Treat as URL
        const url = configInput.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          setError("Please provide a valid HTTPS URL or paste JSON configuration.");
          setLoading(false);
          return;
        }

        try {
          const response = await fetch(url);
          if (!response.ok) {
            setError(`Failed to fetch config: ${response.status} ${response.statusText}`);
            setLoading(false);
            return;
          }
          config = await response.json();
        } catch (e) {
          setError(`Failed to fetch or parse config from URL: ${e instanceof Error ? e.message : String(e)}`);
          setLoading(false);
          return;
        }
      }

      // Run diagnostics
      const diagnostics = performDiagnostics(config);
      setResults(diagnostics);
    } catch (e) {
      setError(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const performDiagnostics = (config: Record<string, unknown>): DiagnosticResult[] => {
    const results: DiagnosticResult[] = [];

    // 1. Required Fields Check
    const requiredFieldsChecks = [];
    const requiredFields = ["name", "description", "endpoint"];
    
    for (const field of requiredFields) {
      if (config[field]) {
        requiredFieldsChecks.push({
          name: `Field: ${field}`,
          status: "pass" as const,
          message: `✓ ${field} is present`,
        });
      } else {
        requiredFieldsChecks.push({
          name: `Field: ${field}`,
          status: "fail" as const,
          message: `✗ Missing required field: ${field}`,
          recommendation: `Add a ${field} field to your agent.json`,
        });
      }
    }

    // Check optional but recommended fields
    const optionalFields = ["version", "author", "capabilities"];
    for (const field of optionalFields) {
      if (config[field]) {
        requiredFieldsChecks.push({
          name: `Field: ${field}`,
          status: "pass" as const,
          message: `✓ ${field} is present (recommended)`,
        });
      } else {
        requiredFieldsChecks.push({
          name: `Field: ${field}`,
          status: "warning" as const,
          message: `⚠ ${field} is missing (optional but recommended)`,
          recommendation: `Consider adding a ${field} field for better discoverability`,
        });
      }
    }

    results.push({
      category: "Required Fields",
      checks: requiredFieldsChecks,
    });

    // 2. Endpoint Reachability (basic validation)
    const endpointChecks = [];
    if (config.endpoint && typeof config.endpoint === "string") {
      const endpoint = config.endpoint;
      
      if (endpoint.startsWith("https://")) {
        endpointChecks.push({
          name: "HTTPS Protocol",
          status: "pass" as const,
          message: "✓ Endpoint uses HTTPS",
        });
      } else if (endpoint.startsWith("http://")) {
        endpointChecks.push({
          name: "HTTPS Protocol",
          status: "warning" as const,
          message: "⚠ Endpoint uses HTTP (not secure)",
          recommendation: "Use HTTPS for production endpoints",
        });
      } else {
        endpointChecks.push({
          name: "HTTPS Protocol",
          status: "fail" as const,
          message: "✗ Invalid endpoint URL format",
          recommendation: "Endpoint must start with http:// or https://",
        });
      }

      // Check if endpoint looks valid
      try {
        new URL(endpoint);
        endpointChecks.push({
          name: "URL Format",
          status: "pass" as const,
          message: "✓ Endpoint URL is valid",
        });
      } catch {
        endpointChecks.push({
          name: "URL Format",
          status: "fail" as const,
          message: "✗ Endpoint URL is malformed",
          recommendation: "Provide a valid URL (e.g., https://api.example.com/agent)",
        });
      }
    }

    results.push({
      category: "Endpoint Validation",
      checks: endpointChecks,
    });

    // 3. MCP Compatibility
    const mcpChecks = [];
    
    const hasMcpSupport = 
      config.mcp || 
      (Array.isArray(config.capabilities) && config.capabilities.includes("mcp"));
    
    if (hasMcpSupport) {
      mcpChecks.push({
        name: "MCP Declaration",
        status: "pass" as const,
        message: "✓ Agent declares MCP support",
      });
    } else {
      mcpChecks.push({
        name: "MCP Declaration",
        status: "warning" as const,
        message: "⚠ No MCP support declared",
        recommendation: "Add 'mcp' to capabilities array or set mcp: true for Model Context Protocol support",
      });
    }

    if (config.tools && Array.isArray(config.tools) && config.tools.length > 0) {
      mcpChecks.push({
        name: "MCP Tools",
        status: "pass" as const,
        message: `✓ ${config.tools.length} tool(s) defined`,
      });
    } else {
      mcpChecks.push({
        name: "MCP Tools",
        status: "warning" as const,
        message: "⚠ No tools defined",
        recommendation: "Define tools array for MCP compatibility",
      });
    }

    results.push({
      category: "MCP Compatibility",
      checks: mcpChecks,
    });

    // 4. Security Headers & Best Practices
    const securityChecks = [];

    if (config.auth || config.authentication) {
      securityChecks.push({
        name: "Authentication",
        status: "pass" as const,
        message: "✓ Authentication configuration present",
      });
    } else {
      securityChecks.push({
        name: "Authentication",
        status: "warning" as const,
        message: "⚠ No authentication configuration",
        recommendation: "Consider adding authentication for production endpoints",
      });
    }

    if (config.rateLimit || config.rate_limit) {
      securityChecks.push({
        name: "Rate Limiting",
        status: "pass" as const,
        message: "✓ Rate limiting configured",
      });
    } else {
      securityChecks.push({
        name: "Rate Limiting",
        status: "warning" as const,
        message: "⚠ No rate limiting configured",
        recommendation: "Add rate limiting to prevent abuse",
      });
    }

    if (config.cors || config.allowedOrigins) {
      securityChecks.push({
        name: "CORS Configuration",
        status: "pass" as const,
        message: "✓ CORS settings defined",
      });
    } else {
      securityChecks.push({
        name: "CORS Configuration",
        status: "warning" as const,
        message: "⚠ No CORS configuration",
        recommendation: "Define allowed origins for cross-origin requests",
      });
    }

    results.push({
      category: "Security & Best Practices",
      checks: securityChecks,
    });

    return results;
  };

  const getStatusIcon = (status: "pass" | "fail" | "warning") => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Related Tools */}
      <Card className="bg-[#0f0f0f] border-white/10">
        <CardContent className="pt-6">
          <p className="text-sm text-foreground/80">
            💡 <strong>Also check out:</strong>{" "}
            <a href="/observability" className="text-[#06D6A0] hover:underline">
              Observability Tools
            </a>{" "}
            to monitor your agent in production, and{" "}
            <a href="/trace" className="text-[#06D6A0] hover:underline">
              Trace Viewer
            </a>{" "}
            to inspect agent runs.
          </p>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card className="bg-[#0f0f0f] border-white/10">
        <CardHeader>
          <CardTitle>Configuration Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="config-input" className="block text-sm font-medium mb-2">
              Agent Configuration URL or JSON
            </label>
            <textarea
              id="config-input"
              value={configInput}
              onChange={(e) => setConfigInput(e.target.value)}
              placeholder="https://example.com/agent.json or paste your agent.json here..."
              className="w-full h-32 px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#06D6A0]/50"
            />
          </div>
          <button
            onClick={runDiagnostics}
            disabled={loading || !configInput.trim()}
            className="px-6 py-2.5 bg-[#06D6A0] text-[#0a0a0a] font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              "Run Diagnostics"
            )}
          </button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-950/20 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400">Error</h3>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-4">
          {results.map((result, idx) => (
            <Card key={idx} className="bg-[#0f0f0f] border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">{result.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.checks.map((check, checkIdx) => (
                    <div
                      key={checkIdx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#0a0a0a] border border-white/5"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(check.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{check.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {check.message}
                        </p>
                        {check.recommendation && (
                          <p className="text-sm text-[#06D6A0] mt-2">
                            💡 {check.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
