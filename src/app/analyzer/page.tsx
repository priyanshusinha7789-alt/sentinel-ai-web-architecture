"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  FileText,
  Globe2,
  Terminal,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sliders,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Textarea,
  Tabs,
  TabsList,
  TabTrigger,
  TabContent,
  RiskBadge,
  RiskGauge,
  Switch,
  Badge,
  useToast,
} from "@/components/ui";
import { EmailAnalyzer } from "@/lib/engine/email-analyzer";
import { UrlExtractor } from "@/lib/engine/url-extractor";
import { InvestigationStorage } from "@/lib/engine/storage";
import { EmailInputSchema, type Investigation } from "@/lib/engine/types";
import type { ThreatIntelReputation } from "@/lib/threat-intel/types";

const DEMO_SAMPLES = [
  {
    label: "National Bank Phish",
    sender: "security@secure-nationalbank-alerts.com",
    subject: "URGENT: Your account has been suspended",
    body: `Dear Valued Customer,\n\nWe have detected unusual activity on your National Bank account. Your account has been temporarily suspended to protect you.\n\nYou must verify your identity within 24 hours or your account will be permanently closed.\n\nClick here to verify: http://sub.secure-nationalbank-verify.login-now.com/verify\n\nPlease provide your account number, password, and one-time password (OTP) sent to your phone.\n\nFailure to act immediately will result in permanent closure.\n\nNational Bank Security Team`,
    headers: `From: "National Bank Security" <security@secure-nationalbank-alerts.com>\nReply-To: phish-collector@free-redirect-service.net\nReturn-Path: bounce@attacker-relay.com\nAuthentication-Results: spf=softfail dkim=fail dmarc=fail`,
  },
  {
    label: "Prize Scam",
    sender: "winners@prize-claims-international.com",
    subject: "Congratulations! Selected as our lucky winner",
    body: `CONGRATULATIONS!\n\nYou have won $500,000 in our international lottery draw! You were selected from millions of participants.\n\nTo claim your prize, send your full name, bank details, and an administrative fee of $150 via Western Union or Bitcoin.\n\nClaim your reward now at https://prize-claim-intl.org/payout before it expires today!\n\nInternational Prize Committee`,
    headers: `From: "Prize Committee" <winners@prize-claims-international.com>\nReply-To: agent-inbox@gmail.com\nAuthentication-Results: spf=pass dkim=neutral dmarc=neutral`,
  },
  {
    label: "Legitimate Statement",
    sender: "notifications@mybank.com",
    subject: "Your monthly statement is ready",
    body: `Hello,\n\nYour monthly account statement for October 2024 is now available in your online banking portal.\n\nTo view your statement, please log in to your account at https://mybank.com/portal using your usual credentials.\n\nIf you have questions, please contact our support team at support@mybank.com.\n\nThank you for banking with us.\n\nMyBank Customer Services`,
    headers: `From: "MyBank Notifications" <notifications@mybank.com>\nReply-To: support@mybank.com\nAuthentication-Results: spf=pass dkim=pass dmarc=pass`,
  },
  {
    label: "Apple ID Phish",
    sender: "no-reply@apple-id-support-verification.com",
    subject: "Action Required: Verify your Apple ID",
    body: `Dear Apple User,\n\nYour Apple ID has been flagged due to a suspicious login attempt from an unknown device.\n\nTo prevent unauthorized access, you must verify your credentials immediately.\n\nClick here to confirm: http://apple-id-verify.secure-login-support.com/confirm\n\nApple Support Team`,
    headers: `From: "Apple Security Alert" <no-reply@apple-id-support-verification.com>\nReply-To: harvest-inbox@attacker-cloud.net\nAuthentication-Results: spf=fail dkim=fail dmarc=fail`,
  },
];

