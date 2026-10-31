"use client";

import React from "react";
import Link from "next/link";
import { Menu, Shield, ShieldCheck } from "lucide-react";
import { ThemeCustomizer } from "@/components/common/ThemeCustomizer";
import { Button } from "@/components/ui/Button";

export interface HeaderProps {
  onOpenMobileNav: () => void;
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onOpenMobileNav}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] md:hidden"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Brand indicator */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="h-7 w-7 rounded-md bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--accent-primary)]">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-bold text-xs tracking-wider text-[var(--text-primary)] uppercase">
            SENTINEL AI
          </span>
        </div>

        {/* Engine Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px] text-[var(--text-secondary)]">
            Heuristic Detection Engine:{" "}
            <span className="text-emerald-400 font-medium">Ready</span>
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        <Link href="/analyzer">
          <Button size="sm" variant="primary" className="hidden sm:inline-flex text-xs">
            Analyze Email
          </Button>
        </Link>
        <ThemeCustomizer />
      </div>
    </header>
  );
}
