"use client";

import React, { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "flex items-start gap-2.5 cursor-pointer select-none group",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div className="h-4 w-4 rounded border border-[var(--border-medium)] bg-[var(--bg-secondary)] transition-all peer-checked:bg-[var(--accent-primary)] peer-checked:border-[var(--accent-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--bg-main)] group-hover:border-[var(--text-muted)]" />
          <Check className="absolute h-3 w-3 text-slate-950 opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none stroke-[3]" />
        </div>
        {(label || description) && (
          <div className="text-xs">
            {label && (
              <span className="font-medium text-[var(--text-primary)] leading-none block">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[var(--text-muted)] mt-0.5 block">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "flex items-center justify-between gap-3 cursor-pointer select-none",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {(label || description) && (
          <div className="text-xs flex-1">
            {label && (
              <span className="font-medium text-[var(--text-primary)] block">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[var(--text-muted)] mt-0.5 block">
                {description}
              </span>
            )}
          </div>
        )}
        <div className="relative inline-flex items-center">
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div className="h-5 w-9 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-medium)] transition-colors peer-checked:bg-[var(--accent-primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-primary)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--bg-main)]" />
          <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4 peer-checked:bg-slate-950 shadow-sm" />
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";
