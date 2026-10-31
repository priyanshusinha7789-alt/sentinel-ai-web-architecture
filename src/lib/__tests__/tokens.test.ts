import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_THEME_CONFIG, ACCENT_PALETTES, RISK_LEVELS } from "../tokens";
import { cn } from "../utils";

describe("Design System & Tokens", () => {
  it("provides valid default theme configuration", () => {
    assert.equal(DEFAULT_THEME_CONFIG.mode, "dark");
    assert.equal(DEFAULT_THEME_CONFIG.accent, "emerald");
    assert.equal(DEFAULT_THEME_CONFIG.density, "comfortable");
    assert.equal(DEFAULT_THEME_CONFIG.reducedMotion, false);
  });

  it("contains all 4 required cybersecurity accent palettes", () => {
    const keys = Object.keys(ACCENT_PALETTES);
    assert.deepEqual(keys, ["emerald", "cyan", "electric", "amber"]);
    assert.ok(ACCENT_PALETTES.emerald.primary.startsWith("#"));
    assert.ok(ACCENT_PALETTES.cyan.primary.startsWith("#"));
  });

  it("enforces complete 4-tier risk level classifications", () => {
    assert.ok(RISK_LEVELS.LOW);
    assert.ok(RISK_LEVELS.MODERATE);
    assert.ok(RISK_LEVELS.HIGH);
    assert.ok(RISK_LEVELS.CRITICAL);

    assert.equal(RISK_LEVELS.LOW.range, "0–24");
    assert.equal(RISK_LEVELS.MODERATE.range, "25–49");
    assert.equal(RISK_LEVELS.HIGH.range, "50–74");
    assert.equal(RISK_LEVELS.CRITICAL.range, "75–100");
  });

  it("merges CSS classes cleanly using cn helper", () => {
    const result = cn("p-4", "text-sm", false && "hidden", "p-6");
    // tailwind-merge resolves p-6 over p-4
    assert.equal(result, "text-sm p-6");
  });
});
