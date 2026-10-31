"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Shield } from "lucide-react";
import { NAV_ITEMS } from "./Sidebar";
import { cn } from "@/lib/utils";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden bg-black/75 backdrop-blur-sm animate-in fade-in-50 duration-200"
      onClick={onClose}
    >
      <div
        className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--accent-primary)]">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-wider text-[var(--text-primary)] block">
                  SENTINEL AI
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono block">
                  SECURITY FORENSICS
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Links */}
          <nav className="mt-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                  )}
                >
                  <span className={cn(isActive && "text-[var(--accent-primary)]")}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-muted)]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px]">Engine: Ready (Local)</span>
          </div>
          <p className="text-[10px] opacity-70">
            Explainable AI threat detection platform.
          </p>
        </div>
      </div>
    </div>
  );
}
