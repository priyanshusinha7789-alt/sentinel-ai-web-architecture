import type { HeaderFinding } from "./types";

/**
 * Parses raw RFC 822 email headers.
 * IMPORTANT: Results reflect what is reported IN the supplied headers.
 * This does NOT perform independent live DNS-based SPF/DKIM/DMARC verification.
 */
export class HeaderParser {
  static parse(rawHeaders: string): HeaderFinding[] {
    const findings: HeaderFinding[] = [];
    if (!rawHeaders || !rawHeaders.trim()) return findings;

    const headers = this.parseHeadersMap(rawHeaders);

    // 1. From
    if (headers.from) {
      const fromVal = headers.from;
      const fromEmail = this.extractEmail(fromVal);
      const isSuspicious = fromEmail ? this.hasSuspiciousDomain(fromEmail) : false;

      findings.push({
        headerName: "From",
        value: fromVal,
        finding: isSuspicious ? "The From address domain appears suspicious or deceptive." : undefined,
        isSuspicious,
        source: "reported_in_headers",
      });
    }

    // 2. Reply-To
    if (headers["reply-to"]) {
      const replyTo = headers["reply-to"];
      const fromVal = headers.from || "";
      const replyEmail = this.extractEmail(replyTo) || "";
      const fromEmail = this.extractEmail(fromVal) || "";
      const replyDomain = this.getDomain(replyEmail);
      const fromDomain = this.getDomain(fromEmail);

      const mismatch = Boolean(
        replyDomain && fromDomain && replyDomain.toLowerCase() !== fromDomain.toLowerCase()
      );

      findings.push({
        headerName: "Reply-To",
        value: replyTo,
        finding: mismatch
          ? `Reply-To domain (${replyDomain}) differs from From domain (${fromDomain}). Replies will be routed to an alternate destination than the apparent sender.`
          : undefined,
        isSuspicious: mismatch,
        source: "reported_in_headers",
      });
    }

    // 3. Return-Path
    if (headers["return-path"]) {
      const returnPath = headers["return-path"];
      const fromVal = headers.from || "";
      const returnEmail = this.extractEmail(returnPath) || "";
      const fromEmail = this.extractEmail(fromVal) || "";
      const returnDomain = this.getDomain(returnEmail);
      const fromDomain = this.getDomain(fromEmail);

      const mismatch = Boolean(
        returnDomain && fromDomain && returnDomain.toLowerCase() !== fromDomain.toLowerCase()
      );

      findings.push({
        headerName: "Return-Path",
        value: returnPath,
        finding: mismatch
          ? `Return-Path domain (${returnDomain}) differs from From domain (${fromDomain}). Bounce and delivery notifications route elsewhere.`
          : undefined,
        isSuspicious: mismatch,
        source: "reported_in_headers",
      });
    }

    // 4. Authentication-Results (SPF / DKIM / DMARC reported)
    if (headers["authentication-results"]) {
      const auth = headers["authentication-results"];
      const spf = this.extractAuthResult(auth, "spf");
      const dkim = this.extractAuthResult(auth, "dkim");
      const dmarc = this.extractAuthResult(auth, "dmarc");

      if (spf) {
        const isFail = spf.toLowerCase().includes("fail") || spf.toLowerCase().includes("softfail");
        findings.push({
          headerName: "SPF (Reported)",
          value: spf,
          finding: isFail
            ? "Sender Policy Framework (SPF) check failed or softfailed as reported by the receiving mail server."
            : "SPF check passed as reported in Authentication-Results header.",
          isSuspicious: isFail,
          source: "reported_in_headers",
        });
      }

      if (dkim) {
        const isFail = dkim.toLowerCase().includes("fail");
        findings.push({
          headerName: "DKIM (Reported)",
          value: dkim,
          finding: isFail
            ? "DomainKeys Identified Mail (DKIM) cryptographic signature check failed as reported in headers."
            : "DKIM signature verified as reported in Authentication-Results header.",
          isSuspicious: isFail,
          source: "reported_in_headers",
        });
      }

      if (dmarc) {
        const isFail = dmarc.toLowerCase().includes("fail");
        findings.push({
          headerName: "DMARC (Reported)",
          value: dmarc,
          finding: isFail
            ? "DMARC alignment check failed as reported in Authentication-Results header."
            : "DMARC evaluation reported passing.",
          isSuspicious: isFail,
          source: "reported_in_headers",
        });
      }
    }

    return findings;
  }

  private static parseHeadersMap(raw: string): Record<string, string> {
    const map: Record<string, string> = {};
    const lines = raw.split(/\r?\n/);
    let currentKey = "";
    let currentValue = "";

    for (const line of lines) {
      if (/^\s+/.test(line) && currentKey) {
        // Multi-line header folding
        currentValue += " " + line.trim();
      } else {
        if (currentKey) {
          map[currentKey.toLowerCase()] = currentValue.trim();
        }
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          currentKey = line.substring(0, colonIdx).trim().toLowerCase();
          currentValue = line.substring(colonIdx + 1).trim();
        } else {
          currentKey = "";
          currentValue = "";
        }
      }
    }

    if (currentKey) {
      map[currentKey.toLowerCase()] = currentValue.trim();
    }

    return map;
  }

  private static extractEmail(str: string): string | null {
    const match = str.match(/<([^>]+)>/) || str.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    return match ? match[1].toLowerCase().trim() : null;
  }

  private static getDomain(email: string): string {
    const parts = email.split("@");
    return parts.length > 1 ? parts[1].toLowerCase().trim() : "";
  }

  private static hasSuspiciousDomain(email: string): boolean {
    const domain = this.getDomain(email);
    if (!domain) return false;
    const suspiciousKeywords = ["alert", "verify", "security-update", "confirm-id", "login-support"];
    return suspiciousKeywords.some((kw) => domain.includes(kw));
  }

  private static extractAuthResult(authHeader: string, protocol: "spf" | "dkim" | "dmarc"): string | null {
    const regex = new RegExp(`${protocol}=([a-zA-Z0-9_-]+)`, "i");
    const match = authHeader.match(regex);
    return match ? match[1].toLowerCase() : null;
  }
}
