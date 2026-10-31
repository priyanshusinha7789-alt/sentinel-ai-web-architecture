"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  SearchCode,
  FileCheck2,
  Cpu,
  ArrowRight,
  ExternalLink,
  Flame,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import {
  PageHeader,
  MetricCard,
  RiskBadge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  TabsList,
  TabTrigger,
  TabContent,
  EmptyState,
} from "@/components/ui";

const SYNTHETIC_DEMO_CASES = [
  {
    id: "DEMO-01",
    scenario: "National Bank Impersonation",
    sender: "security@secure-nationalbank-alerts.com",
    subject: "URGENT: Your account has been suspended",
    threatCategory: "CRITICAL" as const,
    score: 85,
    indicators: ["Lookalike Domain", "Credential Request", "Urgency Threat"],
  },
  {
    id: "DEMO-02",
    scenario: "International Prize Claim Scam",
    sender: "winners@prize-claims-international.com",
    subject: "Congratulations! Selected as our lucky winner",
    threatCategory: "HIGH" as const,
    score: 68,
    indicators: ["Prize Lure", "Advance Fee Request", "Financial Pressure"],
  },
  {
    id: "DEMO-03",
    scenario: "Legitimate Monthly Statement",
    sender: "notifications@mybank.com",
    subject: "Your monthly statement is ready",
    threatCategory: "LOW" as const,
    score: 0,
    indicators: ["Clean Sender", "No Credential Demands", "HTTPS Links"],
  },
  {
    id: "DEMO-04",
    scenario: "Apple ID Phishing Verification",
    sender: "no-reply@apple-id-support-verification.com",
    subject: "Action Required: Verify your Apple ID",
    threatCategory: "CRITICAL" as const,
    score: 90,
    indicators: ["Brand Impersonation", "Punycode/Shortener", "Login Coercion"],
  },
];

