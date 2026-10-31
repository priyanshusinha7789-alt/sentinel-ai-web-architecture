import type { WarningSign, RiskLevel, ScoreCategoryBreakdown } from "./types";

/**
 * SENTINEL AI - Explainable Cap-Based Risk Scorer
 * 
 * Translates observed warning signs into a calibrated 0–100 heuristic risk score.
 * 
 * Formula:
 * 1. For each category c in Categories:
 *    raw_points_c = sum(sign.points * confidence_weight)
 *    capped_points_c = min(raw_points_c, category_cap_c)
 * 2. Total Score = min(100, sum(capped_points_c))
 * 
 * Risk Tiers:
 * - 0–24: LOW RISK
 * - 25–49: MODERATE RISK
 * - 50–74: HIGH RISK
 * - 75–100: CRITICAL RISK
 */
export class RiskScorer {
  static readonly maxScore = 100;

  /**
   * Transparent category point caps.
   * Prevents a single repeated heuristic from monopolizing the total score.
   */
  static readonly categoryCaps: Record<string, number> = {
    "Suspicious Language": 25,
    "Credential Request": 20,
    "Financial Pressure": 20,
    "Social Engineering": 18,
    "Suspicious Instructions": 12,
    "Sender Inconsistency": 30,
    Impersonation: 20,
    "Header Anomaly": 20,
    "Suspicious URL": 25,
  };

  private static readonly confidenceWeights = {
    high: 1.0,
    medium: 0.85,
    low: 0.7,
  };

  static calculate(warningSigns: WarningSign[]): {
    score: number;
    category: RiskLevel;
    breakdown: ScoreCategoryBreakdown[];
  } {
    const categoryTotals: Record<string, number> = {};

    for (const sign of warningSigns) {
      const weight = this.confidenceWeights[sign.confidence || "high"] || 1.0;
      const weightedPoints = Math.round(sign.severityPoints * weight);
      const cat = sign.category;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + weightedPoints;
    }

    const breakdown: ScoreCategoryBreakdown[] = [];
    let totalScore = 0;

    for (const [cat, raw] of Object.entries(categoryTotals)) {
      const cap = this.categoryCaps[cat] ?? 15;
      const capped = Math.min(raw, cap);
      totalScore += capped;

      breakdown.push({
        category: cat,
        rawPoints: raw,
        cappedPoints: capped,
        maxCap: cap,
      });
    }

    const finalScore = Math.min(Math.max(totalScore, 0), this.maxScore);
    const category = this.category(finalScore);

    return {
      score: finalScore,
      category,
      breakdown,
    };
  }

  static score(warningSigns: WarningSign[]): number {
    return this.calculate(warningSigns).score;
  }

  static category(score: number): RiskLevel {
    if (score < 25) return "LOW";
    if (score < 50) return "MODERATE";
    if (score < 75) return "HIGH";
    return "CRITICAL";
  }
}
