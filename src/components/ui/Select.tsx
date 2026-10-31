"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, helperText, error, options, id, ...props },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-[var(--text-secondary)] select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "flex h-9 w-full appearance-none rounded-lg bg-[var(--bg-secondary)] px-3 pr-9 py-1 text-sm text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors focus-visible:outline-none focus-visible:border-[var(--accent-primary)] focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500/80 focus-visible:border-red-500 focus-visible:ring-red-500",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-[#0c101b] text-slate-100"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
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

Select.displayName = "Select";
