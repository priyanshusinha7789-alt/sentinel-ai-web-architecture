"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchCode, Plus, ExternalLink, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout";
import {
  PageHeader,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  RiskBadge,
  EmptyState,
  useToast,
} from "@/components/ui";
import { InvestigationStorage } from "@/lib/engine/storage";
import type { Investigation } from "@/lib/engine/types";

const DEFAULT_DEMO_INVESTIGATIONS: Investigation[] = [
  {
    id: "INV-84920",
    timestamp: "2024-10-30T10:00:00.000Z",
    emailSubject: "URGENT: Your account has been suspended",
    senderEmail: "security@secure-nationalbank-alerts.com",
    riskScore: 85,
    riskCategory: "CRITICAL",
    summary: "Critical Risk: Lookalike domain impersonation and credential solicitation detected.",
    warningSigns: [],
    urlFindings: [],
    headerFindings: [],
    recommendedActions: ["Do not click links", "Report as phishing"],
    completedChecks: ["Language heuristics", "Sender analysis"],
    incompletedChecks: [],
    uncertainties: [],
    isDemoMode: true,
  },
  {
    id: "INV-84921",
    timestamp: "2024-10-30T09:30:00.000Z",
    emailSubject: "Your monthly statement is ready",
    senderEmail: "notifications@mybank.com",
    riskScore: 0,
    riskCategory: "LOW",
    summary: "Low Risk: No malicious patterns identified in sender or links.",
    warningSigns: [],
    urlFindings: [],
    headerFindings: [],
    recommendedActions: ["Routine vigilance"],
    completedChecks: ["Language heuristics", "Sender analysis"],
    incompletedChecks: [],
    uncertainties: [],
    isDemoMode: true,
  },
];

export default function InvestigationsPage() {
  const router = useRouter();
  const { success } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [investigations, setInvestigations] = useState<Investigation[]>(() => {
    if (typeof window !== "undefined") {
      const list = InvestigationStorage.getAll();
      if (list.length > 0) return list;
    }
    return DEFAULT_DEMO_INVESTIGATIONS;
  });

  const handleDelete = (id: string) => {
    InvestigationStorage.deleteById(id);
    setInvestigations((prev) => prev.filter((i) => i.id !== id));
    success("Log Removed", `Investigation ${id} purged from local storage.`);
  };

  const handleClearAll = () => {
    InvestigationStorage.clearAll();
    setInvestigations([]);
    success("Archive Cleared", "All saved investigation logs have been removed.");
  };

  const filtered = investigations.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const subj = (inv.emailSubject || "").toLowerCase();
    const sender = (inv.senderEmail || "").toLowerCase();
    const id = inv.id.toLowerCase();
    return subj.includes(term) || sender.includes(term) || id.includes(term);
  });

  return (
    <AppShell>
      <PageHeader
        title="Investigations Archive"
        subtitle="Locally persisted history of previous forensic email inspections. Data remains in your local browser sandbox."
        breadcrumbs={[
          { label: "Overview", href: "/" },
          { label: "Investigations" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {investigations.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-[var(--text-muted)] hover:text-red-400"
              >
                Clear Archive
              </Button>
            )}
            <Link href="/analyzer">
              <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                New Investigation
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by case ID, sender, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            isSearch
            onClear={() => setSearchTerm("")}
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Sender Domain</TableHead>
              <TableHead>Risk Classification</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-xs font-semibold text-[var(--accent-primary)]">
                  {inv.id}
                </TableCell>
                <TableCell className="font-medium">
                  {inv.emailSubject || "(No Subject)"}
                </TableCell>
                <TableCell className="font-mono text-[11px] text-[var(--text-secondary)]">
                  {inv.senderEmail || "(Unspecified)"}
                </TableCell>
                <TableCell>
                  <RiskBadge category={inv.riskCategory} score={inv.riskScore} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href="/analyzer">
                      <Button size="icon-sm" variant="ghost" title="Open in Threat Analyzer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-red-400"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={<SearchCode className="h-6 w-6" />}
          title="No Investigation Logs Found"
          description={
            searchTerm
              ? `No records match "${searchTerm}". Clear your search term to see all cases.`
              : "Investigations executed in the Threat Analyzer will be cataloged here for subsequent audits and reviews."
          }
          actionLabel="Run Threat Analysis"
          onAction={() => router.push("/analyzer")}
          secondaryActionLabel={
            searchTerm ? "Clear Search" : "Restore Demo Records"
          }
          onSecondaryAction={
            searchTerm
              ? () => setSearchTerm("")
              : () => setInvestigations(DEFAULT_DEMO_INVESTIGATIONS)
          }
        />
      )}
    </AppShell>
  );
}
