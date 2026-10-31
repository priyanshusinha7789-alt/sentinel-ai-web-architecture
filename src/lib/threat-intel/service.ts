/**
 * SENTINEL AI - Threat Intelligence Service Orchestrator
 * 
 * Central coordinator for URL validation, consent verification, provider abstraction,
 * and caching. Decouples the Next.js API layer from specific provider adapters.
 */

import type {
  ThreatIntelProvider,
  ThreatIntelReputation,
  ThreatIntelCheckRequest,
  ProviderCapability,
} from "./types";
import { SafeUrlValidator } from "./url-validator";
import { ThreatIntelCache } from "./cache";
import { VirusTotalAdapter } from "./virustotal-adapter";

export class ThreatIntelService {
  private static instance: ThreatIntelService | null = null;
  private readonly provider: ThreatIntelProvider;

  constructor(provider?: ThreatIntelProvider) {
    this.provider = provider || new VirusTotalAdapter();
  }

  static getInstance(): ThreatIntelService {
    if (!this.instance) {
      this.instance = new ThreatIntelService();
    }
    return this.instance;
  }

  getCapabilities(): ProviderCapability {
    return this.provider.getCapabilities();
  }

  isConfigured(): boolean {
    return this.provider.isConfigured();
  }

  /**
   * Executes a safe, consent-enforced threat intelligence lookup on a URL candidate.
   */
  async checkUrl(request: ThreatIntelCheckRequest): Promise<ThreatIntelReputation> {
    const rawUrl = request.url;

    // 1. URL Validation & SSRF Prevention
    const validation = SafeUrlValidator.validate(
      rawUrl,
      Boolean(request.stripSensitiveTokens)
    );

    if (!validation.isValid) {
      return {
        provider: "VirusTotal",
        status: "invalid_url",
        verdict: "unavailable",
        url: rawUrl,
        normalizedHost: validation.normalizedHost || "unknown",
        isCached: false,
        errorMessage: validation.rejectionReason || "Invalid URL specification.",
        limitations: [
          "Only valid, public HTTP/HTTPS URLs can be submitted to external threat reputation providers.",
        ],
      };
    }

    const targetUrl = validation.sanitizedUrl || rawUrl;
    const normalizedHost = validation.normalizedHost || "";

    // 2. Sensitive Token Audit & Warning
    if (validation.sensitiveTokensDetected.length > 0 && !request.stripSensitiveTokens) {
      return {
        provider: "VirusTotal",
        status: "token_risk_flagged",
        verdict: "unavailable",
        url: targetUrl,
        normalizedHost,
        tokensDetected: validation.sensitiveTokensDetected,
        isCached: false,
        errorMessage: `The URL contains parameters that appear to be sensitive authentication tokens (${validation.sensitiveTokensDetected.join(
          ", "
        )}). External submission would transmit these credentials to a third party.`,
        limitations: [
          "To protect user privacy, URLs with potential session tokens or credentials require stripping before transmission.",
        ],
      };
    }

    // 3. Mandatory User Consent Check
    if (!request.userConsent) {
      return {
        provider: "VirusTotal",
        status: "awaiting_consent",
        verdict: "unavailable",
        url: targetUrl,
        normalizedHost,
        isCached: false,
        errorMessage: "External lookup declined or consent was not granted. The URL has not been submitted.",
        limitations: [
          "External threat intelligence lookups share the candidate URL with third-party providers and require explicit authorization.",
        ],
      };
    }

    // 4. Cache Lookup
    const cached = ThreatIntelCache.get(targetUrl);
    if (cached) {
      return cached;
    }

    // 5. Query Provider Adapter
    const result = await this.provider.checkUrl(targetUrl);

    // 6. Cache Successful Reports
    if (result.status === "completed" || result.status === "no_report_available") {
      ThreatIntelCache.set(targetUrl, result);
    }

    return result;
  }
}
