/**
 * SENTINEL AI - Threat Intelligence Type Definitions
 * 
 * Provider-agnostic interfaces for external threat intelligence lookups.
 * Guarantees strict type safety, distinct external findings, and zero credential leakage.
 */

export type ThreatIntelStatus =
  | "not_requested"
  | "awaiting_consent"
  | "not_configured"
  | "pending"
  | "completed"
  | "no_report_available"
  | "rate_limited"
  | "authentication_failed"
  | "invalid_url"
  | "token_risk_flagged"
  | "unavailable"
  | "failed";

export type ReputationVerdict =
  | "malicious"
  | "suspicious"
  | "clean"
  | "unrated"
  | "pending"
  | "unavailable";

export interface ThreatIntelEngineStats {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  total: number;
}

export interface ThreatIntelReputation {
  provider: "VirusTotal" | "Generic";
  status: ThreatIntelStatus;
  verdict: ReputationVerdict;
  url: string;
  normalizedHost: string;
  stats?: ThreatIntelEngineStats;
  analysisDate?: string;
  reportUrl?: string;
  isCached: boolean;
  cachedAt?: string;
  errorMessage?: string;
  tokensDetected?: string[];
  limitations: string[];
}

export interface ProviderCapability {
  name: string;
  version: string;
  isConfigured: boolean;
  requiresConsent: boolean;
  rateLimitNote: string;
  supportedSchemes: string[];
}

export interface ThreatIntelCheckRequest {
  url: string;
  userConsent: boolean;
  stripSensitiveTokens?: boolean;
}

export interface ThreatIntelCheckResponse {
  success: boolean;
  reputation: ThreatIntelReputation;
  error?: string;
}

export interface ThreatIntelProvider {
  readonly name: string;
  readonly version: string;
  isConfigured(): boolean;
  getCapabilities(): ProviderCapability;
  checkUrl(url: string, timeoutMs?: number): Promise<ThreatIntelReputation>;
}
