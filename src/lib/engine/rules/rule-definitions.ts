import type { SeverityLevel, ConfidenceLevel } from "../types";

export interface HeuristicRule {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  confidence: ConfidenceLevel;
  points: number;
  triggerPatterns: string[];
  negationPatterns?: string[];
  knownLimitations: string;
}

export const HEURISTIC_RULES: HeuristicRule[] = [
  // ── FAMILY A: URGENCY & PRESSURE TACTICS ───────────────────────────────────
  {
    id: "RULE-URG-01",
    category: "Suspicious Language",
    title: "Urgent Deadline & Ultimatum Pressure",
    description:
      "The message employs artificial urgency (e.g., 'within 24 hours', 'immediate action required') to force a hasty response.",
    severity: "high",
    confidence: "high",
    points: 15,
    triggerPatterns: [
      "act immediately",
      "immediate action required",
      "within 24 hours",
      "within 48 hours",
      "respond immediately",
      "urgent action required",
      "expires today",
      "verify immediately",
      "suspended within",
    ],
    negationPatterns: [
      "take your time",
      "at your earliest convenience",
      "no rush",
      "within 30 days",
      "within 60 days",
      "within a few business days",
    ],
    knownLimitations:
      "Legitimate enterprise maintenance or password expiration notices can also specify 24-hour windows.",
  },
  {
    id: "RULE-URG-02",
    category: "Suspicious Language",
    title: "Account Suspension or Closure Threat",
    description:
      "The message threatens permanent account termination, closure, or legal action unless the recipient acts immediately.",
    severity: "high",
    confidence: "high",
    points: 15,
    triggerPatterns: [
      "account will be suspended",
      "account has been suspended",
      "your account will be closed",
      "account termination",
      "permanent closure",
      "account locked permanently",
    ],
    negationPatterns: [
      "how to close your account",
      "if you requested to close",
      "account was closed per your request",
    ],
    knownLimitations:
      "Legitimate fraud prevention systems do suspend compromised accounts and issue notices.",
  },

  // ── FAMILY B: CREDENTIAL & SENSITIVE INFORMATION SOLICITATION ───────────────
  {
    id: "RULE-CRED-01",
    category: "Credential Request",
    title: "Solicitation of Passwords or Login Credentials",
    description:
      "The message explicitly requests passwords, PINs, or credentials. Legitimate institutions never solicit authentication secrets via email.",
    severity: "critical",
    confidence: "high",
    points: 20,
    triggerPatterns: [
      "enter your password",
      "confirm your password",
      "reset your password",
      "provide your password",
      "login credentials",
      "username and password",
      "provide your pin",
    ],
    negationPatterns: [
      "never ask you for your password",
      "never share your password",
      "will not ask for your password",
      "do not share your password",
      "never give your password",
      "we never ask",
    ],
    knownLimitations:
      "Legitimate password reset confirmation emails containing a reset button can trigger this if phrasing matches.",
  },
  {
    id: "RULE-CRED-02",
    category: "Credential Request",
    title: "One-Time Password (OTP) or Verification Code Request",
    description:
      "The message solicits SMS or authenticator one-time passwords (OTP). Threat actors use this to bypass two-factor authentication (MFA).",
    severity: "critical",
    confidence: "high",
    points: 20,
    triggerPatterns: [
      "your otp",
      "one-time password",
      "verification code",
      "enter the code sent to your phone",
      "send us the code",
      "share the 6-digit",
    ],
    negationPatterns: [
      "never share this code",
      "never share your code",
      "do not share this code",
      "employees will never ask",
      "if you did not request this code",
    ],
    knownLimitations:
      "Automated transactional MFA delivery emails include the words 'verification code'.",
  },
  {
    id: "RULE-CRED-03",
    category: "Credential Request",
    title: "Sensitive Identity or Banking Detail Solicitation",
    description:
      "The message requests sensitive banking identifiers, card CVV/PINs, or government identity numbers.",
    severity: "high",
    confidence: "high",
    points: 18,
    triggerPatterns: [
      "bank account details",
      "enter your card",
      "card cvv",
      "social security number",
      "national insurance number",
      "confirm your identity with card",
    ],
    negationPatterns: [
      "never provide your bank account",
      "do not email your card details",
    ],
    knownLimitations:
      "Accounting correspondence discussing bank transfers between trusted partners may mention account details.",
  },

  // ── FAMILY C: FINANCIAL MANIPULATION & UNCONVENTIONAL TRANSFERS ─────────────
  {
    id: "RULE-FIN-01",
    category: "Financial Pressure",
    title: "Irreversible Payment Method Coercion",
    description:
      "The message directs payment through gift cards, cryptocurrency, or wire services (Western Union, MoneyGram).",
    severity: "critical",
    confidence: "high",
    points: 20,
    triggerPatterns: [
      "gift card",
      "apple gift card",
      "google play card",
      "western union",
      "moneygram",
      "bitcoin address",
      "cryptocurrency transfer",
      "crypto wallet",
    ],
    negationPatterns: [
      "we do not accept gift cards",
      "beware of gift card scams",
    ],
    knownLimitations:
      "Legitimate promotions offering a retailer gift card reward upon survey completion.",
  },
  {
    id: "RULE-FIN-02",
    category: "Financial Pressure",
    title: "Overdue Legal or Debt Collection Ultimatum",
    description:
      "The message threatens immediate legal action, arrest, or law enforcement intervention over unpaid invoices or fines.",
    severity: "high",
    confidence: "medium",
    points: 15,
    triggerPatterns: [
      "legal action will be taken",
      "law enforcement will be notified",
      "arrest warrant",
      "court proceedings",
      "immediate payment required to avoid legal",
    ],
    negationPatterns: [
      "standard dispute process",
      "terms of service legal notice",
    ],
    knownLimitations:
      "Formal legal dispute notices from legitimate corporate counsel.",
  },

  // ── FAMILY D: SECURITY ALERT & IMPERSONATION SIGNALS ───────────────────────
  {
    id: "RULE-IMP-01",
    category: "Impersonation",
    title: "Security Alert / Unauthorized Login Impersonation",
    description:
      "The message mimics an automated security notification claiming suspicious activity from an unknown device to induce panic.",
    severity: "medium",
    confidence: "medium",
    points: 15,
    triggerPatterns: [
      "unusual sign-in activity",
      "suspicious login attempt",
      "unusual activity detected",
      "your account was accessed",
      "unauthorized access detected",
      "login from unknown device",
    ],
    negationPatterns: [
      "this is a monthly security summary",
      "no action required if this was you",
    ],
    knownLimitations:
      "Legitimate platforms (Google, Apple, Microsoft) send real login alerts with similar phrases.",
  },

  // ── FAMILY E: SOCIAL ENGINEERING & REWARDS ────────────────────────────────
  {
    id: "RULE-SOC-01",
    category: "Social Engineering",
    title: "Unsolicited Prize or Lottery Reward Lure",
    description:
      "The message claims the recipient has won an unsolicited lottery, prize, or fund transfer (advance fee fraud pattern).",
    severity: "high",
    confidence: "high",
    points: 18,
    triggerPatterns: [
      "you have won",
      "congratulations, you have been selected",
      "selected as our lucky winner",
      "unclaimed lottery",
      "claim your prize",
      "claim your $",
      "claim your reward now",
      "jackpot winner",
    ],
    negationPatterns: [
      "contest rules and terms",
      "winner will be announced on",
    ],
    knownLimitations:
      "Company internal contest notifications or loyalty program points summaries.",
  },
  {
    id: "RULE-SOC-02",
    category: "Social Engineering",
    title: "Confidentiality & Secrecy Pressure",
    description:
      "The message instructs the recipient to keep the communication secret or not to consult colleagues or family (CEO fraud tactic).",
    severity: "high",
    confidence: "medium",
    points: 15,
    triggerPatterns: [
      "keep this confidential",
      "do not discuss this with anyone",
      "keep this strictly between us",
      "do not call me directly",
      "i am in a meeting, email only",
    ],
    negationPatterns: [
      "standard confidentiality notice",
      "this email contains proprietary information",
    ],
    knownLimitations:
      "Standard corporate email footer disclaimers containing 'strictly confidential'.",
  },

  // ── FAMILY F: SUSPICIOUS INSTRUCTIONS ──────────────────────────────────────
  {
    id: "RULE-INS-01",
    category: "Suspicious Instructions",
    title: "Link Clicking or Macro-Enabled Attachment Coercion",
    description:
      "The message insists the recipient immediately click a link or enable macros in an attached document to proceed.",
    severity: "medium",
    confidence: "medium",
    points: 12,
    triggerPatterns: [
      "click here to verify",
      "click the link below to confirm",
      "enable macros to view",
      "open the attached invoice immediately",
      "download attached secure document",
    ],
    negationPatterns: [
      "or navigate manually to your browser",
      "do not click untrusted links",
    ],
    knownLimitations:
      "Standard marketing or customer support emails containing 'click here' callouts.",
  },
];
