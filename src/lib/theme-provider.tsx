"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeConfig,
  DEFAULT_THEME_CONFIG,
  ThemeMode,
  AccentColor,
  LayoutDensity,
} from "./tokens";

interface ThemeContextType {
  config: ThemeConfig;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  setDensity: (density: LayoutDensity) => void;
  setReducedMotion: (enabled: boolean) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "sentinel_ai_theme_config";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_THEME_CONFIG, ...JSON.parse(stored) };
        }
      } catch {
        // Fallback to default
      }
    }
    return DEFAULT_THEME_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Silent catch
    }

    const root = document.documentElement;

    // Apply Mode
    const effectiveMode =
      config.mode === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : config.mode;

    if (effectiveMode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // Apply Accent & Density
    root.setAttribute("data-accent", config.accent);
    root.setAttribute("data-density", config.density);

    // Apply Reduced Motion
    if (config.reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [config]);

  const setMode = (mode: ThemeMode) =>
    setConfig((prev) => ({ ...prev, mode }));
  const setAccent = (accent: AccentColor) =>
    setConfig((prev) => ({ ...prev, accent }));
  const setDensity = (density: LayoutDensity) =>
    setConfig((prev) => ({ ...prev, density }));
  const setReducedMotion = (reducedMotion: boolean) =>
    setConfig((prev) => ({ ...prev, reducedMotion }));
  const resetTheme = () => setConfig(DEFAULT_THEME_CONFIG);

  return (
    <ThemeContext.Provider
      value={{
        config,
        setMode,
        setAccent,
        setDensity,
        setReducedMotion,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
