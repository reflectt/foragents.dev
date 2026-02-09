"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export function TemplateDetailClient({ codeSnippets }: { codeSnippets: Record<string, string> }) {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopy = (filename: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-[#F8FAFC] mb-6">💻 Code Snippets</h2>
      
      <div className="space-y-4">
        {Object.entries(codeSnippets).map(([filename, code]) => (
          <div key={filename} className="rounded-lg border border-white/5 bg-card/40 overflow-hidden">
            {/* File Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-card/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-cyan">{filename}</span>
              </div>
              <Button
                onClick={() => handleCopy(filename, code)}
                size="sm"
                variant="ghost"
                className="h-8 gap-2 hover:bg-cyan/10"
              >
                {copiedFile === filename ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </Button>
            </div>
            
            {/* Code Content */}
            <div className="p-4 overflow-x-auto bg-[#0a0a0a]/60">
              <pre className="text-sm text-foreground/90 font-mono">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
