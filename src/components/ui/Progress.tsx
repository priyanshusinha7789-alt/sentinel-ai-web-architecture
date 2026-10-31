"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { RISK_LEVELS, type RiskLevel } from "@/lib/tokens";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  variant?: "emerald" | "cyan" | "amber" | "rose" | "default";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function Progress({
  value,
  max = 100,
  variant = "emerald",
  size = "md",
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const barClasses = {
    emerald: "bg-emerald-500",
    cyan: "bg-cyan-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    default: "bg-[var(--accent-primary)]",
  };

  return (
    <div className={cn("w-full space-y-1", className)} {...props}>
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]",
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            barClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
          <span>{value} / {max}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}

export interface RiskGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number; // 0 to 100
  category: RiskLevel;
}

export function RiskGauge({ score, category, className, ...props }: RiskGaugeProps) {
  const meta = RISK_LEVELS[category] || RISK_LEVELS.MODERATE;

  return (
    <div className={cn("p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3", className)} {...props}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-secondary)]">Heuristic Threat Score</span>
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]">
          {score} / 100
        </span>
      </div>

      {/* Segmented Risk Bar */}
      <div className="space-y-1">
        <div className="grid grid-cols-4 gap-1.5 h-2">
          <div
            className={cn(
              "rounded-full transition-opacity",
              score >= 0 ? "bg-emerald-500" : "bg-slate-800",
              score >= 0 ? "opacity-100" : "opacity-30"
            )}
          />
          <div
            className={cn(
              "rounded-full transition-opacity",
              score >= 25 ? "bg-amber-500" : "bg-slate-800",
              score >= 25 ? "opacity-100" : "opacity-30"
            )}
          />
          <div
            className={cn(
              "rounded-full transition-opacity",
              score >= 50 ? "bg-orange-500" : "bg-slate-800",
              score >= 50 ? "opacity-100" : "opacity-30"
            )}
          />
          <div
            className={cn(
              "rounded-full transition-opacity",
              score >= 75 ? "bg-red-500" : "bg-slate-800",
              score >= 75 ? "opacity-100" : "opacity-30"
            )}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono pt-1">
          <span>0 (Low)</span>
          <span>25 (Mod)</span>
          <span>50 (High)</span>
          <span>75+ (Crit)</span>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        {meta.description}
      </p>
    </div>
  );
}
