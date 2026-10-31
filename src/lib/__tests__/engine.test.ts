import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EmailAnalyzer } from "../engine/email-analyzer";
import { UrlAnalyzer } from "../engine/url-analyzer";
import { HeaderParser } from "../engine/header-parser";
import { RiskScorer } from "../engine/risk-scorer";
import { InputNormalizer } from "../engine/normalizer";

describe("SENTINEL AI - Local Analysis Engine", () => {
  it("detects credential solicitation and urgency language in body", () => {
    const result = EmailAnalyzer.analyze({
      body: "Immediate action required. Please confirm your password and OTP within 24 hours.",
      manualUrls: [],
      isDemoMode: false,
      options: {
        checkLanguage: true,
        checkUrls: false,
        checkSender: false,
        checkHeaders: false,
        externalReputation: false,
      },
    });

    assert.ok(result.riskScore > 0);
    assert.ok(result.warningSigns.some((w) => w.category === "Credential Request"));
    assert.ok(result.warningSigns.some((w) => w.category === "Suspicious Language"));
  });

  it("context-awareness: defensive negated statements do not trigger false positive credential alerts", () => {
    const result = EmailAnalyzer.analyze({
      body: "Security reminder: We will never ask you for your password or OTP. Never share your password with anyone.",
      manualUrls: [],
      isDemoMode: false,
      options: {
        checkLanguage: true,
        checkUrls: false,
        checkSender: false,
        checkHeaders: false,
        externalReputation: false,
      },
    });

    // Should NOT trigger credential request rules due to negation filter
    const credWarnings = result.warningSigns.filter((w) => w.category === "Credential Request");
    assert.equal(credWarnings.length, 0);
  });

  it("detects lookalike sender domains and free-mail mismatch", () => {
    const result = EmailAnalyzer.analyze({
      senderEmail: "alerts@paypa1-support.com",
      subject: "PayPal Security Alert",
      body: "We noticed unusual activity on your account.",
      manualUrls: [],
      isDemoMode: false,
      options: {
        checkLanguage: true,
        checkUrls: false,
        checkSender: true,
        checkHeaders: false,
        externalReputation: false,
      },
    });

    assert.ok(result.warningSigns.some((w) => w.category === "Sender Inconsistency"));
    assert.ok(
      result.warningSigns.some((w) => w.title.toLowerCase().includes("lookalike domain"))
    );
  });

  it("performs structural inspection of URLs without external network calls", () => {
    const finding = UrlAnalyzer.analyzeTarget("http://sub.verify-bank.login-now.com/account/update");
    assert.equal(finding.isSuspicious, true);
    assert.ok(finding.issues.some((i) => i.includes("HTTP scheme")));
    assert.ok(finding.issues.some((i) => i.toLowerCase().includes("subdomain")));
    assert.equal(finding.externalReputationStatus, "Not checked");
  });

  it("detects deceptive anchor text vs destination URL mismatch in HTML emails", () => {
    const result = EmailAnalyzer.analyze({
      body: '<p>Please verify your Chase account here: <a href="http://malicious-phish-domain.ru/login">https://chase.com/secure-login</a></p>',
      manualUrls: [],
      isDemoMode: false,
      options: {
        checkLanguage: false,
        checkUrls: true,
        checkSender: false,
        checkHeaders: false,
        externalReputation: false,
      },
    });

    const mismatchSign = result.warningSigns.find((w) => w.id === "RULE-URL-MISMATCH");
    assert.ok(mismatchSign);
    assert.equal(mismatchSign?.severity, "critical");
    assert.ok(result.urlFindings.some((u) => u.isTextMismatch));
  });

  it("safely enforces 500 KB input size guard without ReDoS", () => {
    const hugeInput = "A".repeat(600_000);
    const { normalizedText } = InputNormalizer.normalize(hugeInput);
    assert.equal(normalizedText.length, 500_000);
  });

  it("parses RFC 822 email headers and identifies Reply-To mismatches", () => {
    const raw = `From: official@company.com\nReply-To: attacker@phishing-relay.org\nAuthentication-Results: spf=fail dkim=fail dmarc=fail`;
    const findings = HeaderParser.parse(raw);

    const replyTo = findings.find((f) => f.headerName === "Reply-To");
    assert.ok(replyTo);
    assert.equal(replyTo?.isSuspicious, true);

    const spf = findings.find((f) => f.headerName === "SPF (Reported)");
    assert.ok(spf);
    assert.equal(spf?.isSuspicious, true);
  });

  it("enforces category caps and maximum 100 points clamp", () => {
    // Inject multiple high-point warning signs in the same category
    const signs = [
      { category: "Suspicious Language" as const, title: "Sign 1", description: "Desc", severityPoints: 20 },
      { category: "Suspicious Language" as const, title: "Sign 2", description: "Desc", severityPoints: 20 },
      { category: "Suspicious Language" as const, title: "Sign 3", description: "Desc", severityPoints: 20 },
    ];
    // Suspicious Language is capped at 25 points
    const { score } = RiskScorer.calculate(signs);
    assert.equal(score, 25);
  });
});
