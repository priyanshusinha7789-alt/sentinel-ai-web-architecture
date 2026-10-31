"use client";

import React, { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isSearch?: boolean;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftIcon,
      isSearch,
      onClear,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[var(--text-secondary)] select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {isSearch && !leftIcon && (
            <Search className="absolute left-3 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
          )}
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            value={value}
            className={cn(
              "flex h-9 w-full rounded-lg bg-[var(--bg-secondary)] px-3 py-1 text-sm text-[var(--text-primary)] border border-[var(--border-subtle)] placeholder:text-[var(--text-muted)] transition-colors focus-visible:outline-none focus-visible:border-[var(--accent-primary)] focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-50",
              (isSearch || leftIcon) && "pl-9",
              onClear && value && "pr-8",
              error && "border-red-500/80 focus-visible:border-red-500 focus-visible:ring-red-500",
              className
            )}
            {...props}
          />
          {onClear && value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2.5 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded focus:outline-none"
              aria-label="Clear input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
