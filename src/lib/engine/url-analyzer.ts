import type { UrlFinding } from "./types";
import type { ExtractedUrlTarget } from "./url-extractor";

/**
 * SENTINEL AI - Structural URL Analysis Engine
 * 
 * Performs deterministic, offline inspection of candidate URLs.
 * Identifies deceptive patterns, IP hosts, Punycode spoofing, and anchor mismatches
 * with zero outbound network requests.
 */
export class UrlAnalyzer {
  private static readonly ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

  private static readonly lookalikes: Record<string, string> = {
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
    gooog: "Google",
    g00gle: "Google",
    netfliix: "Netflix",
    netfl1x: "Netflix",
    "irs-gov": "IRS",
    "apple-id": "Apple",
    "account-google": "Google",
    "secure-wellsfargo": "Wells Fargo",
    "chase-online": "Chase Bank",
  };

  private static readonly suspiciousKeywords = [
    "secure-login",
    "account-verify",
    "update-info",
    "confirm-account",
    "login-secure",
    "verify-account",
    "account-suspended",
    "bank-verify",
    "paypal-support",
    "microsoft-alert",
    "apple-support",
    "identity-check",
    "wallet-auth",
  ];

  private static readonly shorteners = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "short.io",
    "rebrandly.com",
    "cutt.ly",
    "rb.gy",
    "is.gd",
  ];

  static analyzeTarget(target: ExtractedUrlTarget | string): UrlFinding {
    const rawUrl = typeof target === "string" ? target.trim() : target.url.trim();
    const displayedText = typeof target === "string" ? undefined : target.displayedText;
    const issues: string[] = [];

    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return {
        url: rawUrl,
        displayedText,
        isTextMismatch: false,
        issues: ["URL could not be parsed — malformed format or unsupported protocol."],
        isSuspicious: true,
        externalReputationStatus: "Not checked",
        hasHttps: false,
        isIpAddress: false,
        hasSuspiciousSubdomain: false,
        isPunycode: false,
      };
    }

    const scheme = parsed.protocol.replace(":", "").toLowerCase();
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    // 1. Text vs Actual Destination Mismatch Check
    let isTextMismatch = false;
    if (displayedText && displayedText.length > 3) {
      const looksLikeUrl =
        displayedText.startsWith("http://") ||
        displayedText.startsWith("https://") ||
        displayedText.startsWith("www.") ||
        /\.[a-z]{2,}(\/|$)/i.test(displayedText);

      if (looksLikeUrl) {
        try {
          const formattedDisplayed = displayedText.startsWith("http")
            ? displayedText
            : `https://${displayedText}`;
          const parsedDisplayed = new URL(formattedDisplayed);
          const displayedHost = parsedDisplayed.hostname.toLowerCase();

          // Compare apex domains
          const targetApex = host.split(".").slice(-2).join(".");
          const displayedApex = displayedHost.split(".").slice(-2).join(".");

          if (targetApex !== displayedApex && !host.endsWith(`.${displayedHost}`)) {
            isTextMismatch = true;
            issues.push(
              `Deceptive anchor text mismatch: link claims to lead to "${displayedHost}" but actually routes to "${host}".`
            );
          }
        } catch {
          // Displayed text was not a valid URL
        }
      }
    }

    // 2. Protocol Scheme Check
    const hasHttps = scheme === "https";
    if (scheme === "http") {
      issues.push(
        "Uses unencrypted HTTP scheme, not HTTPS. Note: HTTPS alone does not confirm legitimacy."
      );
    } else if (scheme !== "https" && scheme !== "http") {
      issues.push(`Non-standard URL scheme: "${scheme}". Expected http or https.`);
    }

    // 3. Raw IP Address Hostname
    const isIpAddress = this.ipRegex.test(host);
    if (isIpAddress) {
      issues.push(
        "Destination uses a raw IP address instead of a domain name—a tactic used to bypass domain reputation."
      );
    }

    // 4. Punycode / IDN Spoofing
    const isPunycode = host.includes("xn--");
    if (isPunycode) {
      issues.push(
        "Domain contains a Punycode internationalized string (xn--), which can visually disguise lookalike characters."
      );
    }

    // 5. Excessive Subdomain Nesting (>= 4 parts)
    const parts = host.split(".");
    const hasSuspiciousSubdomain = parts.length >= 4;
    if (hasSuspiciousSubdomain) {
      issues.push(
        `High subdomain depth (${parts.length} levels in "${host}"). Attackers use multi-level subdomains to hide real apex domains.`
      );
    }

    // 6. Lookalike Domain Impersonation
    for (const [pattern, brand] of Object.entries(this.lookalikes)) {
      if (host.includes(pattern)) {
        issues.push(
          `Domain appears to impersonate ${brand} using a lookalike spelling: "${host}".`
        );
        break;
      }
    }

    // 7. Deceptive Keywords
    for (const kw of this.suspiciousKeywords) {
      if (host.includes(kw) || path.includes(kw)) {
        issues.push(`URL structure contains deceptive security or verification keyword: "${kw}".`);
        break;
      }
    }

    // 8. Excessive URL Length (> 200 characters)
    if (rawUrl.length > 200) {
      issues.push(
        `URL is unusually long (${rawUrl.length} characters). Long URLs are often used to conceal real redirection parameters.`
      );
    }

    // 9. Shortener Detection
    const isShortener = this.shorteners.some((s) => host === s || host.endsWith(`.${s}`));
    if (isShortener) {
      issues.push(
        `Uses a URL shortening service (${host}), which conceals the destination before clicking.`
      );
    }

    const isSuspicious = issues.length > 0;

    return {
      url: rawUrl,
      displayedText,
      isTextMismatch,
      issues,
      isSuspicious,
      externalReputationStatus: "Not checked",
      hasHttps,
      domain: host,
      isIpAddress,
      hasSuspiciousSubdomain,
      isPunycode,
    };
  }

  static analyze(rawUrl: string): UrlFinding {
    return this.analyzeTarget(rawUrl);
  }
}
