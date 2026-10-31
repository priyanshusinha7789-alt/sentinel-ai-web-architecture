"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 border-b border-[var(--border-subtle)] md:flex-row md:items-center md:justify-between",
        className
      )}
      {...props}
    >
      <div className="space-y-1.5">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-2" />}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}

export function SectionContainer({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn("w-full py-6 space-y-6", className)}
      {...props}
    >
      {children}
    </section>
  );
}
