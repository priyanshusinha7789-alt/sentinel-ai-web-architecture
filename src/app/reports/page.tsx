"use client";

import React, { useState } from "react";
import { FileText, Download, Printer, ShieldCheck, Eye, X } from "lucide-react";
import { AppShell } from "@/components/layout";
import {
  PageHeader,
  Button,
  RiskBadge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import { InvestigationStorage } from "@/lib/engine/storage";
import type { Investigation } from "@/lib/engine/types";

const DEMO_REPORTS: Investigation[] = [
  {
    id: "REP-2026-88472",
    timestamp: "2026-10-30T10:00:00.000Z",
    emailSubject: "Synthetic Bank Impersonation Dossier",
    senderEmail: "alerts@paypa1-security.com",
    riskScore: 85,
    riskCategory: "CRITICAL",
    summary: "Critical Risk: Typosquatting lookalike domain and credential solicitation detected.",
    warningSigns: [
      {
        id: "RULE-SND-LOOKALIKE",
        category: "Sender Inconsistency",
        title: "Lookalike Domain Impersonation (Typosquatting)",
        description: "The sender domain contains a deliberate visual character substitution mimicking PayPal.",
        evidence: "alerts@paypa1-security.com",
        severityPoints: 20,
        severity: "critical",
        confidence: "high",
      },
      {
        id: "RULE-CRED-01",
        category: "Credential Request",
        title: "Direct Password or Passcode Solicitation",
        description: "Communication requests the recipient to provide or re-authenticate their account password.",
        evidence: "Please confirm your password immediately",
        severityPoints: 20,
        severity: "critical",
        confidence: "high",
      },
    ],
    urlFindings: [
      {
        url: "http://paypa1-security.com/account/login",
        issues: ["Uses unencrypted HTTP scheme", "Typosquatting token paypa1"],
        isSuspicious: true,
        externalReputationStatus: "Not checked",
        hasHttps: false,
        isIpAddress: false,
        hasSuspiciousSubdomain: false,
        isPunycode: false,
      },
    ],
    headerFindings: [],
    recommendedActions: [
      "Do not reply or click any links in this message.",
      "Block the sender domain at the email gateway.",
      "Check with your official institution via a known, verified phone number.",
    ],
    completedChecks: ["Language heuristics", "Sender analysis", "URL structural inspection"],
    incompletedChecks: ["External DNS lookup (offline local scan)"],
    uncertainties: ["Heuristic score reflects observed warning signs, not a verified probability."],
    isDemoMode: true,
  },
];

export default function ReportsPage() {
  const [selectedCase, setSelectedCase] = useState<Investigation | null>(null);
  const [reports] = useState<Investigation[]>(() => {
    if (typeof window !== "undefined") {
      const stored = InvestigationStorage.getAll();
      if (stored && stored.length > 0) return stored;
    }
    return DEMO_REPORTS;
  });

  const handlePrintDossier = (inv: Investigation) => {
    setSelectedCase(inv);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <AppShell>
      <PageHeader
        title="Forensic Reports & PDF Export"
        subtitle="Formal digital forensic investigation dossiers with evidence logs, technical findings, and methodology disclosures."
        breadcrumbs={[
          { label: "Overview", href: "/" },
          { label: "Forensic Reports" },
        ]}
      />

      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Dossier</TableHead>
              <TableHead>Case Target</TableHead>
              <TableHead>Risk Classification</TableHead>
              <TableHead>Evidence Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />
                    <div>
                      <span className="font-semibold text-[var(--text-primary)] block font-mono">
                        {inv.id}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] block truncate max-w-xs">
                        {inv.emailSubject || "Untitled Investigation"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                  {inv.senderEmail || "(Unknown)"}
                </TableCell>
                <TableCell>
                  <RiskBadge category={inv.riskCategory} score={inv.riskScore} size="sm" />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {inv.warningSigns.length} Findings · {inv.urlFindings.length} URLs
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Eye className="h-3.5 w-3.5" />}
                      onClick={() => setSelectedCase(inv)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Download className="h-3.5 w-3.5" />}
                      onClick={() => handlePrintDossier(inv)}
                    >
                      Export PDF
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Selected Dossier Preview Modal / Printable Container */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:p-0 print:bg-white print:static print:block">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--bg-primary)] border-[var(--border-medium)] print:border-none print:shadow-none print:max-h-none print:bg-white print:text-black">
              <CardHeader className="flex flex-row items-start justify-between border-b border-[var(--border-subtle)] pb-4 print:border-b print:border-black/20">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400 print:text-black" />
                    <span className="font-bold tracking-wider uppercase text-sm">
                      SENTINEL AI — Forensic Investigation Dossier
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold mt-1">
                    {selectedCase.emailSubject || "Email Threat Investigation"}
                  </CardTitle>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5 print:text-black/60">
                    Case ID: {selectedCase.id} | Timestamp: {new Date(selectedCase.timestamp).toUTCString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Printer className="h-3.5 w-3.5" />}
                    onClick={() => window.print()}
                  >
                    Print / PDF
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setSelectedCase(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 text-xs">
                {/* Executive Assessment */}
                <div className="p-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] print:bg-transparent print:border-black/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">Executive Assessment</span>
                    <RiskBadge category={selectedCase.riskCategory} score={selectedCase.riskScore} size="md" />
                  </div>
                  <p className="text-[var(--text-secondary)] leading-relaxed print:text-black">
                    {selectedCase.summary}
                  </p>
                </div>

                {/* Sender & Target Metadata */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] font-mono print:bg-transparent print:border-black/20">
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block print:text-black/60">Sender Address</span>
                    <span className="text-[var(--text-primary)] print:text-black font-semibold">
                      {selectedCase.senderEmail || "(Not provided)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block print:text-black/60">Risk Score</span>
                    <span className="text-[var(--accent-primary)] font-bold print:text-black">
                      {selectedCase.riskScore} / 100 ({selectedCase.riskCategory})
                    </span>
                  </div>
                </div>

                {/* Evidence Findings */}
                <div className="space-y-2">
                  <span className="font-bold text-sm block">Observed Technical Findings ({selectedCase.warningSigns.length})</span>
                  {selectedCase.warningSigns.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCase.warningSigns.map((w, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] print:bg-transparent print:border-black/20 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[var(--text-primary)] print:text-black">
                              {w.title}
                            </span>
                            <Badge variant="amber" size="sm">
                              +{w.severityPoints} pts
                            </Badge>
                          </div>
                          <p className="text-[var(--text-secondary)] print:text-black/80">{w.description}</p>
                          {w.evidence && (
                            <code className="block p-1.5 rounded bg-[var(--bg-surface-elevated)] print:bg-gray-100 font-mono text-[11px] text-amber-300 print:text-black mt-1">
                              Evidence: {w.evidence}
                            </code>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--text-muted)] italic">No anomalous indicators flagged.</p>
                  )}
                </div>

                {/* Extracted URLs */}
                {selectedCase.urlFindings.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-sm block">Inspected URL Destinations ({selectedCase.urlFindings.length})</span>
                    <div className="space-y-1.5 font-mono">
                      {selectedCase.urlFindings.map((uf, idx) => (
                        <div key={idx} className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] print:bg-transparent print:border-black/20 flex items-center justify-between">
                          <span className="text-[11px] truncate max-w-md">{uf.url}</span>
                          <Badge variant={uf.isSuspicious ? "red" : "emerald"} size="sm">
                            {uf.isSuspicious ? "SUSPICIOUS" : "NORMAL"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)] print:border-black/20">
                  <span className="font-bold text-sm block">Actionable Recommendations</span>
                  <ul className="list-decimal list-inside space-y-1 text-[var(--text-secondary)] print:text-black">
                    {selectedCase.recommendedActions.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>

                {/* Disclosures & Limitations */}
                <div className="p-2.5 rounded bg-[var(--bg-secondary)] text-[10px] text-[var(--text-muted)] print:text-black/60 print:bg-transparent print:border print:border-black/20 space-y-1">
                  <span className="font-semibold block">Methodology & Forensic Disclaimer:</span>
                  <p>
                    SENTINEL AI scores represent deterministic heuristics based on observable warning signals. They do not constitute a calibrated probability or a legal guarantee of message authenticity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
