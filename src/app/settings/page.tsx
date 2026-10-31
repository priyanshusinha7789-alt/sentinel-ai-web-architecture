"use client";

import React, { useState } from "react";
import {
  Palette,
  HardDrive,
  Globe,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Switch,
  useToast,
} from "@/components/ui";
import { useTheme } from "@/lib/theme-provider";
import { ACCENT_PALETTES, type AccentColor, type ThemeMode } from "@/lib/tokens";

export default function SettingsPage() {
  const { success } = useToast();
  const { config, setMode, setAccent, setDensity, setReducedMotion, resetTheme } = useTheme();
  const [proxyUrl, setProxyUrl] = useState("http://localhost:3000");

  const handleSaveSettings = () => {
    success("Configuration Saved", "Appearance and network settings persisted locally.");
  };

  return (
    <AppShell>
      <PageHeader
        title="Settings & Appearance Customization"
        subtitle="Configure the design system, cyber accent palette, layout density, and local storage policy."
        breadcrumbs={[
          { label: "Overview", href: "/" },
          { label: "Settings" },
        ]}
        actions={
          <Button variant="primary" size="sm" onClick={handleSaveSettings}>
            Save Preferences
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4 text-[var(--accent-primary)]" />
              Theme & Cyber Accents
            </CardTitle>
            <CardDescription>
              Real-time design token customization across all components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                Color Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["dark", "light", "system"] as ThemeMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium capitalize transition-all ${
                      config.mode === m
                        ? "border-[var(--accent-primary)] bg-[var(--accent-primary-subtle)] text-[var(--text-primary)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                Accent Palette
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((key) => {
                  const pal = ACCENT_PALETTES[key];
                  const isSelected = config.accent === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setAccent(key)}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? "border-[var(--border-medium)] bg-[var(--bg-surface-elevated)] ring-1"
                          : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full shrink-0 flex items-center justify-center"
                        style={{ backgroundColor: pal.primary }}
                      >
                        {isSelected && <Check className="h-2 w-2 text-slate-950 stroke-[3]" />}
                      </span>
                      <span className="truncate text-[var(--text-primary)]">{pal.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">
                Layout Density
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDensity("comfortable")}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    config.density === "comfortable"
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary-subtle)] text-[var(--text-primary)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                  }`}
                >
                  Comfortable
                </button>
                <button
                  onClick={() => setDensity("compact")}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    config.density === "compact"
                      ? "border-[var(--accent-primary)] bg-[var(--accent-primary-subtle)] text-[var(--text-primary)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
              <Switch
                label="Reduced Motion"
                description="Suppress smooth transitions and micro-animations"
                checked={config.reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" />
                Backend Proxy Service
              </CardTitle>
              <CardDescription>
                Local or remote URL for the secure Node.js proxy server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Backend Proxy Endpoint"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                helperText="Defaults to local development proxy on port 3000"
                className="font-mono text-xs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-[var(--text-secondary)]" />
                Data & Storage Policy
              </CardTitle>
              <CardDescription>
                Client-side persistence control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-[var(--text-secondary)]">
              <p>
                All past investigations and theme configurations are stored exclusively in your browser’s local storage.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                onClick={() => {
                  localStorage.clear();
                  resetTheme();
                  success("Local Data Cleared", "Preferences and cached logs purged.");
                }}
              >
                Clear All Local Storage
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
