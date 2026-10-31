"use client";

import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent-primary)] text-slate-950 font-semibold hover:brightness-110 active:brightness-95 shadow-sm",
        secondary:
          "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-medium)] active:bg-[var(--bg-surface)]",
        outline:
          "bg-transparent text-[var(--text-primary)] border border-[var(--border-medium)] hover:bg-[var(--bg-surface-elevated)] hover:text-white active:bg-[var(--bg-surface)]",
        ghost:
          "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] active:bg-[var(--bg-surface)]",
        danger:
          "bg-red-600/90 text-white font-semibold hover:bg-red-500 active:bg-red-700 shadow-sm",
        cyan:
          "bg-[var(--accent-secondary)] text-slate-950 font-semibold hover:brightness-110 active:brightness-95 shadow-sm",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md gap-1.5",
        md: "h-9 px-4 text-sm rounded-lg gap-2",
        lg: "h-11 px-6 text-base rounded-lg gap-2.5",
        icon: "h-9 w-9 rounded-lg p-0",
        "icon-sm": "h-7 w-7 rounded-md p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
