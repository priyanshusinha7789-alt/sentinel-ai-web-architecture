"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  showCount?: boolean;
  isMonospace?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      showCount = false,
      isMonospace = false,
      value,
      maxLength,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const textLength = typeof value === "string" ? value.length : 0;
    const lineCount = typeof value === "string" ? value.split("\n").length : 0;

    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-xs font-medium text-[var(--text-secondary)] select-none"
            >
              {label}
            </label>
          )}
          {showCount && (
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {lineCount} lines | {textLength}
              {maxLength ? `/${maxLength}` : " chars"}
            </span>
          )}
        </div>
        <textarea
          id={inputId}
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            "flex min-h-[120px] w-full rounded-lg bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] border border-[var(--border-subtle)] placeholder:text-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:border-[var(--accent-primary)] focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            isMonospace && "font-mono text-xs leading-relaxed",
            error && "border-red-500/80 focus-visible:border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
