import protocolsData from "@/data/interop-protocols.json";

export type InteropMaturity = "stable" | "emerging" | "experimental";

export type InteropProtocol = {
  slug: string;
  name: string;
  fullName: string;
  description: string;
  maturity: InteropMaturity;
  adoption: number;
  bestFor: string[];
  architectureOverview: string;
  connectionExample: string;
  requestResponseExample: string;
  pros: string[];
  cons: string[];
  compatibleTools: string[];
  frameworks: string[];
  whenToUse: Array<{
    scenario: string;
    guidance: string;
  }>;
  features: {
    streaming: boolean;
    bidirectional: boolean;
    discovery: boolean;
    auth: boolean;
    typing: boolean;
  };
};

const protocols = protocolsData as InteropProtocol[];

export function getInteropProtocols(): InteropProtocol[] {
  return protocols;
}

export function getInteropProtocol(slug: string): InteropProtocol | undefined {
  return protocols.find((protocol) => protocol.slug === slug);
}
