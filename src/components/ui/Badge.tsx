"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { RISK_LEVELS, type RiskLevel } from "@/lib/tokens";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
        emerald:
          "bg-emerald-950/50 text-emerald-300 border-emerald-800/60",
        cyan:
          "bg-cyan-950/50 text-cyan-300 border-cyan-800/60",
        amber:
          "bg-amber-950/50 text-amber-300 border-amber-800/60",
        orange:
          "bg-orange-950/50 text-orange-300 border-orange-800/60",
        red:
          "bg-red-950/50 text-red-300 border-red-800/60",
        outline:
          "bg-transparent text-[var(--text-secondary)] border-[var(--border-medium)]",
      },
      size: {
        sm: "text-[11px] px-2 py-0.2",
        md: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      )}
      {children}
    </span>
  );
}

export interface RiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  score?: number;
  category: RiskLevel;
  showScore?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({
  score,
  category,
  showScore = true,
  showIcon = true,
  size = "md",
  className,
  ...props
}: RiskBadgeProps) {
  const meta = RISK_LEVELS[category] || RISK_LEVELS.MODERATE;

  const renderIcon = () => {
    if (!showIcon) return null;
    switch (category) {
      case "LOW":
        return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
      case "MODERATE":
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      case "HIGH":
        return <ShieldAlert className="h-3.5 w-3.5 text-orange-400" />;
      case "CRITICAL":
        return <AlertOctagon className="h-3.5 w-3.5 text-red-400" />;
    }
  };

  const getVariant = () => {
    switch (category) {
      case "LOW":
        return "emerald";
      case "MODERATE":
        return "amber";
      case "HIGH":
        return "orange";
      case "CRITICAL":
        return "red";
    }
  };

  return (
    <span
      className={cn(
        badgeVariants({ variant: getVariant(), size }),
        "font-semibold tracking-wide",
        className
      )}
      role="status"
      aria-label={`Risk category: ${meta.label}${score !== undefined ? `, Score: ${score} out of 100` : ""}`}
      {...props}
    >
      {renderIcon()}
      <span>{meta.label}</span>
      {showScore && score !== undefined && (
        <span className="font-mono text-[11px] opacity-80 pl-1 border-l border-current/30">
          {score}/100
        </span>
      )}
    </span>
  );
}
