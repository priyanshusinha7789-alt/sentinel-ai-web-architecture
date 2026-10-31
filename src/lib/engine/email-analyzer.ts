import type {
  EmailInput,
  Investigation,
  WarningSign,
  UrlFinding,
  HeaderFinding,
} from "./types";
import { InputNormalizer } from "./normalizer";
import { HEURISTIC_RULES } from "./rules/rule-definitions";
import { UrlExtractor } from "./url-extractor";
import { UrlAnalyzer } from "./url-analyzer";
import { HeaderParser } from "./header-parser";
import { RiskScorer } from "./risk-scorer";

/**
 * SENTINEL AI - Explainable Email Threat Forensics Engine
 * 
 * Orchestrates deterministic, context-aware analysis across:
 * 1. Input normalization & HTML anchor decoupling
 * 2. Rule-based language pattern evaluation with negation checking
 * 3. Sender domain & lookalike consistency analysis
 * 4. Structural URL inspection & anchor text mismatch detection
 * 5. RFC 822 email header forensics & authentication parsing
 * 6. Cap-based calibrated risk scoring
 * 7. Uncertainty and limitation disclosures
 */
export class EmailAnalyzer {
  static analyze(input: EmailInput): Investigation {
    const warningSigns: WarningSign[] = [];
    const completedChecks: string[] = [];
    const incompletedChecks: string[] = [];
    const uncertainties: string[] = [];

    const options = input.options || {
      checkLanguage: true,
      checkUrls: true,
      checkSender: true,
      checkHeaders: true,
      externalReputation: false,
    };

    // ── 1. INPUT NORMALIZATION ───────────────────────────────────────────────
    const { normalizedText, isHtmlDetected, extractedAnchors } =
      InputNormalizer.normalize(input.body);
    completedChecks.push(
      isHtmlDetected
        ? "Safe HTML normalization & anchor tag decoupling"
        : "Text input sanitization & Unicode NFKC normalization"
    );

    // ── 2. CONTEXT-AWARE CONTENT ANALYSIS ────────────────────────────────────
    if (options.checkLanguage) {
      const contentFindings = this.evaluateLanguageRules(normalizedText);
      warningSigns.push(...contentFindings);
      completedChecks.push(
        `Context-aware heuristic language scan (${HEURISTIC_RULES.length} active rules with negation filters)`
      );
    } else {
      incompletedChecks.push("Content language heuristic scan (disabled in options)");
    }

    // ── 3. SENDER & DOMAIN CONSISTENCY ANALYSIS ─────────────────────────────
    if (options.checkSender) {
      if (input.senderEmail && input.senderEmail.trim()) {
        const senderFindings = this.evaluateSenderConsistency(
          input.senderEmail,
          input.subject || "",
          normalizedText
        );
        warningSigns.push(...senderFindings);
        completedChecks.push("Sender address consistency & lookalike domain analysis");
      } else {
        incompletedChecks.push("Sender address evaluation (no sender address provided)");
      }
    } else {
      incompletedChecks.push("Sender address evaluation (disabled in options)");
    }

    // ── 4. STRUCTURAL URL INSPECTION & MISMATCH CHECKS ───────────────────────
    const urlFindings: UrlFinding[] = [];
    if (options.checkUrls) {
      const detailedTargets = UrlExtractor.extractDetailed(
        normalizedText,
        extractedAnchors
      );

      // Include manual URLs
      const allTargetUrls = [...detailedTargets];
      for (const manual of input.manualUrls) {
        if (!allTargetUrls.some((t) => t.url === manual)) {
          allTargetUrls.push({ url: manual, isHtmlAnchor: false });
        }
      }

      for (const target of allTargetUrls) {
        const finding = UrlAnalyzer.analyzeTarget(target);
        urlFindings.push(finding);

        if (finding.isSuspicious) {
          // Deceptive Anchor Mismatch is critical
          if (finding.isTextMismatch) {
            warningSigns.push({
              id: "RULE-URL-MISMATCH",
              category: "Suspicious URL",
              title: "Deceptive Link Anchor Mismatch",
              description: finding.issues.find((i) => i.includes("mismatch")) || "Link anchor text conceals true destination.",
              evidence: `Anchor text: "${finding.displayedText}" -> Target: "${finding.url}"`,
              severityPoints: 20,
              severity: "critical",
              confidence: "high",
            });
          } else {
            warningSigns.push({
              id: "RULE-URL-STRUCTURAL",
              category: "Suspicious URL",
              title: "Suspicious URL Structure Detected",
              description: finding.issues.join("; "),
              evidence: finding.url,
              severityPoints: 12,
              severity: "medium",
              confidence: "high",
            });
          }
        }
      }

      completedChecks.push(
        `Structural URL inspection & anchor mismatch detection (${allTargetUrls.length} observed)`
      );

      if (options.externalReputation) {
        incompletedChecks.push(
          "External threat intelligence lookups (opt-in; requires backend server proxy configuration)"
        );
      } else {
        incompletedChecks.push(
          "External threat intelligence checks (disabled to preserve client-side privacy)"
        );
      }
    } else {
      incompletedChecks.push("URL structural inspection (disabled in options)");
    }

    // ── 5. RFC 822 HEADER FORENSICS ──────────────────────────────────────────
    const headerFindings: HeaderFinding[] = [];
    if (options.checkHeaders) {
      if (input.rawHeaders && input.rawHeaders.trim()) {
        const parsed = HeaderParser.parse(input.rawHeaders);
        headerFindings.push(...parsed);
        completedChecks.push("RFC 822 email header parsing & routing hop evaluation");

        for (const hf of parsed) {
          if (hf.isSuspicious && hf.finding) {
            warningSigns.push({
              id: `RULE-HDR-${hf.headerName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
              category: "Header Anomaly",
              title: `${hf.headerName} Discrepancy`,
              description: hf.finding,
              evidence: hf.value,
              severityPoints: 15,
              severity: "high",
              confidence: "medium",
            });
          }
        }

        incompletedChecks.push(
          "Independent live DNS cryptographic validation (SPF/DKIM/DMARC evaluated as reported in supplied header text only)"
        );
      } else {
        incompletedChecks.push("Email header forensics (no raw headers provided)");
      }
    } else {
      incompletedChecks.push("Email header forensics (disabled in options)");
    }

    // ── 6. DISCLOSURES & TECHNICAL UNCERTAINTIES ─────────────────────────────
    uncertainties.push(
      "Heuristic scores reflect observable warning signs and rule triggers; they do not represent statistical probabilities of maliciousness."
    );
    uncertainties.push(
      "Reported SPF/DKIM/DMARC authentication results are derived solely from Authentication-Results headers and were not independently validated against live DNS servers."
    );
    if (!options.externalReputation) {
      uncertainties.push(
        "External threat reputation lookup was not performed. Clean structural links may still host unobserved live payloads."
      );
    }

    // ── 7. RISK SCORING & NARRATIVE ASSESSMENT ───────────────────────────────
    const { score, category, breakdown } = RiskScorer.calculate(warningSigns);
    const summary = this.generateSummary(warningSigns, score, category, breakdown);
    const recommendedActions = this.generateActions(warningSigns, score, urlFindings);

    const id = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      id,
      timestamp: new Date().toISOString(),
      emailSubject: input.subject,
      emailBody: normalizedText,
      senderEmail: input.senderEmail,
      rawHeaders: input.rawHeaders,
      riskScore: score,
      riskCategory: category,
      summary,
      warningSigns,
      urlFindings,
      headerFindings,
      recommendedActions,
      completedChecks,
      incompletedChecks,
      uncertainties,
      isDemoMode: input.isDemoMode,
      scoreBreakdown: breakdown,
    };
  }

  // ── RULE EVALUATOR WITH NEGATION CONTEXT ─────────────────────────────────────

  private static evaluateLanguageRules(text: string): WarningSign[] {
    const findings: WarningSign[] = [];
    const lowerText = text.toLowerCase();
    const sentences = text.split(/(?<=[.?!;:\n])\s+/);

    for (const rule of HEURISTIC_RULES) {
      let matchedTrigger: string | null = null;
      let matchedSentence: string | null = null;

      // Scan sentences for trigger patterns
      for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        for (const pattern of rule.triggerPatterns) {
          if (lowerSentence.includes(pattern)) {
            // Check for negation or defensive guidance in the same sentence or surrounding text
            const isNegated = (rule.negationPatterns || []).some(
              (neg) =>
                lowerSentence.includes(neg) ||
                lowerText.includes(`never ${pattern}`) ||
                lowerText.includes(`not ${pattern}`)
            );

            if (!isNegated) {
              matchedTrigger = pattern;
              matchedSentence = sentence.trim();
              break;
            }
          }
        }
        if (matchedTrigger) break;
      }

      if (matchedTrigger && matchedSentence) {
        findings.push({
          id: rule.id,
          category: rule.category,
          title: rule.title,
          description: rule.description,
          evidence: this.extractExcerpt(text, matchedTrigger),
          severityPoints: rule.points,
          severity: rule.severity,
          confidence: rule.confidence,
        });
      }
    }

    return findings;
  }

  // ── SENDER CONSISTENCY EVALUATOR ─────────────────────────────────────────────

  private static evaluateSenderConsistency(
    sender: string,
    subject: string,
    body: string
  ): WarningSign[] {
    const signs: WarningSign[] = [];
    const lowerSender = sender.toLowerCase().trim();

    const freeProviders = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "aol.com",
      "protonmail.com",
      "yandex.com",
      "mail.com",
      "icloud.com",
    ];

    const majorOrgs = [
      "paypal",
      "amazon",
      "microsoft",
      "apple",
      "google",
      "netflix",
      "bank",
      "chase",
      "citibank",
      "wells fargo",
      "hsbc",
      "barclays",
      "fedex",
      "ups",
      "dhl",
      "irs",
      "hmrc",
    ];

    const isFreeProvider = freeProviders.some((p) => lowerSender.endsWith(`@${p}`));
    const bodyLower = body.toLowerCase();
    const subjectLower = subject.toLowerCase();

    // Check if body claims to represent an organization while sender is on a free provider
    const claimedOrg = majorOrgs.find(
      (o) => bodyLower.includes(o) || subjectLower.includes(o)
    );

    if (isFreeProvider && claimedOrg) {
      signs.push({
        id: "RULE-SND-FREE-MISMATCH",
        category: "Sender Inconsistency",
        title: "Organizational Identity on Free Webmail Provider",
        description: `The communication claims to represent "${claimedOrg.toUpperCase()}", but was dispatched from a consumer webmail address (${sender.split("@")[1]}). Legitimate institutions send correspondence from their own domain.`,
        evidence: `Sender: ${sender} | Claimed Entity: ${claimedOrg}`,
        severityPoints: 25,
        severity: "critical",
        confidence: "high",
      });
    }

    // Lookalike Domain Impersonation
    const lookalikes: Record<string, string> = {
      paypa1: "PayPal",
      "pay-pal": "PayPal",
      paypаl: "PayPal",
      amaz0n: "Amazon",
      arnazon: "Amazon",
      amazom: "Amazon",
      microsooft: "Microsoft",
      micosoft: "Microsoft",
      micros0ft: "Microsoft",
      app1e: "Apple",
      appie: "Apple",
      g00gle: "Google",
      goog1e: "Google",
      netfliix: "Netflix",
      netfl1x: "Netflix",
    };

    for (const [key, brand] of Object.entries(lookalikes)) {
      if (lowerSender.includes(key)) {
        signs.push({
          id: "RULE-SND-LOOKALIKE",
          category: "Sender Inconsistency",
          title: "Lookalike Domain Impersonation (Typosquatting)",
          description: `The sender domain contains a deliberate visual character substitution mimicking "${brand}".`,
          evidence: `Domain: ${sender}`,
          severityPoints: 30,
          severity: "critical",
          confidence: "high",
        });
        break;
      }
    }

    // Numeral substitutions in apex domain
    const domainPart = lowerSender.includes("@") ? lowerSender.split("@")[1] : lowerSender;
    const apex = domainPart.split(".")[0];
    if (/[0-9]/.test(apex) && !["365", "24", "7"].some((ok) => apex.includes(ok))) {
      signs.push({
        id: "RULE-SND-NUMERAL",
        category: "Sender Inconsistency",
        title: "Suspicious Numeral Substitution in Sender Domain",
        description:
          "The sender domain contains numerical digits replacing letters, a common evasion tactic to mimic legitimate corporate hosts.",
        evidence: `Domain apex: ${apex}`,
        severityPoints: 15,
        severity: "medium",
        confidence: "medium",
      });
    }

    return signs;
  }

  // ── SUMMARY & ACTION GENERATION ─────────────────────────────────────────────

  private static extractExcerpt(text: string, keyword: string): string {
    const lower = text.toLowerCase();
    const idx = lower.indexOf(keyword.toLowerCase());
    if (idx === -1) return text.substring(0, 100).trim();

    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + keyword.length + 40);
    return `...${text.substring(start, end).trim()}...`;
  }

  private static generateSummary(
    signs: WarningSign[],
    score: number,
    category: string,
    breakdown: { category: string; cappedPoints: number }[]
  ): string {
    if (signs.length === 0) {
      return "No suspicious indicators were identified by the local heuristic engine. This evaluation suggests low preliminary risk based on structural and linguistic checks, but external threat intelligence databases were not queried.";
    }

    const categoriesWithPoints = breakdown
      .filter((b) => b.cappedPoints > 0)
      .map((b) => b.category);

    const parts = [
      `${category} Risk Assessment (${score}/100 score).`,
      `The engine triggered ${signs.length} warning sign(s) across ${categoriesWithPoints.length} forensic category/categories: ${categoriesWithPoints.join(", ")}.`,
    ];

    if (signs.some((s) => s.category === "Credential Request")) {
      parts.push("High-risk credential or authentication token solicitation was detected.");
    }
    if (signs.some((s) => s.category === "Sender Inconsistency")) {
      parts.push("The sender domain exhibits strong indicators of brand impersonation.");
    }
    if (signs.some((s) => s.id === "RULE-URL-MISMATCH")) {
      parts.push("Deceptive link anchor text mismatches were discovered.");
    }

    parts.push("Inspect the detailed findings below to review the specific evidence.");
    return parts.join(" ");
  }

  private static generateActions(
    signs: WarningSign[],
    score: number,
    urlFindings: UrlFinding[]
  ): string[] {
    const actions: string[] = [];

    if (score >= 75) {
      actions.push("Do not respond to this email, follow embedded links, or download attachments.");
      actions.push("Submit this email to your organization's security operations center (SOC) or mail provider as confirmed phishing.");
      actions.push("If credentials or codes were entered, immediately reset passwords from a separate, trusted device.");
    } else if (score >= 50) {
      actions.push("Exercise extreme caution. Do not follow instructions in this email.");
      actions.push("Verify the communication by contacting the organization through an independent, official telephone number or website.");
      actions.push("Do not click links in the message; navigate manually via your browser bookmarks.");
    } else if (score >= 25) {
      actions.push("Examine the flagged warning signs and verify sender legitimacy before taking action.");
      actions.push("Check whether you recently requested or expected this message from the specified sender.");
    } else {
      actions.push("Local heuristics detected no urgent warning signs, but exercise routine email awareness.");
      actions.push("Ensure sensitive transactions are always verified via standard out-of-band channels.");
    }

    if (urlFindings.some((u) => u.isSuspicious)) {
      actions.push("Do not navigate to the suspicious destination URLs identified during structural inspection.");
    }
    if (signs.some((s) => s.category === "Credential Request")) {
      actions.push("Never transmit passwords, MFA verification codes, or bank details via email.");
    }

    actions.push("This forensic assessment is deterministic and educational. Consult security personnel if in doubt.");
    return actions;
  }
}
