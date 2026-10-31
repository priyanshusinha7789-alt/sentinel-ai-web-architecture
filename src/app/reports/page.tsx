"use client";

import React from "react";
import { FileText, Download, Printer } from "lucide-react";
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
} from "@/components/ui";

export default function ReportsPage() {
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

      <div className="space-y-4">
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
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />
                  <div>
                    <span className="font-semibold text-[var(--text-primary)] block">
                      REP-2024-88472
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono block">
                      Synthetic Bank Impersonation Dossier
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                secure-nationalbank-alerts.com
              </TableCell>
              <TableCell>
                <RiskBadge category="CRITICAL" score={85} size="sm" />
              </TableCell>
              <TableCell className="font-mono text-xs">
                3 Findings · 1 URL
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title="Print report"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                    onClick={() => window.print()}
                  >
                    Export PDF
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
