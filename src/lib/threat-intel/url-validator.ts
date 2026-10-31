/**
 * SENTINEL AI - Safe URL Validator & SSRF Guard
 * 
 * Strict sanitization and SSRF prevention layer for external threat intelligence lookups.
 * Prevents the application backend from becoming an open proxy or exposing internal networks.
 */

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  normalizedHost?: string;
  scheme?: string;
  rejectionReason?: string;
  sensitiveTokensDetected: string[];
}

export class SafeUrlValidator {
  private static readonly MAX_URL_LENGTH = 2048;
  private static readonly ALLOWED_SCHEMES = new Set(["http:", "https:"]);

  // Sensitive query parameter keys that frequently leak auth tokens or credentials
  private static readonly SENSITIVE_TOKEN_KEYS = new Set([
    "token",
    "access_token",
    "auth",
    "auth_token",
    "api_key",
    "apikey",
    "key",
    "code",
    "secret",
    "password",
    "passwd",
    "pwd",
    "sig",
    "signature",
    "session",
    "sessionid",
    "session_id",
    "jwt",
    "ticket",
    "bearer",
    "reset_token",
  ]);

  /**
   * Validates that a candidate URL is safe for external submission.
   * Enforces protocol constraints, length bounds, SSRF restrictions, and token audits.
   */
  static validate(rawUrl: string, stripTokens: boolean = false): UrlValidationResult {
    if (!rawUrl || typeof rawUrl !== "string") {
      return {
        isValid: false,
        rejectionReason: "URL must be a non-empty string.",
        sensitiveTokensDetected: [],
      };
    }

    const trimmed = rawUrl.trim();

    if (trimmed.length > this.MAX_URL_LENGTH) {
      return {
        isValid: false,
        rejectionReason: `URL exceeds maximum allowable length of ${this.MAX_URL_LENGTH} characters.`,
        sensitiveTokensDetected: [],
      };
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      return {
        isValid: false,
        rejectionReason: "URL malformed or could not be parsed by standard WHATWG parser.",
        sensitiveTokensDetected: [],
      };
    }

    // 1. Enforce Scheme (only http and https)
    if (!this.ALLOWED_SCHEMES.has(parsed.protocol.toLowerCase())) {
      return {
        isValid: false,
        scheme: parsed.protocol,
        rejectionReason: `Scheme "${parsed.protocol}" is not permitted. Only standard HTTP and HTTPS schemes are supported.`,
        sensitiveTokensDetected: [],
      };
    }

    const host = parsed.hostname.toLowerCase();

    // 2. SSRF Protection: Block internal, loopback, link-local, and reserved networks
    if (this.isInternalOrReservedHost(host)) {
      return {
        isValid: false,
        normalizedHost: host,
        rejectionReason: `Destination host "${host}" is an internal, loopback, or private address and cannot be queried externally.`,
        sensitiveTokensDetected: [],
      };
    }

    // 3. Sensitive Token Audit
    const detectedTokens: string[] = [];
    const searchParams = new URLSearchParams(parsed.search);

    for (const key of searchParams.keys()) {
      if (this.SENSITIVE_TOKEN_KEYS.has(key.toLowerCase())) {
        detectedTokens.push(key.toLowerCase());
      }
    }

    // 4. Optionally strip sensitive tokens if requested by user
    if (stripTokens && detectedTokens.length > 0) {
      for (const tokenKey of detectedTokens) {
        searchParams.delete(tokenKey);
      }
      parsed.search = searchParams.toString();
    }

    // Never transmit user credentials in URL (e.g. http://user:pass@host)
    if (parsed.username || parsed.password) {
      parsed.username = "";
      parsed.password = "";
    }

    return {
      isValid: true,
      sanitizedUrl: parsed.toString(),
      normalizedHost: host,
      scheme: parsed.protocol.replace(":", ""),
      sensitiveTokensDetected: detectedTokens,
    };
  }

  /**
   * Determines if a hostname is private, loopback, link-local, or cloud-metadata.
   */
  public static isInternalOrReservedHost(host: string): boolean {
    if (!host) return true;

    // Loopback names
    if (host === "localhost" || host.endsWith(".localhost") || host === "ip6-localhost" || host === "ip6-loopback") {
      return true;
    }

    // IPv6 Loopback
    if (host === "::1" || host === "[::1]") {
      return true;
    }

    // IPv4 patterns
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = host.match(ipv4Regex);
    if (match) {
      const [, o1, o2, o3, o4] = match.map(Number);
      if (o1 > 255 || o2 > 255 || o3 > 255 || o4 > 255) return true;

      // 0.0.0.0/8 (Broadcast/any)
      if (o1 === 0) return true;

      // 127.0.0.0/8 (Loopback)
      if (o1 === 127) return true;

      // 10.0.0.0/8 (Private RFC 1918)
      if (o1 === 10) return true;

      // 172.16.0.0/12 (Private RFC 1918)
      if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;

      // 192.168.0.0/16 (Private RFC 1918)
      if (o1 === 192 && o2 === 168) return true;

      // 169.254.0.0/16 (Link-local & Cloud Metadata endpoint 169.254.169.254)
      if (o1 === 169 && o2 === 254) return true;

      // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
      if (o1 >= 224) return true;
    }

    return false;
  }
}
