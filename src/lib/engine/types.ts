import { z } from "zod";
import type { ThreatIntelReputation } from "../threat-intel/types";
import type { RiskLevel } from "../tokens";

export type { RiskLevel };

export const EmailInputSchema = z.object({
  subject: z.string().optional(),
  senderEmail: z
    .string()
    .trim()
    .refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please enter a valid email address (e.g. alerts@bank.com)",
    })
    .optional(),
  body: z
    .string()
    .min(1, "Email body or message content is required for analysis.")
    .max(500000, "Input exceeds maximum supported size (500 KB limit)."),
  rawHeaders: z
    .string()
    .max(250000, "Header set exceeds maximum supported size (250 KB limit).")
    .optional(),
  manualUrls: z.array(z.string()).default([]),
  isDemoMode: z.boolean().default(false),
  options: z
    .object({
      checkLanguage: z.boolean().default(true),
      checkUrls: z.boolean().default(true),
      checkSender: z.boolean().default(true),
      checkHeaders: z.boolean().default(true),
      externalReputation: z.boolean().default(false),
    })
    .default({
      checkLanguage: true,
      checkUrls: true,
      checkSender: true,
      checkHeaders: true,
      externalReputation: false,
    }),
});

export type EmailInput = z.infer<typeof EmailInputSchema>;

export type SeverityLevel = "info" | "low" | "medium" | "high" | "critical";
export type ConfidenceLevel = "low" | "medium" | "high";

export interface WarningSign {
  id?: string;
  category: string;
  title: string;
  description: string;
  evidence?: string;
  severityPoints: number;
  severity?: SeverityLevel;
  confidence?: ConfidenceLevel;
  mitigatingFactors?: string[];
}

export interface UrlFinding {
  url: string;
  issues: string[];
  isSuspicious: boolean;
  externalReputationStatus: "Not checked" | "Clean" | "Suspicious" | "Malicious" | "Unavailable";
  externalReputationDetail?: string;
  hasHttps: boolean;
  domain?: string;
  isIpAddress: boolean;
  hasSuspiciousSubdomain: boolean;
  isPunycode: boolean;
  displayedText?: string;
  isTextMismatch?: boolean;
  reputation?: ThreatIntelReputation;
}

export interface HeaderFinding {
  headerName: string;
  value?: string;
  finding?: string;
  isSuspicious: boolean;
  source: "reported_in_headers" | "dns_verified" | "not_checked";
}

export interface ScoreCategoryBreakdown {
  category: string;
  rawPoints: number;
  cappedPoints: number;
  maxCap: number;
}

export interface Investigation {
  id: string;
  timestamp: string; // ISO 8601
  emailSubject?: string;
  emailBody?: string;
  senderEmail?: string;
  rawHeaders?: string;
  riskScore: number; // 0 to 100
  riskCategory: RiskLevel;
  summary: string;
  warningSigns: WarningSign[];
  urlFindings: UrlFinding[];
  headerFindings: HeaderFinding[];
  recommendedActions: string[];
  completedChecks: string[];
  incompletedChecks: string[];
  uncertainties: string[];
  isDemoMode: boolean;
  scoreBreakdown?: ScoreCategoryBreakdown[];
}
