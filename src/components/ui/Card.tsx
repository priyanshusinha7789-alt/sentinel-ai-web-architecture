"use client";

import React, { forwardRef } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] transition-all duration-200",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-5 pb-3", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold leading-none tracking-tight text-[var(--text-primary)]", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-xs text-[var(--text-muted)]", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-2", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-5 pt-0 border-t border-[var(--border-subtle)] mt-3", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "neutral";
    label: string;
  };
  highlight?: "emerald" | "cyan" | "amber" | "rose" | "none";
}

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      className,
      title,
      value,
      subtext,
      icon,
      trend,
      highlight = "none",
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "relative overflow-hidden p-5 flex flex-col justify-between hover:border-[var(--border-medium)]",
          highlight === "emerald" && "border-l-4 border-l-emerald-500",
          highlight === "cyan" && "border-l-4 border-l-cyan-500",
          highlight === "amber" && "border-l-4 border-l-amber-500",
          highlight === "rose" && "border-l-4 border-l-rose-500",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {title}
          </p>
          {icon && (
            <div className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3">
          <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
            {value}
          </h2>
          {(subtext || trend) && (
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center font-medium gap-0.5",
                    trend.direction === "up" && "text-emerald-400",
                    trend.direction === "down" && "text-rose-400",
                    trend.direction === "neutral" && "text-[var(--text-muted)]"
                  )}
                >
                  {trend.direction === "up" && <TrendingUp className="h-3 w-3" />}
                  {trend.direction === "down" && <TrendingDown className="h-3 w-3" />}
                  {trend.direction === "neutral" && <Minus className="h-3 w-3" />}
                  {trend.label}
                </span>
              )}
              {subtext && (
                <span className="text-[var(--text-muted)] truncate">{subtext}</span>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }
);
MetricCard.displayName = "MetricCard";
