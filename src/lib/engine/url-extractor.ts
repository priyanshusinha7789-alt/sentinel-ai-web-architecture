/**
 * SENTINEL AI - Enhanced URL Extraction Module
 * 
 * Safely extracts URL candidates from both free text and parsed HTML anchor tags.
 * Strips trailing sentence punctuation without corrupting URL query parameters.
 */

export interface ExtractedUrlTarget {
  url: string;
  displayedText?: string;
  isHtmlAnchor: boolean;
}

export class UrlExtractor {
  private static readonly urlRegex = /https?:\/\/[^\s\]\[\(\)\{\}<>"']+/gi;

  /**
   * Extracts clean URLs from plain text or raw email bodies.
   */
  static extractFromText(text: string): string[] {
    if (!text || typeof text !== "string") return [];
    const matches = text.match(this.urlRegex) || [];
    const unique = new Set<string>();

    for (const rawUrl of matches) {
      const clean = this.cleanTrailingPunctuation(rawUrl);
      if (clean) {
        unique.add(clean);
      }
    }

    return Array.from(unique);
  }

  /**
   * Combines plain text URLs with HTML anchor pairs { href, text }
   */
  static extractDetailed(
    text: string,
    htmlAnchors: { href: string; text: string }[] = []
  ): ExtractedUrlTarget[] {
    const map = new Map<string, ExtractedUrlTarget>();

    // 1. Ingest HTML anchors first (they preserve link text)
    for (const anchor of htmlAnchors) {
      const cleanHref = this.cleanTrailingPunctuation(anchor.href);
      if (cleanHref) {
        map.set(cleanHref, {
          url: cleanHref,
          displayedText: anchor.text.trim() || undefined,
          isHtmlAnchor: true,
        });
      }
    }

    // 2. Ingest free-text regex URLs
    const plainUrls = this.extractFromText(text);
    for (const url of plainUrls) {
      if (!map.has(url)) {
        map.set(url, {
          url,
          isHtmlAnchor: false,
        });
      }
    }

    return Array.from(map.values());
  }

  private static cleanTrailingPunctuation(rawUrl: string): string {
    return rawUrl.trim().replace(/[.,;:!?]+$/, "").trim();
  }
}
