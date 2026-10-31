"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Lock,
  Eye,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Terminal,
  Cpu,
  Globe2,
  Server,
  Layers,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, RiskBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ThemeCustomizer } from "@/components/common/ThemeCustomizer";

// Interactive Demo Scenarios
const PREVIEW_SCENARIOS = [
  {
    id: "bank-phish",
    label: "National Bank Phishing",
    category: "CRITICAL" as const,
    score: 85,
    sender: "security@secure-nationalbank-alerts.com",
    subject: "URGENT: Your account has been suspended",
    body: `Dear Valued Customer,\n\nWe have detected unusual activity on your National Bank account. Your account has been temporarily suspended to protect you.\n\nYou must verify your identity within 24 hours or your account will be permanently closed.\n\nClick here to verify: http://secure-nationalbank-verify.login-now.com/verify\n\nPlease provide your account number, password, and one-time password (OTP).\n\nNational Bank Security Team`,
    url: "http://secure-nationalbank-verify.login-now.com/verify",
    urlIssues: [
      "Uses unencrypted HTTP scheme (not HTTPS)",
      "Deep subdomain nesting (4 labels in host: login-now.com)",
      "Suspicious keyword pattern detected: 'secure-nationalbank-verify'",
    ],
    headers: [
      { name: "From", value: "National Bank Security <security@secure-nationalbank-alerts.com>", status: "suspicious", note: "Lookalike domain impersonating nationalbank.com" },
      { name: "Reply-To", value: "support-inbox-09@relay-redirect.net", status: "suspicious", note: "Reply-To domain differs completely from From address" },
      { name: "SPF (Reported)", value: "softfail (domain does not designate IP)", status: "warning", note: "Reported in Authentication-Results header" },
      { name: "DKIM (Reported)", value: "fail (signature did not verify)", status: "suspicious", note: "Reported in Authentication-Results header" },
      { name: "DMARC (Reported)", value: "fail (p=reject)", status: "suspicious", note: "Reported in Authentication-Results header" },
    ],
    findings: [
      { title: "Lookalike Domain Impersonation", points: 30, desc: "Sender domain 'secure-nationalbank-alerts.com' mimics legitimate banking brand." },
      { title: "Urgency Coercion Language", points: 20, desc: "Pressures recipient with '24 hours' and 'account permanently closed' ultimatum." },
      { title: "Credential & OTP Demand", points: 20, desc: "Directly requests banking password and SMS OTP—institutions never solicit via email." },
      { title: "Suspicious HTTP Link", points: 15, desc: "Target link lacks TLS encryption and masks destination behind multi-tiered subdomains." },
    ],
  },
  {
    id: "prize-scam",
    label: "International Prize Scam",
    category: "HIGH" as const,
    score: 68,
    sender: "winners@prize-claims-international.com",
    subject: "Congratulations! Selected as our lucky winner",
    body: `CONGRATULATIONS!\n\nYou have won $500,000 in our international lottery draw! You were selected from millions of participants.\n\nTo claim your prize, send your full name, bank details, and an administrative processing fee of $150 via Western Union or Bitcoin.\n\nThis offer expires today. Claim your reward now!\n\nInternational Prize Committee`,
    url: "https://claim-reward-intl.org/payout",
    urlIssues: [
      "Newly registered domain pattern",
      "Contains financial payout keywords in URL path",
    ],
    headers: [
      { name: "From", value: "Prize Committee <winners@prize-claims-international.com>", status: "warning", note: "Generic lottery claim organization" },
      { name: "Reply-To", value: "claims-agent-private@gmail.com", status: "suspicious", note: "Organization claims sent to personal free email address" },
      { name: "SPF (Reported)", value: "pass", status: "pass", note: "Reported in headers" },
      { name: "DKIM (Reported)", value: "pass", status: "pass", note: "Reported in headers" },
      { name: "DMARC (Reported)", value: "neutral", status: "neutral", note: "No enforcement policy specified" },
    ],
    findings: [
      { title: "Advance Fee Fraud Vector", points: 20, desc: "Solicits upfront payment ($150) via Western Union/Bitcoin to receive an alleged reward." },
      { title: "Prize Lure Social Engineering", points: 18, desc: "Claims unsolicited lottery winnings of $500,000 without prior ticket entry." },
      { title: "Sender Mismatch to Free Mail", points: 20, desc: "Official business claims reply to a personal Gmail inbox." },
      { title: "Urgency Expiration Lure", points: 10, desc: "Uses 'expires today' pressure tactic." },
    ],
  },
  {
    id: "legitimate",
    label: "Legitimate Bank Statement",
    category: "LOW" as const,
    score: 0,
    sender: "notifications@mybank.com",
    subject: "Your monthly statement is ready",
    body: `Hello,\n\nYour monthly account statement for October 2024 is now available in your online banking portal.\n\nTo view your statement, please log in to your account at mybank.com using your usual credentials.\n\nIf you have questions, contact our support team at support@mybank.com or call 1-800-MYBANK.\n\nThank you for banking with us.\n\nMyBank Customer Services`,
    url: "https://mybank.com/statements/october",
    urlIssues: [],
    headers: [
      { name: "From", value: "MyBank Notifications <notifications@mybank.com>", status: "pass", note: "Consistent official domain" },
      { name: "Reply-To", value: "support@mybank.com", status: "pass", note: "Consistent domain matching sender" },
      { name: "SPF (Reported)", value: "pass", status: "pass", note: "Reported in Authentication-Results" },
      { name: "DKIM (Reported)", value: "pass", status: "pass", note: "Valid cryptographic signature reported" },
      { name: "DMARC (Reported)", value: "pass (p=reject)", status: "pass", note: "Domain aligned with strict policy" },
    ],
    findings: [],
  },
];

