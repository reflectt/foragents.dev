// MCPServerCard.tsx - React component for forAgents.dev
// Production-ready TypeScript component for Next.js

'use client';

import React, { useState } from 'react';

export interface MCPServer {
  name: string;
  description: string;
  stars: number;
  installsPerMonth: number;
  version: string;
  framework: 'nodejs' | 'python' | 'rust';
  installCommand?: string;
  detailsUrl?: string;
  tags?: string[];
}

interface MCPServerCardProps {
  server: MCPServer;
  className?: string;
}

export const MCPServerCard: React.FC<MCPServerCardProps> = ({ 
  server, 
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);
  
  const installCommand = server.installCommand || `npm install ${server.name}`;
  
  const formatStat = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const frameworkStyles = {
    nodejs: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    python: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    rust: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  };

  return (
    <div className={`mcp-card group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg hover:-translate-y-0.5 ${className}`}>
      {/* Header - P0 Fix: Add clear title hierarchy */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {server.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              by @modelcontextprotocol
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium uppercase tracking-wide border rounded-md ${frameworkStyles[server.framework]}`}>
            {server.framework === 'nodejs' ? 'Node.js' : server.framework}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {server.description}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5 py-3 border-b border-gray-100 dark:border-gray-700 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1L10.09 5.26L14.18 5.87L11.09 8.87L11.82 13L8 10.77L4.18 13L4.91 8.87L1.82 5.87L5.91 5.26L8 1Z"/>
          </svg>
          <span className="font-medium text-gray-700 dark:text-gray-300 font-mono">
            {formatStat(server.stars)}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" viewBox="0 0 16 16" fill="none" stroke="currentColor">
            <rect x="2" y="3" width="12" height="10" strokeWidth="1.5"/>
            <path d="M5 6.5h6M5 9.5h4" strokeWidth="1.5"/>
          </svg>
          <span className="font-medium text-gray-700 dark:text-gray-300 font-mono">
            {formatStat(server.installsPerMonth)}/mo
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 ml-auto">
          <span className="text-gray-400 dark:text-gray-500">v</span>
          <span className="font-medium text-gray-700 dark:text-gray-300 font-mono">
            {server.version}
          </span>
        </div>
      </div>

      {/* Install Command - P0 Fix: Dark background + copy button */}
      <div className="relative group/install mb-4">
        <div className="bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 rounded-lg px-4 py-3 pr-12">
          <code className="block text-sm text-slate-100 dark:text-slate-200 font-mono select-all overflow-x-auto">
            {installCommand}
          </code>
        </div>
        <button
          onClick={handleCopy}
          aria-label="Copy install command"
          className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-all duration-150 active:scale-95 opacity-0 group-hover/install:opacity-100"
          style={{ color: copied ? '#10b981' : '#94a3b8' }}
        >
          {copied ? (
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <path d="M3 8l3 3 7-7" strokeWidth="2"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <path d="M4 4V2h8v2M4 4v8h8V4M4 4H2v10h10v-2" strokeWidth="1.5"/>
            </svg>
          )}
        </button>
      </div>

      {/* Tags - P0 Fix: Pill-styled tags */}
      {server.tags && server.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {server.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end">
        <a
          href={server.detailsUrl || '#'}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
        >
          View details →
        </a>
      </div>
    </div>
  );
};

export default MCPServerCard;
