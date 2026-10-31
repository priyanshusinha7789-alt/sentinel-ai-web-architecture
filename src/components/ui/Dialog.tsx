"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  cancelLabel?: string;
  variant?: "default" | "danger";
  maxWidth?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  onConfirm,
  cancelLabel = "Cancel",
  variant = "default",
  maxWidth = "md",
  isLoading = false,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        className={cn(
          "w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-medium)] shadow-[var(--shadow-elevated)] overflow-hidden",
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="flex items-center justify-between p-5 pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h3 id="dialog-title" className="text-base font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 max-h-[75vh] overflow-y-auto text-sm text-[var(--text-secondary)]">
          {children}
        </div>

        <div className="flex items-center justify-end gap-2.5 p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
          <Button size="sm" variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          {confirmLabel && onConfirm && (
            <Button
              size="sm"
              variant={variant === "danger" ? "danger" : "primary"}
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
