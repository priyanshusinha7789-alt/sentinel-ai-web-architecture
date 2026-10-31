/**
 * SENTINEL AI - VirusTotal API v3 Adapter
 * 
 * Production-conscious integration with VirusTotal v3 URL intelligence.
 * Enforces bounded timeouts, secret isolation, and defensive normalization.
 */

import type {
  ThreatIntelProvider,
  ThreatIntelReputation,
  ProviderCapability,
  ReputationVerdict,
} from "./types";

export class VirusTotalAdapter implements ThreatIntelProvider {
  readonly name = "VirusTotal" as const;
  readonly version = "v3" as const;
  private readonly apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.VIRUSTOTAL_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  getCapabilities(): ProviderCapability {
    return {
      name: this.name,
      version: this.version,
      isConfigured: this.isConfigured(),
      requiresConsent: true,
      rateLimitNote: "4 requests / minute on standard public tier",
      supportedSchemes: ["http", "https"],
    };
  }

  /**
   * Generates VirusTotal v3 URL ID: base64-encoded URL string without padding '='
   */
  static getUrlIdentifier(url: string): string {
    const b64 = Buffer.from(url.trim()).toString("base64");
    return b64.replace(/=/g, "");
  }

  /**
   * Queries VirusTotal v3 for an existing URL analysis report.
   * Never throws uncaught network errors; always returns a typed ThreatIntelReputation.
   */
  async checkUrl(url: string, timeoutMs = 8000): Promise<ThreatIntelReputation> {
    let normalizedHost = "";
    try {
      normalizedHost = new URL(url).hostname;
    } catch {
      normalizedHost = "unknown";
    }

    const defaultLimitations = [
      "VirusTotal scans reflect historical multi-engine detection records; a clean score does not guarantee absolute safety against newly deployed phishing kits.",
      "Results depend on third-party security vendors and may take hours to index brand-new attack infrastructure.",
    ];

    if (!this.isConfigured()) {
      return {
        provider: this.name,
        status: "not_configured",
        verdict: "unavailable",
        url,
        normalizedHost,
        isCached: false,
        errorMessage: "VirusTotal API key is not configured on the server environment (VIRUSTOTAL_API_KEY).",
        limitations: [
          ...defaultLimitations,
          "External threat intelligence is currently disabled because no provider key was supplied.",
        ],
      };
    }

    const urlId = VirusTotalAdapter.getUrlIdentifier(url);
    const endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "x-apikey": this.apiKey!,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 404: Not in database
      if (response.status === 404) {
        return {
          provider: this.name,
          status: "no_report_available",
          verdict: "unrated",
          url,
          normalizedHost,
          isCached: false,
          errorMessage: "URL has not been previously submitted or observed in the VirusTotal database.",
          limitations: defaultLimitations,
        };
      }

      // Handle 429: Rate limit
      if (response.status === 429) {
        return {
          provider: this.name,
          status: "rate_limited",
          verdict: "unavailable",
          url,
          normalizedHost,
          isCached: false,
          errorMessage: "VirusTotal rate limit exceeded. Public API tier allows up to 4 requests per minute.",
          limitations: defaultLimitations,
        };
      }

      // Handle 401 / 403: Auth failure
      if (response.status === 401 || response.status === 403) {
        return {
          provider: this.name,
          status: "authentication_failed",
          verdict: "unavailable",
          url,
          normalizedHost,
          isCached: false,
          errorMessage: "VirusTotal authentication rejected. Check the server VIRUSTOTAL_API_KEY configuration.",
          limitations: defaultLimitations,
        };
      }

      if (!response.ok) {
        return {
          provider: this.name,
          status: "failed",
          verdict: "unavailable",
          url,
          normalizedHost,
          isCached: false,
          errorMessage: `VirusTotal server responded with HTTP status ${response.status}.`,
          limitations: defaultLimitations,
        };
      }

      const data = await response.json();
      return this.normalizeResponse(url, normalizedHost, data, defaultLimitations);
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      const isAbort = err instanceof Error && err.name === "AbortError";
      const errMsg = isAbort
        ? `Request timed out after ${timeoutMs}ms.`
        : "Failed to establish network connection to VirusTotal.";

      return {
        provider: this.name,
        status: isAbort ? "unavailable" : "failed",
        verdict: "unavailable",
        url,
        normalizedHost,
        isCached: false,
        errorMessage: errMsg,
        limitations: defaultLimitations,
      };
    }
  }

  /**
   * Safely normalizes the raw VirusTotal v3 payload into the application data model.
   */
  private normalizeResponse(
    url: string,
    normalizedHost: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    limitations: string[]
  ): ThreatIntelReputation {
    const attributes = data?.data?.attributes;
    if (!attributes) {
      return {
        provider: this.name,
        status: "failed",
        verdict: "unavailable",
        url,
        normalizedHost,
        isCached: false,
        errorMessage: "Malformed or unrecognized response payload structure from VirusTotal.",
        limitations,
      };
    }

    const rawStats = attributes.last_analysis_stats || {};
    const stats = {
      malicious: Number(rawStats.malicious) || 0,
      suspicious: Number(rawStats.suspicious) || 0,
      harmless: Number(rawStats.harmless) || 0,
      undetected: Number(rawStats.undetected) || 0,
      total:
        (Number(rawStats.malicious) || 0) +
        (Number(rawStats.suspicious) || 0) +
        (Number(rawStats.harmless) || 0) +
        (Number(rawStats.undetected) || 0),
    };

    let verdict: ReputationVerdict = "unrated";
    if (stats.malicious >= 3) {
      verdict = "malicious";
    } else if (stats.malicious > 0 || stats.suspicious > 0) {
      verdict = "suspicious";
    } else if (stats.harmless > 0 || stats.undetected > 0) {
      verdict = "clean";
    }

    let analysisDate: string | undefined;
    if (attributes.last_analysis_date) {
      analysisDate = new Date(attributes.last_analysis_date * 1000).toISOString();
    }

    const urlId = VirusTotalAdapter.getUrlIdentifier(url);
    const reportUrl = `https://www.virustotal.com/gui/url/${urlId}`;

    return {
      provider: this.name,
      status: "completed",
      verdict,
      url,
      normalizedHost,
      stats,
      analysisDate,
      reportUrl,
      isCached: false,
      limitations,
    };
  }
}