const emptySubscribe = () => () => {};

export default function LandingPage() {
  const currentYear = useSyncExternalStore(
    emptySubscribe,
    () => new Date().getFullYear(),
    () => 2026
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState("bank-phish");
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<"overview" | "content" | "urls" | "headers">("overview");

  const currentScenario =
    PREVIEW_SCENARIOS.find((s) => s.id === selectedScenarioId) || PREVIEW_SCENARIOS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] selection:bg-[var(--accent-primary)] selection:text-slate-950">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. NAVIGATION BAR
      ────────────────────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Main Navigation"
        className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/85 backdrop-blur-md transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-lg p-1">
            <div className="h-9 w-9 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--accent-primary)] shadow-sm group-hover:border-[var(--accent-primary)] transition-colors">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wider text-[var(--text-primary)] uppercase font-mono">
                SENTINEL AI
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-tight">
                EMAIL THREAT FORENSICS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">
              How It Works
            </a>
            <a href="#demo-preview" className="hover:text-[var(--text-primary)] transition-colors">
              Interactive Demo
            </a>
            <a href="#evidence-first" className="hover:text-[var(--text-primary)] transition-colors">
              Evidence-First
            </a>
            <a href="#privacy" className="hover:text-[var(--text-primary)] transition-colors">
              Security & Privacy
            </a>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeCustomizer />
            <Link href="/dashboard">
              <Button size="sm" variant="ghost" className="text-xs">
                Open Dashboard
              </Button>
            </Link>
            <Link href="/analyzer">
              <Button size="sm" variant="primary" className="text-xs shadow-sm font-semibold">
                Analyze an Email
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeCustomizer />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-2 text-sm text-[var(--text-secondary)]">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[var(--text-primary)]"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[var(--text-primary)]"
              >
                How It Works
              </a>
              <a
                href="#demo-preview"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[var(--text-primary)]"
              >
                Interactive Demo
              </a>
              <a
                href="#evidence-first"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[var(--text-primary)]"
              >
                Evidence-First
              </a>
              <a
                href="#privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[var(--text-primary)]"
              >
                Security & Privacy
              </a>
            </nav>
            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="secondary" className="w-full text-xs">
                  Open Dashboard
                </Button>
              </Link>
              <Link href="/analyzer" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="primary" className="w-full text-xs">
                  Analyze an Email
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. HERO SECTION WITH REALISTIC PRODUCT PREVIEW
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle Background Cyber Grid Glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--bg-surface)] border border-[var(--border-medium)] text-[var(--accent-primary)] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                Evidence-first email security
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15]">
                Investigate suspicious emails.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] via-emerald-400 to-cyan-400">
                  Understand the evidence.
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                SENTINEL AI helps you examine suspicious email content, identify warning signs,
                inspect available technical evidence, and understand why a message may deserve closer
                attention.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link href="/analyzer">
                  <Button
                    size="lg"
                    variant="primary"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="font-semibold shadow-lg text-sm"
                  >
                    Analyze an Email
                  </Button>
                </Link>
                <a href="#demo-preview">
                  <Button size="lg" variant="secondary" className="text-sm">
                    Explore the Platform
                  </Button>
                </a>
              </div>

              {/* Value Signals */}
              <div className="pt-4 grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] max-w-md mx-auto lg:mx-0 text-left">
                <div>
                  <div className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    Deterministic
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Explainable heuristics
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    Local-First
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Zero data exfiltration
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs font-bold text-[var(--text-primary)]">
                    No Secrets
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Quarantined proxy
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Product Preview (Sample Investigation) */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-medium)] p-5 shadow-2xl backdrop-blur-sm">
                {/* Window Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-[11px] text-[var(--text-muted)]">
                      SENTINEL_INSPECT // CASE-2024-884
                    </span>
                  </div>
                  <Badge variant="cyan" size="sm" className="font-mono text-[10px]">
                    DEMO PREVIEW
                  </Badge>
                </div>

                {/* Case Subject & Risk Header */}
                <div className="flex items-start justify-between gap-4 mb-4 bg-[var(--bg-secondary)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">
                      Target Subject
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">
                      URGENT: Your account has been suspended
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                      From: security@secure-nationalbank-alerts.com
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <RiskBadge category="CRITICAL" score={85} size="sm" />
                  </div>
                </div>

                {/* Forensic Indicator Feed */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                    Observed Warning Signs (4 Identified)
                  </span>

                  <div className="space-y-1.5">
                    <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-red-500/30 flex items-start gap-2.5 text-xs">
                      <AlertOctagon className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-red-200 text-[11px]">
                            Lookalike Domain Impersonation
                          </span>
                          <span className="font-mono text-[10px] text-red-300">+30 pts</span>
                        </div>
                        <p className="text-[11px] text-red-300/80 mt-0.5 leading-snug">
                          Sender mimics nationalbank.com with registered deceptive slug.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-orange-500/30 flex items-start gap-2.5 text-xs">
                      <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-orange-200 text-[11px]">
                            Credential & OTP Solicitation
                          </span>
                          <span className="font-mono text-[10px] text-orange-300">+20 pts</span>
                        </div>
                        <p className="text-[11px] text-orange-300/80 mt-0.5 leading-snug">
                          Requests account login, PIN, and two-factor code over email.
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-start gap-2.5 text-xs">
                      <Globe2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[var(--text-primary)] text-[11px]">
                            Unencrypted HTTP Link Scheme
                          </span>
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">+15 pts</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate font-mono">
                          http://secure-nationalbank-verify.login-now.com/verify
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Status Indicators */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Local Rules Applied</span>
                  </div>
                  <span>Capped at 85/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. INTERACTIVE PRODUCT PREVIEW CONSOLE
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="demo-preview"
        aria-label="Interactive Product Preview"
        className="py-16 md:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
              <Sparkles className="h-3.5 w-3.5" />
              INTERACTIVE FORENSICS CONSOLE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Explore an Evidence-Backed Investigation
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Test how SENTINEL AI dissects emails across four technical categories. This
              preview executes 100% locally with synthetic test cases—no external APIs are queried.
            </p>
          </div>

          {/* Scenario Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PREVIEW_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => setSelectedScenarioId(scen.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border ${
                  selectedScenarioId === scen.id
                    ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border-[var(--accent-primary)] shadow-sm"
                    : "bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)]"
                }`}
              >
                <span>{scen.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                    scen.category === "CRITICAL"
                      ? "bg-red-950/60 text-red-300 border border-red-800/60"
                      : scen.category === "HIGH"
                      ? "bg-orange-950/60 text-orange-300 border border-orange-800/60"
                      : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                  }`}
                >
                  {scen.score}/100
                </span>
              </button>
            ))}
          </div>

          {/* Console Workbench */}
          <div className="rounded-xl border border-[var(--border-medium)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden">
            {/* Top Toolbar */}
            <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--text-muted)]">Active Case:</span>
                <span className="font-semibold text-xs text-[var(--text-primary)]">
                  {currentScenario.subject}
                </span>
                <RiskBadge category={currentScenario.category} score={currentScenario.score} size="sm" />
              </div>

              {/* Evidence Category Switches */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                {(
                  [
                    { id: "overview", label: "Overview", icon: <Layers className="h-3.5 w-3.5" /> },
                    { id: "content", label: "Email Content", icon: <FileText className="h-3.5 w-3.5" /> },
                    { id: "urls", label: "URLs", icon: <Globe2 className="h-3.5 w-3.5" /> },
                    { id: "headers", label: "Headers", icon: <Terminal className="h-3.5 w-3.5" /> },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveEvidenceTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeEvidenceTab === tab.id
                        ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] shadow-sm font-semibold"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Tab Panels */}
            <div className="p-6">
              {/* Tab: OVERVIEW */}
              {activeEvidenceTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-150">
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Identified Risk Findings ({currentScenario.findings.length})
                    </h4>
                    {currentScenario.findings.length > 0 ? (
                      <div className="space-y-2.5">
                        {currentScenario.findings.map((f, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <span className="font-semibold text-xs text-[var(--text-primary)] block">
                                {f.title}
                              </span>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                {f.desc}
                              </p>
                            </div>
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--accent-primary)] shrink-0 border border-[var(--border-subtle)]">
                              +{f.points} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center space-y-2">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                        <h5 className="text-xs font-semibold text-[var(--text-primary)]">
                          Zero Suspicious Indicators Detected
                        </h5>
                        <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                          The message body, sender routing, and structural links demonstrated no
                          patterns of coercion or impersonation.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3">
                      <span className="text-xs font-semibold text-[var(--text-primary)] block">
                        Evaluation Metadata
                      </span>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Heuristic Score:</span>
                          <span className="font-mono font-semibold text-[var(--text-primary)]">
                            {currentScenario.score} / 100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Category:</span>
                          <span className="font-mono font-semibold text-[var(--text-primary)]">
                            {currentScenario.category}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Sender Domain:</span>
                          <span className="font-mono text-[11px] text-[var(--text-secondary)] truncate max-w-[150px]">
                            {currentScenario.sender.split("@")[1]}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">External Threat Intel:</span>
                          <span className="font-mono text-[10px] text-amber-400">
                            Quarantined (Opt-In)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-cyan-500/20 bg-cyan-950/10 text-xs space-y-1">
                      <span className="font-semibold text-cyan-200 block">
                        Forensic Transparency Note
                      </span>
                      <p className="text-[11px] text-cyan-300/80 leading-relaxed">
                        Scores represent a capped heuristic tally of observable indicators, not a
                        statistical guarantee of safety or fraud.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: EMAIL CONTENT */}
              {activeEvidenceTab === "content" && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Sender: <strong className="text-[var(--text-primary)] font-mono">{currentScenario.sender}</strong></span>
                    <span>Subject: <strong className="text-[var(--text-primary)]">{currentScenario.subject}</strong></span>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap selection:bg-amber-500/30">
                    {currentScenario.body}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    * Content is rendered as inert plain-text. Embedded HTML elements, scripts, and trackers are stripped prior to display.
                  </p>
                </div>
              )}

              {/* Tab: URLS */}
              {activeEvidenceTab === "urls" && (
                <div className="space-y-4 animate-in fade-in-50 duration-150">
                  <div className="p-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
                    <span className="text-xs font-medium text-[var(--text-muted)] block">
                      Extracted Link Target
                    </span>
                    <code className="text-xs font-mono text-cyan-300 block break-all">
                      {currentScenario.url}
                    </code>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-[var(--text-primary)]">
                      Structural Heuristic Inspection
                    </h5>
                    {currentScenario.urlIssues.length > 0 ? (
                      <div className="space-y-1.5">
                        {currentScenario.urlIssues.map((issue, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-amber-500/20 text-xs flex items-center gap-2 text-amber-200"
                          >
                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs flex items-center gap-2 text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span>URL structure conforms to standard HTTPS conventions without anomalous patterns.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: HEADERS */}
              {activeEvidenceTab === "headers" && (
                <div className="space-y-3 animate-in fade-in-50 duration-150">
                  <span className="text-xs text-[var(--text-muted)] block">
                    Reported Email Authentication & Routing Hops
                  </span>
                  <div className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
                    {currentScenario.headers.map((h, i) => (
                      <div key={i} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-mono font-semibold text-[var(--text-primary)]">
                            {h.name}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--text-muted)] block">
                            {h.value}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-[var(--text-secondary)] italic">
                            {h.note}
                          </span>
                          {h.status === "suspicious" && (
                            <Badge variant="red" size="sm">FAIL</Badge>
                          )}
                          {h.status === "warning" && (
                            <Badge variant="amber" size="sm">WARN</Badge>
                          )}
                          {h.status === "pass" && (
                            <Badge variant="emerald" size="sm">PASS</Badge>
                          )}
                          {h.status === "neutral" && (
                            <Badge variant="default" size="sm">NEUTRAL</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    * Authentication results reflect values reported in the supplied email headers. Independent DNS cryptographic validation cannot be performed from pasted text alone.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. PROBLEM & VALUE PROPOSITION
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="problem-value"
        aria-label="Problem and Value Proposition"
        className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Why Suspicious Emails Deserve Careful Investigation
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Phishing techniques have evolved past obvious spelling errors. Sophisticated campaigns
            weaponize legitimate infrastructure, lookalike domains, and psychological coercion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3.5 hover:border-[var(--border-medium)] transition-colors">
            <div className="h-10 w-10 rounded-lg bg-orange-950/40 border border-orange-800/60 flex items-center justify-center text-orange-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Suspicious Language & Urgency
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Urgent demands, threats of account closure within 24 hours, unusual payment coercion,
              and security alert impersonations are deliberate social-engineering tactics designed to
              induce hasty mistakes.
            </p>
          </Card>

          <Card className="p-6 space-y-3.5 hover:border-[var(--border-medium)] transition-colors">
            <div className="h-10 w-10 rounded-lg bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Globe2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Technical Indicators & Spoofs
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Links, sender domains, and email routing hops often betray fraudulent intent.
              Punycode internationalization, numerical character swaps (`paypa1`), and
              mismatched `Reply-To` addresses reveal hidden infrastructure.
            </p>
          </Card>

          <Card className="p-6 space-y-3.5 hover:border-[var(--border-medium)] transition-colors">
            <div className="h-10 w-10 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Explainable, Actionable Findings
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Black-box AI safety scores fail to educate users. By surfacing the exact evidence,
              capped category weights, and clear recommended actions behind every warning, users
              make confident, defensible security decisions.
            </p>
          </Card>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. HOW IT WORKS (3-STEP PIPELINE)
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        aria-label="How It Works"
        className="py-16 md:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              How SENTINEL AI Works
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              A transparent three-step forensic workflow from raw message input to actionable
              intelligence dossier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 relative">
              <div className="font-mono text-2xl font-bold text-[var(--accent-primary)]">
                01
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Submit Email Content
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Paste suspicious email text, sender email address, and optional raw RFC 822 email
                headers into the analyzer. Direct `.eml` file upload is scheduled on the product roadmap.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 relative">
              <div className="font-mono text-2xl font-bold text-[var(--accent-primary)]">
                02
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Deterministic Investigation
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                The engine evaluates content against 9 deterministic rule categories: urgency,
                credential demands, financial pressure, lookalike domains, URL structure, and
                reported authentication results.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 relative">
              <div className="font-mono text-2xl font-bold text-[var(--accent-primary)]">
                03
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Review Evidence & Next Steps
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Explore the verified indicators, understand the reasoning behind each warning,
                review checks that could not be verified, and optionally export a formal PDF report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. FEATURE SHOWCASE (GENUINE STATUS DISCLOSURE)
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="features"
        aria-label="Platform Features"
        className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Core Platform Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Honest, technically accurate descriptions of all current and planned functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FileText className="h-5 w-5 text-emerald-400" />
                <Badge variant="emerald" size="sm">Available & Usable</Badge>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Email Content Analysis
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Rule-based detection of social-engineering tactics including artificial deadlines,
                credential/OTP solicitations, lottery rewards, and security alert impersonation.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
              Engine: Pure Local Heuristics
            </div>
          </Card>

          {/* Feature 2 */}
          <Card className="p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Globe2 className="h-5 w-5 text-emerald-400" />
                <Badge variant="emerald" size="sm">Available & Usable</Badge>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Structural URL Inspection
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Parses links for IP hostnames, Punycode IDN spoofing (`xn--`), deep subdomain
                nesting (&ge;4 levels), lookalikes, URL shorteners, and HTTP vs HTTPS indicators.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
              Engine: Local URL Parser
            </div>
          </Card>

          {/* Feature 3 */}
          <Card className="p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Terminal className="h-5 w-5 text-emerald-400" />
                <Badge variant="emerald" size="sm">Available & Usable</Badge>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Header Forensics & Authentication
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Extracts `From`, `Reply-To`, `Return-Path`, and reported SPF, DKIM, and DMARC
                records from raw RFC 822 headers without fabricating unperformed DNS checks.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
              Engine: RFC 822 Header Parser
            </div>
          </Card>

          {/* Feature 4 */}
          <Card className="p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Cpu className="h-5 w-5 text-emerald-400" />
                <Badge variant="emerald" size="sm">Available & Usable</Badge>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Explainable Risk Scorer
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Aggregates warning points across 9 distinct categories with strict caps (max 100
                total) to avoid double-counting. Classifies threats into LOW, MODERATE, HIGH, CRITICAL.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
              Engine: Cap-Based Scorer
            </div>
          </Card>

          {/* Feature 5 */}
          <Card className="p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Server className="h-5 w-5 text-cyan-400" />
                <Badge variant="cyan" size="sm">Config-Dependent</Badge>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Threat Intelligence Proxy
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Server-side proxy routes for querying VirusTotal v3 URL reputation and Google Gemini
                AI educational explanations. Requires configuring API keys in the Node.js backend.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
              Backend: server.js Express Proxy
            </div>
          </Card>

          {/* Feature 6 */}
          <Card className="p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FileText className="h-5 w-5 text-amber-400" />
                <Badge variant="amber" size="sm">Roadmap / Planned</Badge>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Automated .EML File Ingestion
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Direct drag-and-drop parsing of raw `.eml` and `.msg` email archive files directly in
                browser memory with automatic attachment extraction.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
              Status: Phase 4 Roadmap
            </div>
          </Card>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          7. EVIDENCE-FIRST TRUST SECTION
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="evidence-first"
        aria-label="Evidence-First Security Principles"
        className="py-16 md:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Philosophy & Standards */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--bg-surface)] border border-[var(--border-medium)] text-[var(--accent-primary)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                CORE PHILOSOPHY
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Security Decisions Should Be Backed by Evidence
              </h2>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Cybersecurity tools often present a single opaque percentage and ask users to trust it.
                SENTINEL AI rejects this approach. Every finding is anchored in observable data, and
                system limitations are explicitly surfaced.
              </p>

              <div className="space-y-3 text-xs text-[var(--text-secondary)]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)]">Observable Indicators:</strong> Every warning references the exact text excerpt, header key, or URL token that triggered it.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)]">Unavailable Checks Flagged:</strong> Unperformed checks are marked as &quot;Not Checked&quot;—never falsely green or assumed safe.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)]">Heuristic Tallies, Not Probabilities:</strong> Risk scores are heuristic severity summaries, not statistically calibrated probabilities of fraud.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)]">No Fabricated Intelligence:</strong> If external services (VirusTotal/Gemini) are unconfigured, this is stated clearly without synthetic filler.
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Technical Evidence Card */}
            <div className="lg:col-span-5">
              <Card className="p-6 space-y-4 border-[var(--border-medium)] bg-[var(--bg-surface)]">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    EVIDENCE DISCLOSURE
                  </span>
                  <Badge variant="cyan" size="sm">Audit Trail</Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">
                      Triggered Rule
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      Sender Inconsistency // Free Provider Mismatch
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1 font-mono text-[11px]">
                    <div className="text-[var(--text-muted)]">Extracted Excerpt:</div>
                    <div className="text-red-300">
                      From: security@chase-support-official.com &lt;agent92@gmail.com&gt;
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[11px] text-[var(--text-muted)]">
                    <span>Severity Weight: <strong>+25 pts</strong></span>
                    <span>Category Cap: <strong>30 pts</strong></span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          8. PRIVACY AND RESPONSIBLE ANALYSIS
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="privacy"
        aria-label="Security and Privacy Architecture"
        className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
      >
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
            <Lock className="h-3.5 w-3.5" />
            PRIVACY FIRST
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Responsible Security Architecture
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Email contents often contain highly sensitive personal and financial data. Our platform
            is architected to respect data privacy boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--accent-primary)]">
              <Lock className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">
              Zero Automatic Exfiltration
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Email content remains strictly in your local browser runtime. No third-party network requests are triggered without explicit user action.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--accent-primary)]">
              <Server className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">
              Quarantined Server Secrets
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              API credentials (VirusTotal, Gemini) reside exclusively in the backend server environment. Zero client-side API key leakage.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--accent-primary)]">
              <XCircle className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">
              No Script Execution
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              HTML formatting and active script tags are never rendered into executable browser DOM, neutralizing web beacon trackers and zero-click exploits.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--accent-primary)]">
              <Globe2 className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">
              No Automated Link Pings
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Extracted links are analyzed structurally offline. The system never automatically sends HTTP requests to suspicious URLs that could alert an attacker.
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          9. FINAL CALL TO ACTION
      ────────────────────────────────────────────────────────────────────────── */}
      <section
        id="cta"
        aria-label="Call to Action"
        className="py-16 md:py-24 border-t border-[var(--border-subtle)] bg-gradient-to-b from-[var(--bg-secondary)]/30 to-[var(--bg-surface)]/60"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="h-12 w-12 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--accent-primary)] mx-auto shadow-md">
            <Shield className="h-6 w-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Turn suspicious emails into understandable evidence.
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Start an investigation, review the available indicators, and make your next security
            decision with verifiable technical context.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/analyzer">
              <Button
                size="lg"
                variant="primary"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="font-semibold shadow-lg text-sm"
              >
                Start an Investigation
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="secondary" className="text-sm">
                Explore Features
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          10. FOOTER
      ────────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand Info */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--accent-primary)]">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-[var(--text-primary)] font-mono">
                  SENTINEL AI
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
                Evidence-driven email threat detection and digital forensics platform.
                Transparent, deterministic heuristic inspection for preliminary analysis and security education.
              </p>
            </div>

            {/* Column 2: Platform Links */}
            <div className="space-y-2">
              <span className="font-semibold text-xs text-[var(--text-primary)] font-mono uppercase tracking-wider block">
                Platform
              </span>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link href="/analyzer" className="hover:text-[var(--text-primary)] transition-colors">
                    Threat Analyzer
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">
                    Dashboard Overview
                  </Link>
                </li>
                <li>
                  <Link href="/investigations" className="hover:text-[var(--text-primary)] transition-colors">
                    Investigation Logs
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="hover:text-[var(--text-primary)] transition-colors">
                    Forensic Reports
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Transparency & Forensics */}
            <div className="space-y-2">
              <span className="font-semibold text-xs text-[var(--text-primary)] font-mono uppercase tracking-wider block">
                Transparency
              </span>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <a href="#evidence-first" className="hover:text-[var(--text-primary)] transition-colors">
                    Forensic Methodology
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-[var(--text-primary)] transition-colors">
                    Security & Privacy
                  </a>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-[var(--text-primary)] transition-colors">
                    Customization & Tokens
                  </Link>
                </li>
                <li>
                  <Link href="/threat-intel" className="hover:text-[var(--text-primary)] transition-colors">
                    Threat Intel Proxy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Disclaimer & Copyright */}
          <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p className="text-[var(--text-muted)] text-center sm:text-left">
              &copy; {currentYear} SENTINEL AI. All rights reserved.
            </p>
            <p className="text-[var(--text-muted)] max-w-xl text-center sm:text-right leading-relaxed">
              Disclaimer: Automated heuristic analysis can produce false positives and false negatives.
              SENTINEL AI provides preliminary technical evidence and does not replace commercial enterprise security solutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
