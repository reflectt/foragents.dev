import 'server-only';

import dns from 'node:dns/promises';
import net from 'node:net';

export type SsrfGuardOptions = {
  /** If set, only these hostnames are allowed (exact match, case-insensitive). */
  allowHosts?: Set<string>;
  /** Allowed URL schemes (default: https only). */
  allowSchemes?: Set<string>;
  /** Allowed ports (default: 443 + 80). */
  allowPorts?: Set<number>;
  /** Max redirects to follow (default: 5). */
  maxRedirects?: number;
};

const DEFAULT_SCHEMES = new Set(['https:']);
const DEFAULT_PORTS = new Set([443, 80]);

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function inCidrV4(ip: string, cidrBase: string, maskBits: number): boolean {
  const ipInt = ipv4ToInt(ip);
  const baseInt = ipv4ToInt(cidrBase);
  const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

function isPrivateIp(ip: string): boolean {
  const ipType = net.isIP(ip);
  if (ipType === 4) {
    // RFC1918 + localhost + link-local + CGNAT + "this network" + unspecified
    return (
      inCidrV4(ip, '10.0.0.0', 8) ||
      inCidrV4(ip, '127.0.0.0', 8) ||
      inCidrV4(ip, '169.254.0.0', 16) ||
      inCidrV4(ip, '172.16.0.0', 12) ||
      inCidrV4(ip, '192.168.0.0', 16) ||
      inCidrV4(ip, '100.64.0.0', 10) ||
      inCidrV4(ip, '0.0.0.0', 8)
    );
  }

  if (ipType === 6) {
    const v = ip.toLowerCase();
    return (
      v === '::1' || // loopback
      v.startsWith('fe80:') || // link-local
      v.startsWith('fc') ||
      v.startsWith('fd') || // unique local
      v === '::' // unspecified
    );
  }

  return true; // Not an IP? treat as unsafe.
}

async function assertHostnameResolvesPublic(hostname: string): Promise<void> {
  const normalized = hostname.toLowerCase();
  if (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized.endsWith('.local')
  ) {
    throw new Error('SSRF blocked: localhost-like hostname');
  }

  // If it's already an IP literal, validate directly.
  if (net.isIP(normalized)) {
    if (isPrivateIp(normalized)) throw new Error('SSRF blocked: private IP');
    return;
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!records.length) throw new Error('SSRF blocked: hostname did not resolve');

  for (const r of records) {
    if (isPrivateIp(r.address)) {
      throw new Error('SSRF blocked: hostname resolves to private IP');
    }
  }
}

export async function assertSafeUrl(input: string, opts: SsrfGuardOptions = {}): Promise<URL> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Invalid URL');
  }

  if (url.username || url.password) {
    throw new Error('SSRF blocked: userinfo not allowed');
  }

  const allowSchemes = opts.allowSchemes ?? DEFAULT_SCHEMES;
  if (!allowSchemes.has(url.protocol)) {
    throw new Error(`SSRF blocked: scheme not allowed (${url.protocol})`);
  }

  const port = url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80;
  const allowPorts = opts.allowPorts ?? DEFAULT_PORTS;
  if (!allowPorts.has(port)) {
    throw new Error(`SSRF blocked: port not allowed (${port})`);
  }

  if (opts.allowHosts) {
    const host = url.hostname.toLowerCase();
    if (!opts.allowHosts.has(host)) {
      throw new Error(`SSRF blocked: host not allowed (${host})`);
    }
  }

  await assertHostnameResolvesPublic(url.hostname);
  return url;
}

/**
 * Fetch with SSRF protections:
 * - https-only by default
 * - blocks localhost/private IPs (including DNS rebinding)
 * - validates each redirect hop
 */
export async function safeFetch(input: string, init: RequestInit = {}, opts: SsrfGuardOptions = {}): Promise<Response> {
  const maxRedirects = opts.maxRedirects ?? 5;

  let current = await assertSafeUrl(input, opts);
  let redirects = 0;

  // Always do manual redirect handling so we can validate Location targets.
  const baseInit: RequestInit = { ...init, redirect: 'manual' };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await fetch(current.toString(), baseInit);

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) return res;
      if (redirects >= maxRedirects) throw new Error('Too many redirects');

      const nextUrl = new URL(loc, current);
      current = await assertSafeUrl(nextUrl.toString(), opts);
      redirects++;
      continue;
    }

    return res;
  }
}
