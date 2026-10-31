/**
 * SENTINEL AI - Centralized Design Tokens
 * 
 * Provides a single source of truth for all brand colors, accents,
 * typography scales, radii, shadows, and risk severity indicators.
 */

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'emerald' | 'cyan' | 'electric' | 'amber';
export type LayoutDensity = 'comfortable' | 'compact';

export interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentColor;
  density: LayoutDensity;
  reducedMotion: boolean;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'dark',
  accent: 'emerald',
  density: 'comfortable',
  reducedMotion: false,
};

export const ACCENT_PALETTES = {
  emerald: {
    name: 'Emerald Green',
    primary: '#10b981',
    primaryHover: '#059669',
    primarySubtle: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#34d399',
    ring: '#10b981',
  },
  cyan: {
    name: 'Cyber Cyan',
    primary: '#06b6d4',
    primaryHover: '#0891b2',
    primarySubtle: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)',
    text: '#22d3ee',
    ring: '#06b6d4',
  },
  electric: {
    name: 'Electric Green',
    primary: '#22c55e',
    primaryHover: '#16a34a',
    primarySubtle: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    text: '#4ade80',
    ring: '#22c55e',
  },
  amber: {
    name: 'Security Amber',
    primary: '#f59e0b',
    primaryHover: '#d97706',
    primarySubtle: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: '#fbbf24',
    ring: '#f59e0b',
  },
} as const;

export const RISK_LEVELS = {
  LOW: {
    label: 'Low Risk',
    range: '0–24',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    text: '#34d399',
    badgeClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
    description: 'No significant social engineering or structural threats detected in the provided input.',
  },
  MODERATE: {
    label: 'Moderate Risk',
    range: '25–49',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    text: '#fbbf24',
    badgeClass: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
    description: 'Contains cautionary signals (e.g. urgency words, shorteners). Exercise standard verification.',
  },
  HIGH: {
    label: 'High Risk',
    range: '50–74',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
    text: '#fb923c',
    badgeClass: 'text-orange-400 bg-orange-950/40 border-orange-800/60',
    description: 'Multiple active social engineering vectors, lookalike domains, or credential lures detected.',
  },
  CRITICAL: {
    label: 'Critical Risk',
    range: '75–100',
    bg: 'rgba(239, 68, 68, 0.14)',
    border: 'rgba(239, 68, 68, 0.4)',
    text: '#f87171',
    badgeClass: 'text-red-400 bg-red-950/40 border-red-800/60',
    description: 'High-confidence indicators of malicious impersonation, spoofed authentication, or credential theft.',
  },
} as const;

export type RiskLevel = keyof typeof RISK_LEVELS;

export const DESIGN_TOKENS = {
  radii: {
    none: '0px',
    sm: '0.25rem',  // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    full: '9999px',
  },
  spacing: {
    headerHeight: '4rem',     // 64px
    sidebarWidth: '16rem',    // 256px
    sidebarCollapsedWidth: '4.5rem', // 72px
  },
  typography: {
    fontSans: 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
    fontMono: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
  },
} as const;
