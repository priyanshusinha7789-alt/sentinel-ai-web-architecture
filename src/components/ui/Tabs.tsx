"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (val: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  ...props
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : internalTab;

  const setActiveTab = (val: string) => {
    if (value === undefined) setInternalTab(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full space-y-3", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  leftIcon?: React.ReactNode;
}

export function TabTrigger({
  value,
  children,
  leftIcon,
  className,
  ...props
}: TabTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabTrigger must be used inside Tabs");

  const isActive = ctx.activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.setActiveTab(value)}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-primary)]",
        isActive
          ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] shadow-sm font-semibold border border-[var(--border-subtle)]"
          : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/50",
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  );
}

export interface TabContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabContent({ value, children, className, ...props }: TabContentProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabContent must be used inside Tabs");

  if (ctx.activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("animate-in fade-in-50 duration-150 focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
