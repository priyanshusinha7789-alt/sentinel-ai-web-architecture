"use client";

import React, { useState, useEffect } from "react";
import {
  Globe2,
  Search,
  AlertTriangle,
  ExternalLink,
  Clock,
  Database,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Badge,
  useToast,
} from "@/components/ui";
import type { ThreatIntelReputation } from "@/lib/threat-intel/types";

interface ProviderStatusData {
  status: string;
  provider: string;
  version: string;
  isConfigured: boolean;
  requiresConsent: boolean;
  rateLimitNote: string;
  supportedSchemes: string[];
}

export default function ThreatIntelPage() {
  const { error: toastError, info } = useToast();
  const [url, setUrl] = useState("");
  const [userConsent, setUserConsent] = useState(false);
  const [stripTokens, setStripTokens] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatusData | null>(null);
  const [reputationResult, setReputationResult] = useState<ThreatIntelReputation | null>(null);

  useEffect(() => {
    fetch("/api/threat-intel/status")
      .then((res) => res.json())
      .then((data: ProviderStatusData) => setProviderStatus(data))
      .catch(() => {
        // Silently handle if offline
      });
  }, []);

  const handleQuery = async () => {
    if (!url.trim()) {
      toastError("URL Required", "Please enter a valid HTTP or HTTPS URL to query.");
      return;
    }

    if (!userConsent) {
      toastError(
        "Consent Required",
        "Please confirm authorization to share this URL with the external provider."
      );
      return;
    }

    setIsLoading(true);
    setReputationResult(null);

    try {
      const res = await fetch("/api/threat-intel/check-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          userConsent: true,
          stripSensitiveTokens: stripTokens,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toastError("Query Failed", data.error || "Failed to execute reputation query.");
        if (data.reputation) {
          setReputationResult(data.reputation);
        }
      } else {
        setReputationResult(data.reputation);
        info("Threat Intel Query Complete", `Provider: ${data.reputation.provider}`);
      }
    } catch {
      toastError("Network Error", "Could not connect to the threat intelligence backend endpoint.");
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "malicious":
        return <Badge variant="red" size="md">MALICIOUS DETECTIONS</Badge>;
      case "suspicious":
        return <Badge variant="amber" size="md">SUSPICIOUS</Badge>;
      case "clean":
        return <Badge variant="emerald" size="md">NO MALICIOUS ENGINES</Badge>;
      case "unrated":
        return <Badge variant="cyan" size="md">NOT IN DATABASE</Badge>;
      default:
        return <Badge variant="default" size="md">UNAVAILABLE</Badge>;
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Threat Intelligence Integration"
        subtitle="Secure server-side proxy integration for VirusTotal reputation analysis. Provider credentials remain strictly quarantined on the server."
        breadcrumbs={[
          { label: "Overview", href: "/" },
          { label: "Threat Intelligence" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* URL Query Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-[var(--accent-primary)]" />
                Manual URL Reputation Query
              </CardTitle>
              <CardDescription>
                Submits sanitized URL hashes to the configured provider ({providerStatus?.provider || "VirusTotal"} v3) via the secure Next.js backend proxy.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Enter URL to check (e.g. https://suspicious-portal.example.com/login)..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="font-mono text-xs flex-1"
                />
                <Button
                  size="md"
                  variant="primary"
                  leftIcon={<Search className="h-4 w-4" />}
                  onClick={handleQuery}
                  isLoading={isLoading}
                >
                  Query Reputation
                </Button>
              </div>

              {/* Consent and Token Scrubbing Checkboxes */}
              <div className="p-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userConsent}
                    onChange={(e) => setUserConsent(e.target.checked)}
                    className="mt-0.5 rounded border-[var(--border-medium)] bg-[var(--bg-surface-elevated)] text-[var(--accent-primary)] focus:ring-0"
                  />
                  <span className="text-[var(--text-secondary)]">
                    <strong>User Consent Disclosure:</strong> I authorize submitting this URL to external reputation services ({providerStatus?.provider || "VirusTotal"}). I understand the URL will be shared with the provider.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-[var(--border-subtle)]/50">
                  <input
                    type="checkbox"
                    checked={stripTokens}
                    onChange={(e) => setStripTokens(e.target.checked)}
                    className="mt-0.5 rounded border-[var(--border-medium)] bg-[var(--bg-surface-elevated)] text-[var(--accent-primary)] focus:ring-0"
                  />
                  <span className="text-[var(--text-secondary)]">
                    <strong>Privacy Guard:</strong> Automatically detect and strip sensitive query parameters (e.g. <code className="font-mono text-amber-300">token</code>, <code className="font-mono text-amber-300">key</code>, <code className="font-mono text-amber-300">auth</code>) before external transmission.
                  </span>
                </label>
              </div>

              {/* Reputation Results Display */}
              {reputationResult && (
                <div className="p-4 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-4 animate-in fade-in-50 duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)]">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                        Provider: {reputationResult.provider}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono truncate max-w-md">
                        {reputationResult.url}
                      </h4>
                    </div>
                    {getVerdictBadge(reputationResult.verdict)}
                  </div>

                  {reputationResult.errorMessage && (
                    <div className="p-3 rounded bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold block">Lookup Status Note:</span>
                        <span>{reputationResult.errorMessage}</span>
                      </div>
                    </div>
                  )}

                  {reputationResult.stats && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)] block">
                        Engine Detection Statistics
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                          <span className="text-[10px] uppercase text-red-400 font-semibold block">Malicious</span>
                          <span className="text-base font-bold font-mono text-red-400">
                            {reputationResult.stats.malicious}
                          </span>
                        </div>
                        <div className="p-2.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                          <span className="text-[10px] uppercase text-amber-400 font-semibold block">Suspicious</span>
                          <span className="text-base font-bold font-mono text-amber-400">
                            {reputationResult.stats.suspicious}
                          </span>
                        </div>
                        <div className="p-2.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                          <span className="text-[10px] uppercase text-emerald-400 font-semibold block">Harmless</span>
                          <span className="text-base font-bold font-mono text-emerald-400">
                            {reputationResult.stats.harmless}
                          </span>
                        </div>
                        <div className="p-2.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                          <span className="text-[10px] uppercase text-[var(--text-muted)] font-semibold block">Undetected</span>
                          <span className="text-base font-bold font-mono text-[var(--text-secondary)]">
                            {reputationResult.stats.undetected}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] text-right">
                        Scanned across {reputationResult.stats.total} security vendor engines
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between text-[11px] text-[var(--text-muted)] gap-2">
                    <div className="flex items-center gap-3">
                      {reputationResult.analysisDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last scanned: {new Date(reputationResult.analysisDate).toLocaleDateString()}
                        </span>
                      )}
                      {reputationResult.isCached && (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Database className="h-3 w-3" />
                          Cached response
                        </span>
                      )}
                    </div>
                    {reputationResult.reportUrl && (
                      <a
                        href={reputationResult.reportUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-1 text-[var(--accent-primary)] hover:underline"
                      >
                        <span>View on VirusTotal</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {reputationResult.limitations && (
                    <div className="p-2.5 rounded bg-[var(--bg-secondary)] text-[10px] text-[var(--text-muted)] space-y-1">
                      <span className="font-semibold block text-[var(--text-secondary)]">Technical Limitations:</span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {reputationResult.limitations.map((lim, idx) => (
                          <li key={idx}>{lim}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status and Architecture Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Database className="h-4 w-4 text-[var(--accent-primary)]" />
                Provider Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Active Provider:</span>
                <span className="font-mono font-semibold text-[var(--text-primary)]">
                  {providerStatus?.provider || "VirusTotal"} {providerStatus?.version || "v3"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Configuration:</span>
                {providerStatus?.isConfigured ? (
                  <Badge variant="emerald" size="sm" dot>Configured</Badge>
                ) : (
                  <Badge variant="amber" size="sm" dot>Key Missing</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Consent Enforced:</span>
                <Badge variant="cyan" size="sm">Required</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Rate Limit:</span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {providerStatus?.rateLimitNote || "4 req/min"}
                </span>
              </div>

              {!providerStatus?.isConfigured && (
                <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30 text-amber-200 text-[11px] space-y-1 mt-2">
                  <span className="font-bold block">VIRUSTOTAL_API_KEY Missing</span>
                  <p>
                    Set <code className="font-mono">VIRUSTOTAL_API_KEY</code> in <code className="font-mono">web/.env.local</code> to activate live vendor scans. Local heuristics remain fully functional without it.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-400" />
                Security & Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
              <p>
                • <strong>Zero Browser Secrets:</strong> Provider API keys exist solely in the server environment and are never returned in JSON or embedded in HTML.
              </p>
              <p>
                • <strong>SSRF Prevention:</strong> Internal, loopback (127.0.0.1, localhost), and cloud metadata endpoints are strictly rejected before submission.
              </p>
              <p>
                • <strong>Sensitive Token Scrubbing:</strong> URLs containing session IDs, auth tokens, or passwords can be sanitized before external transmission.
              </p>
              <p>
                • <strong>No Fabricated Data:</strong> If a service is unavailable or unconfigured, the UI honestly displays unconfigured status rather than faking clean threat results.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
