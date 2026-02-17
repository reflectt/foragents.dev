// mcp-adapter.ts - Maps existing MCP server data to new card component format

import type { MCPServer } from '@/components/MCPServerCard';
import type { McpServer } from '@/lib/data';

/**
 * Maps legacy MCP server data format to new card component format.
 * TODO: Replace placeholder stats with real data from GitHub/npm APIs
 */
export function mapToMCPServerCard(server: McpServer): MCPServer {
  // Determine framework from install command or package name
  const framework = detectFramework(server.install_cmd, server.name);
  
  // TODO: Fetch real data from GitHub API and npm/PyPI
  // For now, using placeholder values
  const placeholderStars = Math.floor(Math.random() * 5000) + 100;
  const placeholderInstalls = Math.floor(Math.random() * 10000) + 500;
  
  return {
    name: server.name,
    description: server.description,
    stars: placeholderStars,
    installsPerMonth: placeholderInstalls,
    version: '1.0.0', // TODO: Extract from package.json or API
    framework,
    installCommand: server.install_cmd,
    detailsUrl: `/mcp/${server.slug}`,
    tags: server.tags || [],
  };
}

/**
 * Detects framework/language from install command or package name
 */
function detectFramework(installCmd: string, name: string): 'nodejs' | 'python' | 'rust' {
  const cmd = installCmd.toLowerCase();
  const pkgName = name.toLowerCase();
  
  // Check install command patterns
  if (cmd.includes('pip install') || cmd.includes('python -m')) {
    return 'python';
  }
  if (cmd.includes('cargo install') || cmd.includes('cargo add')) {
    return 'rust';
  }
  if (cmd.includes('npm') || cmd.includes('npx') || cmd.includes('yarn') || cmd.includes('pnpm')) {
    return 'nodejs';
  }
  
  // Check package name patterns
  if (pkgName.includes('python') || pkgName.includes('py-')) {
    return 'python';
  }
  if (pkgName.includes('rust') || pkgName.includes('rs-')) {
    return 'rust';
  }
  
  // Default to nodejs (most common for MCP servers)
  return 'nodejs';
}

/**
 * Maps array of servers for bulk conversion
 */
export function mapAllServers(servers: McpServer[]): MCPServer[] {
  return servers.map(mapToMCPServerCard);
}