export default function OverviewPage() {
  const router = useRouter();
  const [dataView, setDataView] = useState<"demo" | "empty">("demo");

  return (
    <AppShell>
      <PageHeader
        title="Security Forensics Dashboard"
        subtitle="Explainable email threat detection and digital forensics architecture. Transparent heuristic analysis with zero unconsented data exfiltration."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard" },
        ]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
            LIVE DESIGN SYSTEM FOUNDATION
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/analyzer">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Launch Analyzer
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Investigations Logged"
          value={dataView === "demo" ? "4" : "0"}
          subtext="Offline synthetic fixtures"
          icon={<SearchCode className="h-4 w-4 text-[var(--accent-primary)]" />}
          highlight="emerald"
        />
        <MetricCard
          title="High & Critical Threats"
          value={dataView === "demo" ? "3" : "0"}
          subtext="Confirmed social engineering"
          icon={<ShieldAlert className="h-4 w-4 text-orange-400" />}
          highlight="rose"
        />
        <MetricCard
          title="Verified Safe Messages"
          value={dataView === "demo" ? "1" : "0"}
          subtext="No suspicious vectors"
          icon={<FileCheck2 className="h-4 w-4 text-emerald-400" />}
          highlight="cyan"
        />
        <MetricCard
          title="Active Heuristic Rules"
          value="9"
          subtext="Deterministic rule-based caps"
          icon={<Cpu className="h-4 w-4 text-cyan-400" />}
          highlight="none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Investigation Feed
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Demonstration scenarios loaded directly from shared core models
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <button
                onClick={() => setDataView("demo")}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  dataView === "demo"
                    ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] font-medium"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Sample Data
              </button>
              <button
                onClick={() => setDataView("empty")}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  dataView === "empty"
                    ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] font-medium"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Empty State
              </button>
            </div>
          </div>

          {dataView === "demo" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case / Scenario</TableHead>
                  <TableHead>Sender Domain</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Threat Vectors</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SYNTHETIC_DEMO_CASES.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <span className="font-semibold text-[var(--text-primary)] block">
                          {item.scenario}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] font-mono block">
                          {item.id} · {item.subject}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                        {item.sender}
                      </span>
                    </TableCell>
                    <TableCell>
                      <RiskBadge
                        score={item.score}
                        category={item.threatCategory}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.indicators.map((tag, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href="/analyzer">
                        <Button size="icon-sm" variant="ghost" title="Analyze case">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No Investigations Recorded"
              description="Your audit log is currently clean. Analyze an email or raw header set to generate an explainable forensic assessment."
              actionLabel="Launch Threat Analyzer"
              onAction={() => router.push("/analyzer")}
              secondaryActionLabel="Load Demo Cases"
              onSecondaryAction={() => setDataView("demo")}
            />
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Flame className="h-4 w-4 text-[var(--accent-primary)]" />
                Heuristic Scoring Limits
              </CardTitle>
              <CardDescription>
                Cap points per category to prevent score inflation and double-counting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Sender Inconsistency", max: 30, color: "bg-red-500" },
                { label: "Suspicious Language & Urgency", max: 25, color: "bg-orange-500" },
                { label: "Suspicious URL Structure", max: 25, color: "bg-amber-500" },
                { label: "Credential Request Coercion", max: 20, color: "bg-orange-500" },
                { label: "Financial Pressure Vectors", max: 20, color: "bg-amber-500" },
                { label: "Header & Authentication Anomaly", max: 20, color: "bg-cyan-500" },
                { label: "Social Engineering Lures", max: 18, color: "bg-emerald-500" },
              ].map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">{cat.label}</span>
                    <span className="font-mono text-[var(--text-muted)]">Max {cat.max} pts</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-surface-elevated)] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} opacity-80`}
                      style={{ width: `${(cat.max / 30) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
                Privacy & Forensic Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[var(--text-secondary)] space-y-2 leading-relaxed">
              <p>
                • <strong>Zero Automatic Script Execution:</strong> Email HTML is never rendered as executable DOM.
              </p>
              <p>
                • <strong>No Unconsented Exfiltration:</strong> Emails remain in client memory unless external intelligence lookup is explicitly triggered.
              </p>
              <p>
                • <strong>Transparent Limitations:</strong> Heuristics measure observed indicators, not absolute mathematical probabilities.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
            <div>
              <CardTitle className="text-base font-semibold">
                Component Library & Design Tokens Preview
              </CardTitle>
              <CardDescription>
                Reusable atomic components styled with centralized design tokens for dark, light, and accent customization.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="buttons">
            <TabsList>
              <TabTrigger value="buttons">Buttons & Badges</TabTrigger>
              <TabTrigger value="risk">Risk Severity System</TabTrigger>
              <TabTrigger value="cards">Cards & Empty States</TabTrigger>
            </TabsList>

            <TabContent value="buttons" className="space-y-4 pt-3">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                  Button Variants & Sizes
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button variant="primary" size="md">Primary Action</Button>
                  <Button variant="secondary" size="md">Secondary Action</Button>
                  <Button variant="outline" size="md">Outline Button</Button>
                  <Button variant="ghost" size="md">Ghost Button</Button>
                  <Button variant="danger" size="md">Destructive</Button>
                  <Button variant="primary" size="md" isLoading>Loading</Button>
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="lg">Large Hero</Button>
                </div>
              </div>
            </TabContent>

            <TabContent value="risk" className="space-y-4 pt-3">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                  Explainable Risk Indicators (0 to 100)
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <RiskBadge category="LOW" score={10} />
                  <RiskBadge category="MODERATE" score={38} />
                  <RiskBadge category="HIGH" score={65} />
                  <RiskBadge category="CRITICAL" score={92} />
                </div>
              </div>
            </TabContent>

            <TabContent value="cards" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 space-y-2">
                  <span className="text-xs font-semibold text-[var(--accent-primary)]">
                    Standard Surface Card
                  </span>
                  <p className="text-xs text-[var(--text-muted)]">
                    Card container with subtle border, surface elevation, and responsive contrast.
                  </p>
                </Card>
                <div className="p-4 rounded-xl border border-dashed border-[var(--border-medium)] flex items-center justify-center text-xs text-[var(--text-muted)]">
                  Empty State Container with Action Slots
                </div>
              </div>
            </TabContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppShell>
  );
}
