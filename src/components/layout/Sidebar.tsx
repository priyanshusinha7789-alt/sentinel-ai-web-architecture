"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  SearchCode,
  Globe2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  isReady?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Landing Page",
    href: "/",
    icon: <Globe2 className="h-4 w-4" />,
    isReady: true,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    isReady: true,
  },
  {
    label: "Threat Analyzer",
    href: "/analyzer",
    icon: <ShieldAlert className="h-4 w-4" />,
    badge: "Engine",
    isReady: false,
  },
  {
    label: "Investigations",
    href: "/investigations",
    icon: <SearchCode className="h-4 w-4" />,
    isReady: false,
  },
  {
    label: "Threat Intelligence",
    href: "/threat-intel",
    icon: <Globe2 className="h-4 w-4" />,
    badge: "Proxy",
    isReady: false,
  },
  {
    label: "Forensic Reports",
    href: "/reports",
    icon: <FileText className="h-4 w-4" />,
    isReady: false,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="h-4 w-4" />,
    isReady: false,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all duration-200 z-30 select-none",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-subtle)]">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--accent-primary)] shrink-0 shadow-sm">
            <Shield className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-wider text-[var(--text-primary)] uppercase truncate">
                SENTINEL AI
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono truncate">
                CYBER FORENSICS
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2">
          {!isCollapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Core Modules
            </span>
          )}
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative",
                isActive
                  ? "bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              )}
            >
              <span className={cn("shrink-0", isActive && "text-[var(--accent-primary)]")}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                Local Engine
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              v1.0.0
            </span>
          </div>
        ) : (
          <div className="flex justify-center" title="Local Heuristic Engine Active">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
}
