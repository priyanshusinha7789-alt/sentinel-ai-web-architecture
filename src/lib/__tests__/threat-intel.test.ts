import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { SafeUrlValidator } from "../threat-intel/url-validator";
import { VirusTotalAdapter } from "../threat-intel/virustotal-adapter";
import { ThreatIntelCache } from "../threat-intel/cache";
import { ThreatIntelService } from "../threat-intel/service";
import type { ThreatIntelProvider, ThreatIntelReputation } from "../threat-intel/types";

describe("SENTINEL AI - Threat Intelligence Integration", () => {
  beforeEach(() => {
    ThreatIntelCache.clear();
  });

  describe("Safe URL Validation & SSRF Prevention", () => {
    it("accepts valid public HTTP and HTTPS URLs", () => {
      const v1 = SafeUrlValidator.validate("https://example.com/login");
      assert.equal(v1.isValid, true);
      assert.equal(v1.normalizedHost, "example.com");

      const v2 = SafeUrlValidator.validate("http://sub.domain.org:8080/path?id=123");
      assert.equal(v2.isValid, true);
    });

    it("rejects unsupported protocols and script schemes", () => {
      const v1 = SafeUrlValidator.validate("javascript:alert(1)");
      assert.equal(v1.isValid, false);
      assert.ok(v1.rejectionReason?.includes("Only standard HTTP and HTTPS"));

      const v2 = SafeUrlValidator.validate("file:///etc/passwd");
      assert.equal(v2.isValid, false);

      const v3 = SafeUrlValidator.validate("data:text/html,<html>");
      assert.equal(v3.isValid, false);
    });

    it("blocks SSRF attempts on internal, loopback, and metadata IPs", () => {
      const targets = [
        "http://localhost/admin",
        "http://127.0.0.1:8080",
        "http://[::1]/status",
        "http://10.0.0.1/private",
        "http://192.168.1.1/router",
        "http://172.16.5.10/internal",
        "http://169.254.169.254/latest/meta-data/",
      ];

      for (const target of targets) {
        const result = SafeUrlValidator.validate(target);
        assert.equal(result.isValid, false, `Failed to block internal host: ${target}`);
        assert.ok(result.rejectionReason?.includes("internal, loopback, or private address"));
      }
    });

    it("detects and optionally strips sensitive query parameters", () => {
      const sensitiveUrl = "https://example.com/reset?token=secret123&user=john&apiKey=xyz";
      
      const vAudit = SafeUrlValidator.validate(sensitiveUrl, false);
      assert.equal(vAudit.isValid, true);
      assert.deepEqual(vAudit.sensitiveTokensDetected.sort(), ["apikey", "token"]);
      assert.ok(vAudit.sanitizedUrl?.includes("token=secret123"));

      const vStrip = SafeUrlValidator.validate(sensitiveUrl, true);
      assert.equal(vStrip.isValid, true);
      assert.ok(!vStrip.sanitizedUrl?.includes("token="));
      assert.ok(!vStrip.sanitizedUrl?.includes("apikey="));
      assert.ok(vStrip.sanitizedUrl?.includes("user=john"));
    });

    it("rejects excessively long URLs (> 2048 chars)", () => {
      const longUrl = "https://example.com/" + "a".repeat(2050);
      const result = SafeUrlValidator.validate(longUrl);
      assert.equal(result.isValid, false);
      assert.ok(result.rejectionReason?.includes("exceeds maximum allowable length"));
    });
  });

  describe("VirusTotal Adapter v3", () => {
    it("correctly generates unpadded base64 URL identifiers", () => {
      const id = VirusTotalAdapter.getUrlIdentifier("https://example.com");
      assert.ok(!id.includes("="));
      assert.equal(id, Buffer.from("https://example.com").toString("base64").replace(/=/g, ""));
    });

    it("reports not_configured when no API key is provided", async () => {
      const adapter = new VirusTotalAdapter("");
      assert.equal(adapter.isConfigured(), false);

      const result = await adapter.checkUrl("https://example.com");
      assert.equal(result.status, "not_configured");
      assert.equal(result.verdict, "unavailable");
      assert.ok(result.errorMessage?.includes("not configured"));
    });

    it("safely isolates credentials and never exposes keys in error messages", async () => {
      const secretKey = "super_secret_production_key_12345";
      const adapter = new VirusTotalAdapter(secretKey);

      // Force an endpoint failure or check result
      const result = await adapter.checkUrl("https://example.com");
      assert.ok(!JSON.stringify(result).includes(secretKey));
    });
  });

  describe("Threat Intelligence Service & Consent Guard", () => {
    it("enforces explicit user consent before querying external provider", async () => {
      const service = new ThreatIntelService(new VirusTotalAdapter(""));
      const result = await service.checkUrl({
        url: "https://example.com",
        userConsent: false,
      });

      assert.equal(result.status, "awaiting_consent");
      assert.equal(result.verdict, "unavailable");
      assert.ok(result.errorMessage?.includes("consent was not granted"));
    });

    it("flags URLs containing sensitive tokens unless stripping is authorized", async () => {
      const service = new ThreatIntelService(new VirusTotalAdapter("mock-key"));
      const result = await service.checkUrl({
        url: "https://example.com/login?token=sensitive_jwt_token",
        userConsent: true,
        stripSensitiveTokens: false,
      });

      assert.equal(result.status, "token_risk_flagged");
      assert.ok(result.tokensDetected?.includes("token"));
    });

    it("caches completed results in in-memory TTL cache", async () => {
      // Create a mock provider that records call count
      let calls = 0;
      const mockProvider: ThreatIntelProvider = {
        name: "VirusTotal",
        version: "v3",
        isConfigured: () => true,
        getCapabilities: () => ({
          name: "VirusTotal",
          version: "v3",
          isConfigured: true,
          requiresConsent: true,
          rateLimitNote: "4 req/min",
          supportedSchemes: ["http", "https"],
        }),
        checkUrl: async (url: string): Promise<ThreatIntelReputation> => {
          calls += 1;
          return {
            provider: "VirusTotal",
            status: "completed",
            verdict: "clean",
            url,
            normalizedHost: "example.com",
            stats: { malicious: 0, suspicious: 0, harmless: 70, undetected: 2, total: 72 },
            isCached: false,
            limitations: [],
          };
        },
      };

      const service = new ThreatIntelService(mockProvider);

      // First query: calls provider
      const res1 = await service.checkUrl({
        url: "https://example.com",
        userConsent: true,
      });
      assert.equal(calls, 1);
      assert.equal(res1.isCached, false);
      assert.equal(res1.verdict, "clean");

      // Second query: served from cache
      const res2 = await service.checkUrl({
        url: "https://example.com",
        userConsent: true,
      });
      assert.equal(calls, 1); // No additional provider call
      assert.equal(res2.isCached, true);
      assert.ok(res2.cachedAt);
    });

    it("derives correct malicious verdict when provider engines detect malware", async () => {
      const mockMaliciousProvider: ThreatIntelProvider = {
        name: "VirusTotal",
        version: "v3",
        isConfigured: () => true,
        getCapabilities: () => ({
          name: "VirusTotal",
          version: "v3",
          isConfigured: true,
          requiresConsent: true,
          rateLimitNote: "4 req/min",
          supportedSchemes: ["http", "https"],
        }),
        checkUrl: async (url: string): Promise<ThreatIntelReputation> => ({
          provider: "VirusTotal",
          status: "completed",
          verdict: "malicious",
          url,
          normalizedHost: "phish-domain.ru",
          stats: { malicious: 18, suspicious: 4, harmless: 0, undetected: 50, total: 72 },
          isCached: false,
          limitations: [],
        }),
      };

      const service = new ThreatIntelService(mockMaliciousProvider);
      const res = await service.checkUrl({
        url: "https://phish-domain.ru/login",
        userConsent: true,
      });

      assert.equal(res.verdict, "malicious");
      assert.equal(res.stats?.malicious, 18);
    });
  });
});
