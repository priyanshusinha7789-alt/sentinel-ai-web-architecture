/**
 * SENTINEL AI - Input Normalization Module
 * 
 * Prepares raw user text safely for inspection:
 * - Normalizes Unicode (NFKC)
 * - Strips non-printable control characters (except standard newlines/tabs)
 * - Standardizes line breaks (\r\n -> \n)
 * - Detects and safely extracts plain text from HTML without executing DOM scripts
 * - Enforces size limits to protect against ReDoS / CPU exhaustion
 */

export interface NormalizedInput {
  normalizedText: string;
  isHtmlDetected: boolean;
  extractedAnchors: { href: string; text: string }[];
}

export class InputNormalizer {
  private static readonly MAX_BODY_BYTES = 500000; // 500 KB limit

  static normalize(raw: string): NormalizedInput {
    if (!raw || typeof raw !== "string") {
      return { normalizedText: "", isHtmlDetected: false, extractedAnchors: [] };
    }

    // 1. Size constraint guard
    let text = raw;
    if (text.length > this.MAX_BODY_BYTES) {
      text = text.substring(0, this.MAX_BODY_BYTES);
    }

    // 2. Unicode normalization (NFKC decomposes compatibility chars & normalizes lookalikes)
    text = text.normalize("NFKC");

    // 3. Line break unification
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // 4. Strip dangerous non-printable ASCII control characters (keeping \n and \t)
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    // 5. Detect HTML markup and extract <a> anchors safely via regex
    const isHtml = /<[a-z][\s\S]*>/i.test(text);
    const extractedAnchors: { href: string; text: string }[] = [];

    if (isHtml) {
      const anchorRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      let match: RegExpExecArray | null;

      while ((match = anchorRegex.exec(text)) !== null) {
        const href = match[1].trim();
        // Strip nested tags from link text
        const anchorText = match[2].replace(/<[^>]+>/g, "").trim();
        if (href) {
          extractedAnchors.push({ href, text: anchorText });
        }
      }

      // Convert HTML entities and strip tags for plain text inspection
      text = this.stripHtmlTags(text);
    }

    return {
      normalizedText: text.trim(),
      isHtmlDetected: isHtml,
      extractedAnchors,
    };
  }

  private static stripHtmlTags(html: string): string {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s{2,}/g, " ");
  }
}
