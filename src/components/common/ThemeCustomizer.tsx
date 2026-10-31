"use client";

import React, { useState } from "react";
import { Palette, Moon, Sun, Monitor, Check, RotateCcw } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { ACCENT_PALETTES, type AccentColor, type ThemeMode, type LayoutDensity } from "@/lib/tokens";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const { config, setMode, setAccent, setDensity, setReducedMotion, resetTheme } = useTheme();

  const modes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { id: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { id: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
  ];

  const densities: { id: LayoutDensity; label: string; desc: string }[] = [
    { id: "comfortable", label: "Comfortable", desc: "Default spacing for standard screens" },
    { id: "compact", label: "Compact", desc: "Denser padding for forensic tables & data" },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setIsOpen(true)}
        aria-label="Customize Appearance"
        title="Customize Theme & Appearance"
      >
        <Palette className="h-4 w-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Appearance & Theme Customization"
        description="Tailor the cybersecurity visual interface, color tokens, and layout density."
        confirmLabel="Done"
        onConfirm={() => setIsOpen(false)}
      >
        <div className="space-y-6 py-1">
          {/* Theme Mode */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              Color Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all",
                    config.mode === m.id
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary-subtle)] text-[var(--text-primary)] shadow-sm"
                      : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color Palette */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              Cyber Accent Color
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((key) => {
                const palette = ACCENT_PALETTES[key];
                const isSelected = config.accent === key;
                return (
                  <button
                    key={key}
                    onClick={() => setAccent(key)}
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium transition-all text-left",
                      isSelected
                        ? "border-[var(--border-medium)] bg-[var(--bg-surface-elevated)] ring-1"
                        : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface-elevated)]"
                    )}
                    style={{
                      borderColor: isSelected ? palette.primary : undefined,
                    }}
                  >
                    <span
                      className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: palette.primary }}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 text-slate-950 stroke-[3]" />}
                    </span>
                    <span className="truncate text-[var(--text-primary)]">{palette.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layout Density */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
              Information Density
            </label>
            <div className="grid grid-cols-2 gap-2">
              {densities.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDensity(d.id)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    config.density === d.id
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary-subtle)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                  )}
                >
                  <span className="block text-xs font-semibold text-[var(--text-primary)]">
                    {d.label}
                  </span>
                  <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">
                    {d.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <Switch
              label="Reduce Motion"
              description="Disable UI transitions and micro-animations for comfort"
              checked={config.reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
            />
          </div>

          {/* Reset button */}
          <div className="pt-2 flex justify-start">
            <Button
              size="sm"
              variant="ghost"
              onClick={resetTheme}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              className="text-xs text-[var(--text-muted)]"
            >
              Reset to Factory Defaults
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