export default function ThreatAnalyzerPage() {
  const { success, error: toastError, info } = useToast();

  // Form State
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [rawHeaders, setRawHeaders] = useState("");
  const [manualUrlInput, setManualUrlInput] = useState("");
  const [manualUrls, setManualUrls] = useState<string[]>([]);
  const [activeInputTab, setActiveInputTab] = useState<"content" | "headers" | "urls" | "options">("content");

  // Options State
  const [checkLanguage, setCheckLanguage] = useState(true);
  const [checkUrls, setCheckUrls] = useState(true);
  const [checkSender, setCheckSender] = useState(true);
  const [checkHeaders, setCheckHeaders] = useState(true);
  const [externalReputation, setExternalReputation] = useState(false);
  const [showOptionsCard, setShowOptionsCard] = useState(false);

  // Execution & Results State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [currentInvestigation, setCurrentInvestigation] = useState<Investigation | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"findings" | "urls" | "headers" | "actions" | "metadata">("findings");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [checkingUrlIndex, setCheckingUrlIndex] = useState<number | null>(null);
  const [consentPromptUrlIndex, setConsentPromptUrlIndex] = useState<number | null>(null);
  const [stripTokensOnCheck, setStripTokensOnCheck] = useState(true);

  // Real-time extracted URLs from body
  const extractedUrls = UrlExtractor.extractFromText(body);
  const allUrls = Array.from(new Set([...extractedUrls, ...manualUrls]));

  // Pre-load demo sample
  const loadDemo = (sample: typeof DEMO_SAMPLES[0]) => {
    setSender(sample.sender);
    setSubject(sample.subject);
    setBody(sample.body);
    setRawHeaders(sample.headers || "");
    setManualUrls([]);
    setValidationError(null);
    info("Synthetic Scenario Loaded", sample.label);
  };

  const handleClear = () => {
    setSender("");
    setSubject("");
    setBody("");
    setRawHeaders("");
    setManualUrls([]);
    setValidationError(null);
    setCurrentInvestigation(null);
  };

  const handleAddManualUrl = () => {
    if (!manualUrlInput.trim()) return;
    try {
      new URL(manualUrlInput.trim());
      setManualUrls((prev) => Array.from(new Set([...prev, manualUrlInput.trim()])));
      setManualUrlInput("");
    } catch {
      toastError("Invalid URL Format", "Please enter a valid URL beginning with http:// or https://");
    }
  };

  const handleRemoveManualUrl = (url: string) => {
    setManualUrls((prev) => prev.filter((u) => u !== url));
  };

  // Submit and execute actual investigation
  const handleExecuteAnalysis = async () => {
    setValidationError(null);

    // Validate using Zod
    const validation = EmailInputSchema.safeParse({
      subject,
      senderEmail: sender,
      body,
      rawHeaders,
      manualUrls,
      options: {
        checkLanguage,
        checkUrls,
        checkSender,
        checkHeaders,
        externalReputation,
      },
    });

    if (!validation.success) {
      const issue = validation.error.issues[0]?.message || "Invalid input provided.";
      setValidationError(issue);
      toastError("Validation Error", issue);
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Sanitizing email content and stripping inert DOM...");

    await new Promise((r) => setTimeout(r, 180));
    setProcessingStep("Evaluating social-engineering language heuristics...");

    await new Promise((r) => setTimeout(r, 180));
    setProcessingStep("Parsing structural URLs & lookalike domains...");

    await new Promise((r) => setTimeout(r, 180));
    setProcessingStep("Extracting reported RFC 822 authentication headers...");

    await new Promise((r) => setTimeout(r, 180));
    setProcessingStep("Compiling cap-based explainable risk score...");

    const investigation = EmailAnalyzer.analyze(validation.data);

    // Persist to local investigation archive
    InvestigationStorage.save(investigation);

    setCurrentInvestigation(investigation);
    setIsProcessing(false);
    success(
      "Investigation Complete",
      `Assessed as ${investigation.riskCategory} Risk (${investigation.riskScore}/100)`
    );
  };

  const handleCopySummary = () => {
    if (!currentInvestigation) return;
    const text = `SENTINEL AI Investigation Report\nCase ID: ${currentInvestigation.id}\nRisk: ${currentInvestigation.riskCategory} (${currentInvestigation.riskScore}/100)\nSubject: ${currentInvestigation.emailSubject || "(None)"}\nSummary: ${currentInvestigation.summary}`;
    navigator.clipboard.writeText(text);
    success("Copied to Clipboard", "Investigation summary ready to share.");
  };

  const handleCheckUrlThreatIntel = async (index: number, url: string) => {
    setCheckingUrlIndex(index);
    setConsentPromptUrlIndex(null);

    try {
      const res = await fetch("/api/threat-intel/check-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          userConsent: true,
          stripSensitiveTokens: stripTokensOnCheck,
        }),
      });

      const data = await res.json();
      if (data.success && data.reputation) {
        const rep = data.reputation as ThreatIntelReputation;
        if (currentInvestigation) {
          const updatedUrlFindings = [...currentInvestigation.urlFindings];
          updatedUrlFindings[index] = {
            ...updatedUrlFindings[index],
            reputation: rep,
            externalReputationStatus:
              rep.verdict === "malicious"
                ? "Malicious"
                : rep.verdict === "suspicious"
                ? "Suspicious"
                : rep.verdict === "clean"
                ? "Clean"
                : "Unavailable",
            externalReputationDetail:
              rep.errorMessage ||
              (rep.stats ? `${rep.stats.malicious}/${rep.stats.total} vendors flagged` : undefined),
          };

          const updatedWarnings = [...currentInvestigation.warningSigns];
          if (rep.stats && rep.stats.malicious > 0) {
            if (!updatedWarnings.some((w) => w.id === `RULE-INTEL-VT-${index}`)) {
              updatedWarnings.push({
                id: `RULE-INTEL-VT-${index}`,
                category: "Suspicious URL",
                title: `VirusTotal: ${rep.stats.malicious} Security Engines Flagged URL`,
                description: `External threat intelligence vendor scan identified malicious signatures on destination "${rep.normalizedHost}".`,
                evidence: `${rep.stats.malicious}/${rep.stats.total} security vendors flagged: ${rep.url}`,
                severityPoints: Math.min(25, 10 + rep.stats.malicious * 2),
                severity: rep.stats.malicious >= 3 ? "critical" : "high",
                confidence: "high",
              });
            }
          }

          const updatedInv = {
            ...currentInvestigation,
            urlFindings: updatedUrlFindings,
            warningSigns: updatedWarnings,
          };
          setCurrentInvestigation(updatedInv);
          InvestigationStorage.save(updatedInv);
        }
        info("VirusTotal Lookup Completed", `Verdict: ${rep.verdict.toUpperCase()}`);
      } else {
        toastError("Lookup Failed", data.error || "Failed to query VirusTotal.");
      }
    } catch {
      toastError("Network Error", "Could not connect to threat intelligence backend endpoint.");
    } finally {
      setCheckingUrlIndex(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Email Threat Analyzer"
        subtitle="Perform deep, transparent structural analysis of suspicious email bodies, sender domain consistency, and email authentication headers."
        breadcrumbs={[
          { label: "Overview", href: "/" },
          { label: "Threat Analyzer" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {currentInvestigation && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySummary}
                leftIcon={<Copy className="h-3.5 w-3.5" />}
              >
                Copy Summary
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              Reset Form
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExecuteAnalysis}
              isLoading={isProcessing}
              leftIcon={<Play className="h-3.5 w-3.5" />}
            >
              Run Analysis
            </Button>
          </div>
        }
      />

      {/* Synthetic Scenario Quick Load Bar */}
      <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs">
        <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
          Pre-load Synthetic Case:
        </span>
        {DEMO_SAMPLES.map((s, idx) => (
          <button
            key={idx}
            onClick={() => loadDemo(s)}
            className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Input Form vs Real-Time Inspection HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Inputs) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Investigation Input Target
                  </CardTitle>
                  <CardDescription>
                    Pasted data is analyzed locally. Inert plain-text parsing prevents code execution.
                  </CardDescription>
                </div>
                <button
                  onClick={() => setShowOptionsCard(!showOptionsCard)}
                  className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Options</span>
                  {showOptionsCard ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Analysis Configuration Toggles */}
              {showOptionsCard && (
                <div className="mt-3 p-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3 text-xs animate-in fade-in-50 duration-150">
                  <span className="font-semibold text-[var(--text-primary)] block">
                    Analysis Heuristic Engines
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Switch
                      label="Language Patterns"
                      description="Scan urgency, threats, financial demands"
                      checked={checkLanguage}
                      onChange={(e) => setCheckLanguage(e.target.checked)}
                    />
                    <Switch
                      label="URL Structural Inspection"
                      description="Evaluate IP hosts, Punycode, nesting"
                      checked={checkUrls}
                      onChange={(e) => setCheckUrls(e.target.checked)}
                    />
                    <Switch
                      label="Sender Consistency"
                      description="Flag lookalikes & free-mail claims"
                      checked={checkSender}
                      onChange={(e) => setCheckSender(e.target.checked)}
                    />
                    <Switch
                      label="Header RFC 822 Forensics"
                      description="Extract reported SPF, DKIM, DMARC"
                      checked={checkHeaders}
                      onChange={(e) => setCheckHeaders(e.target.checked)}
                    />
                  </div>
                  <div className="pt-2 border-t border-[var(--border-subtle)]">
                    <Switch
                      label="External Threat Intel (VirusTotal/Gemini)"
                      description="Requires active backend proxy; disabled by default for privacy"
                      checked={externalReputation}
                      onChange={(e) => setExternalReputation(e.target.checked)}
                    />
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {validationError && (
                <div className="p-3 rounded-lg border border-red-500/40 bg-red-950/20 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Sender & Subject Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Sender Email Address"
                  placeholder="e.g. security@secure-nationalbank-alerts.com"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  helperText="Leave blank if unknown"
                />
                <Input
                  label="Email Subject Line"
                  placeholder="e.g. URGENT: Your account has been suspended"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  helperText="Subject line helps assess context"
                />
              </div>

              {/* Tabs for Body, Raw Headers, Manual URLs */}
              <Tabs defaultValue="content" value={activeInputTab} onValueChange={(v) => setActiveInputTab(v as "content" | "headers" | "urls" | "options")}>
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabTrigger value="content" leftIcon={<FileText className="h-3.5 w-3.5" />}>
                    Email Body Text
                  </TabTrigger>
                  <TabTrigger value="headers" leftIcon={<Terminal className="h-3.5 w-3.5" />}>
                    Raw RFC 822 Headers
                  </TabTrigger>
                  <TabTrigger
                    value="urls"
                    leftIcon={<Globe2 className="h-3.5 w-3.5" />}
                  >
                    Target URLs ({allUrls.length})
                  </TabTrigger>
                </TabsList>

                {/* Tab: Body */}
                <TabContent value="content" className="space-y-3 pt-2">
                  <Textarea
                    label="Pasted Email Content"
                    placeholder="Paste the full text of the suspicious email here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    showCount
                    rows={9}
                  />
                </TabContent>

                {/* Tab: Headers */}
                <TabContent value="headers" className="space-y-3 pt-2">
                  <Textarea
                    label="Pasted Raw Headers"
                    placeholder={`From: alerts@nationalbank.com\nReply-To: phish@relay-node.net\nReturn-Path: bounce@attacker-relay.com\nAuthentication-Results: spf=fail dkim=fail dmarc=fail`}
                    value={rawHeaders}
                    onChange={(e) => setRawHeaders(e.target.value)}
                    isMonospace
                    rows={9}
                    helperText="Authentication records are parsed as reported in the headers without live DNS verification."
                  />
                </TabContent>

                {/* Tab: URLs */}
                <TabContent value="urls" className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--text-secondary)] block">
                      Add Additional URL for Inspection
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://suspicious-target.com/login"
                        value={manualUrlInput}
                        onChange={(e) => setManualUrlInput(e.target.value)}
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleAddManualUrl}
                        leftIcon={<Plus className="h-3.5 w-3.5" />}
                      >
                        Add URL
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                      URLs Queued for Structural Analysis ({allUrls.length})
                    </span>
                    {allUrls.length > 0 ? (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {allUrls.map((u, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs font-mono"
                          >
                            <span className="truncate text-cyan-300">{u}</span>
                            {manualUrls.includes(u) && (
                              <button
                                onClick={() => handleRemoveManualUrl(u)}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Remove manual URL"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] italic">
                        No URLs detected in body text yet. Paste body text or add manual links above.
                      </p>
                    )}
                  </div>
                </TabContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-3">
              <span className="text-xs text-[var(--text-muted)]">
                Local Engine: 9 Heuristic Categories Ready
              </span>
              <Button
                size="md"
                variant="primary"
                onClick={handleExecuteAnalysis}
                isLoading={isProcessing}
                leftIcon={<Play className="h-4 w-4" />}
                className="font-semibold"
              >
                Execute Analysis
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Processing HUD / Real Investigation Output */}
        <div className="lg:col-span-5 space-y-4">
          {isProcessing ? (
            <Card className="p-8 text-center space-y-4 animate-in fade-in-50 duration-200">
              <div className="h-12 w-12 rounded-full bg-[var(--accent-primary-subtle)] border border-[var(--accent-primary)]/40 flex items-center justify-center text-[var(--accent-primary)] mx-auto animate-spin">
                <Sliders className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Running Forensic Pipeline
                </h4>
                <p className="text-xs font-mono text-[var(--accent-primary)]">
                  {processingStep}
                </p>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] max-w-xs mx-auto">
                Applying deterministic heuristics across language urgency, sender consistency, and structural URL tokens.
              </p>
            </Card>
          ) : currentInvestigation ? (
            /* Results Presentation Window */
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              {/* Score Header Card */}
              <Card className="overflow-hidden border-[var(--border-medium)]">
                <div className="p-5 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                      Case Dossier {currentInvestigation.id}
                    </span>
                    <h3 className="text-base font-bold text-[var(--text-primary)] truncate mt-0.5">
                      {currentInvestigation.emailSubject || "Untitled Email Analysis"}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-mono truncate mt-0.5">
                      Sender: {currentInvestigation.senderEmail || "(None specified)"}
                    </p>
                  </div>
                  <RiskBadge
                    category={currentInvestigation.riskCategory}
                    score={currentInvestigation.riskScore}
                    size="md"
                  />
                </div>

                <div className="p-5 space-y-4">
                  <RiskGauge
                    score={currentInvestigation.riskScore}
                    category={currentInvestigation.riskCategory}
                  />

                  <div className="p-3.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1 text-xs">
                    <span className="font-semibold text-[var(--text-primary)] block">
                      Summary Assessment
                    </span>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {currentInvestigation.summary}
                    </p>
                  </div>

                  {/* Expandable Scoring Math & Category Caps Accordion */}
                  {currentInvestigation.scoreBreakdown && currentInvestigation.scoreBreakdown.length > 0 && (
                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        className="flex items-center justify-between w-full text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sliders className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                          Transparent Scoring Math & Category Caps
                        </span>
                        {showBreakdown ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                      {showBreakdown && (
                        <div className="mt-2 space-y-2 text-xs bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
                          <p className="text-[11px] text-[var(--text-muted)]">
                            Raw heuristic scores are confidence-weighted and strictly bounded by category caps to prevent false-positive score inflation:
                          </p>
                          <div className="space-y-1.5">
                            {currentInvestigation.scoreBreakdown.map((b) => (
                              <div
                                key={b.category}
                                className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]/50 last:border-0"
                              >
                                <span className="text-[var(--text-primary)] font-medium">
                                  {b.category}
                                </span>
                                <div className="flex items-center gap-2 font-mono text-[11px]">
                                  <span className="text-[var(--text-muted)]">
                                    raw: {b.rawPoints}
                                  </span>
                                  <span className="text-[var(--accent-primary)] font-semibold">
                                    capped: {b.cappedPoints} / {b.maxCap} pts
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Detailed Evidence Tabs */}
              <Card>
                <CardHeader className="pb-2 border-b border-[var(--border-subtle)]">
                  <Tabs defaultValue="findings" value={activeResultTab} onValueChange={(v) => setActiveResultTab(v as "findings" | "urls" | "headers" | "actions" | "metadata")}>
                    <TabsList className="w-full justify-start overflow-x-auto">
                      <TabTrigger value="findings">
                        Warnings ({currentInvestigation.warningSigns.length})
                      </TabTrigger>
                      <TabTrigger value="urls">
                        URLs ({currentInvestigation.urlFindings.length})
                      </TabTrigger>
                      <TabTrigger value="headers">
                        Headers ({currentInvestigation.headerFindings.length})
                      </TabTrigger>
                      <TabTrigger value="actions">Actions</TabTrigger>
                      <TabTrigger value="metadata">Audit</TabTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>

                <CardContent className="p-4">
                  {/* Tab: Warning Signs */}
                  {activeResultTab === "findings" && (
                    <div className="space-y-3">
                      {currentInvestigation.warningSigns.length > 0 ? (
                        currentInvestigation.warningSigns.map((w, i) => {
                          const severityVariant: Record<string, "red" | "amber" | "emerald" | "default" | "cyan"> = {
                            critical: "red",
                            high: "amber",
                            medium: "default",
                            low: "emerald",
                          };
                          const confVariant: Record<string, "red" | "amber" | "emerald" | "default" | "cyan"> = {
                            high: "emerald",
                            medium: "cyan",
                            low: "default",
                          };

                          return (
                            <div
                              key={i}
                              className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2 text-xs"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {w.id && (
                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                                      {w.id}
                                    </span>
                                  )}
                                  <span className="font-semibold text-[var(--text-primary)]">
                                    {w.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {w.severity && (
                                    <Badge variant={severityVariant[w.severity] || "default"} size="sm">
                                      {w.severity.toUpperCase()}
                                    </Badge>
                                  )}
                                  {w.confidence && (
                                    <Badge variant={confVariant[w.confidence] || "default"} size="sm">
                                      {w.confidence.toUpperCase()} CONF
                                    </Badge>
                                  )}
                                  <span className="font-mono text-[11px] font-semibold text-[var(--accent-primary)] px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
                                    +{w.severityPoints} pts
                                  </span>
                                </div>
                              </div>
                              <p className="text-[var(--text-secondary)] leading-relaxed">
                                {w.description}
                              </p>
                              {w.evidence && (
                                <div className="p-2 rounded bg-[var(--bg-surface-elevated)] text-[11px] font-mono text-amber-300 break-words border border-[var(--border-subtle)]">
                                  Evidence: {w.evidence}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center space-y-2 text-xs">
                          <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                          <h5 className="font-semibold text-[var(--text-primary)]">
                            No Warning Signs Triggered
                          </h5>
                          <p className="text-[var(--text-muted)]">
                            Local heuristic rules detected no patterns of urgency, credential demands, or sender impersonation.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab: URLs Inspection */}
                  {activeResultTab === "urls" && (
                    <div className="space-y-3">
                      {currentInvestigation.urlFindings.length > 0 ? (
                        currentInvestigation.urlFindings.map((uf, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <code className="font-mono text-xs text-cyan-300 break-all">
                                {uf.url}
                              </code>
                              {uf.isSuspicious ? (
                                <Badge variant="red" size="sm">SUSPICIOUS</Badge>
                              ) : (
                                <Badge variant="emerald" size="sm">CLEAN</Badge>
                              )}
                            </div>

                            {/* Prominent Deceptive Anchor Spoofing Warning Banner */}
                            {uf.isTextMismatch && (
                              <div className="p-2.5 rounded border border-red-500/40 bg-red-950/30 text-red-200 text-xs flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                                <div>
                                  <span className="font-bold text-red-300 block">Deceptive Link Anchor Mismatch</span>
                                  <span>
                                    The displayed text claims to lead to <strong>{uf.displayedText}</strong>, but the actual destination URL routes to <strong>{uf.url}</strong>.
                                  </span>
                                </div>
                              </div>
                            )}

                            {uf.displayedText && !uf.isTextMismatch && (
                              <div className="text-[11px] text-[var(--text-secondary)]">
                                <span className="text-[var(--text-muted)]">Anchor text:</span>{" "}
                                <span className="font-mono text-cyan-200">{uf.displayedText}</span>
                              </div>
                            )}

                            {uf.issues.length > 0 && (
                              <ul className="list-disc list-inside space-y-1 text-amber-200 text-[11px]">
                                {uf.issues.map((iss, idx) => (
                                  <li key={idx}>{iss}</li>
                                ))}
                              </ul>
                            )}

                            {/* Threat Intelligence Layer */}
                            {uf.reputation ? (
                              <div className="p-2.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2 text-xs">
                                <div className="flex items-center justify-between gap-1 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <Globe2 className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                                    <span className="font-semibold text-[var(--text-primary)]">
                                      VirusTotal v3 Intelligence
                                    </span>
                                  </div>
                                  <Badge
                                    variant={
                                      uf.reputation.verdict === "malicious"
                                        ? "red"
                                        : uf.reputation.verdict === "suspicious"
                                        ? "amber"
                                        : uf.reputation.verdict === "clean"
                                        ? "emerald"
                                        : "default"
                                    }
                                    size="sm"
                                  >
                                    {uf.reputation.verdict.toUpperCase()}
                                  </Badge>
                                </div>

                                {uf.reputation.stats && (
                                  <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--text-secondary)]">
                                    <span>
                                      Malicious: <strong className="text-red-400">{uf.reputation.stats.malicious}</strong> / {uf.reputation.stats.total}
                                    </span>
                                    <span>
                                      Suspicious: <strong className="text-amber-400">{uf.reputation.stats.suspicious}</strong>
                                    </span>
                                    <span>
                                      Clean: <strong className="text-emerald-400">{uf.reputation.stats.harmless}</strong>
                                    </span>
                                  </div>
                                )}

                                {uf.reputation.errorMessage && (
                                  <p className="text-[11px] text-amber-300">
                                    {uf.reputation.errorMessage}
                                  </p>
                                )}

                                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]/50">
                                  <span>{uf.reputation.isCached ? "Cached response" : "Fresh lookup"}</span>
                                  {uf.reputation.reportUrl && (
                                    <a
                                      href={uf.reputation.reportUrl}
                                      target="_blank"
                                      rel="noreferrer noopener"
                                      className="flex items-center gap-1 text-[var(--accent-primary)] hover:underline"
                                    >
                                      <span>VirusTotal Report</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="pt-1">
                                {consentPromptUrlIndex === i ? (
                                  <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-medium)] space-y-2.5 text-xs animate-in fade-in-50 duration-150">
                                    <div className="flex items-start gap-2">
                                      <Globe2 className="h-4 w-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-semibold text-[var(--text-primary)] block">
                                          External VirusTotal v3 Reputation Lookup
                                        </span>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
                                          Submitting this link shares the URL with Google VirusTotal. URLs may contain tracking identifiers or parameters.
                                        </p>
                                      </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[var(--text-secondary)]">
                                      <input
                                        type="checkbox"
                                        checked={stripTokensOnCheck}
                                        onChange={(e) => setStripTokensOnCheck(e.target.checked)}
                                        className="rounded border-[var(--border-medium)] bg-[var(--bg-secondary)] text-[var(--accent-primary)] focus:ring-0"
                                      />
                                      <span>Strip sensitive query tokens (e.g. token, key) before transmission</span>
                                    </label>

                                    <div className="flex items-center gap-2 justify-end pt-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setConsentPromptUrlIndex(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => handleCheckUrlThreatIntel(i, uf.url)}
                                        isLoading={checkingUrlIndex === i}
                                      >
                                        Authorize & Query
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-[var(--text-muted)]">
                                      Reputation: Not verified externally
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      leftIcon={<Globe2 className="h-3 w-3 text-[var(--accent-primary)]" />}
                                      onClick={() => setConsentPromptUrlIndex(i)}
                                      disabled={checkingUrlIndex !== null}
                                      className="text-[11px] h-7"
                                    >
                                      Check with VirusTotal
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)] flex flex-wrap justify-between gap-2">
                              <span>HTTPS: {uf.hasHttps ? "Yes" : "No (HTTP)"}</span>
                              <span>Punycode: {uf.isPunycode ? "Detected" : "None"}</span>
                              <span>Structural: {uf.isSuspicious ? "Suspicious" : "Normal"}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[var(--text-muted)] text-center py-4">
                          No URLs extracted or provided for inspection.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tab: Headers Inspection */}
                  {activeResultTab === "headers" && (
                    <div className="space-y-2.5">
                      {currentInvestigation.headerFindings.length > 0 ? (
                        currentInvestigation.headerFindings.map((hf, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-semibold text-[var(--text-primary)]">
                                {hf.headerName}
                              </span>
                              {hf.isSuspicious ? (
                                <Badge variant="red" size="sm">FLAGGED</Badge>
                              ) : (
                                <Badge variant="emerald" size="sm">REPORTED</Badge>
                              )}
                            </div>
                            {hf.value && (
                              <code className="block text-[11px] font-mono text-[var(--text-muted)] break-all">
                                {hf.value}
                              </code>
                            )}
                            {hf.finding && (
                              <p className="text-[11px] text-[var(--text-secondary)]">
                                {hf.finding}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[var(--text-muted)] text-center py-4">
                          No RFC 822 email headers were provided for parsing.
                        </p>
                      )}
                      <p className="text-[10px] text-[var(--text-muted)] italic pt-2">
                        * Authentication records reflect results reported in supplied headers without independent DNS validation.
                      </p>
                    </div>
                  )}

                  {/* Tab: Recommended Actions */}
                  {activeResultTab === "actions" && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)] block">
                        Recommended Security Next Steps
                      </span>
                      <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                        {currentInvestigation.recommendedActions.map((act, i) => (
                          <li key={i} className="flex items-start gap-2 p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                            <span className="font-mono font-bold text-[var(--accent-primary)] shrink-0">
                              0{i + 1}.
                            </span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tab: Audit & Transparency */}
                  {activeResultTab === "metadata" && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-semibold text-emerald-400 block mb-1">
                          Completed Checks ({currentInvestigation.completedChecks.length})
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[var(--text-secondary)] text-[11px]">
                          {currentInvestigation.completedChecks.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-subtle)]">
                        <span className="font-semibold text-amber-400 block mb-1">
                          Incomplete or Unavailable Checks ({currentInvestigation.incompletedChecks.length})
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[var(--text-muted)] text-[11px]">
                          {currentInvestigation.incompletedChecks.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-subtle)]">
                        <span className="font-semibold text-cyan-400 block mb-1">
                          Uncertainty Disclosures
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[var(--text-muted)] text-[11px]">
                          {currentInvestigation.uncertainties.map((u, i) => (
                            <li key={i}>{u}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Idle Ready Standby State */
            <Card className="p-8 text-center space-y-4 border-dashed border-[var(--border-medium)] bg-[var(--bg-surface)]/50">
              <div className="h-12 w-12 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] mx-auto">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Analyzer Standing By
                </h4>
                <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                  Paste an email message on the left or select a pre-loaded synthetic scenario to run the deterministic detection engine.
                </p>
              </div>
              <div className="pt-2 flex justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadDemo(DEMO_SAMPLES[0])}
                  leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                >
                  Load Bank Phish Demo
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
