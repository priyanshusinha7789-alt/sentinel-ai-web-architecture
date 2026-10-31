"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items, className, ...props }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn("flex items-center space-x-1.5 text-xs text-[var(--text-muted)]", className)}
      {...props}
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3 w-3 text-[var(--text-muted)] opacity-60" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[var(--text-primary)] transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate max-w-[180px]",
                  isLast ? "text-[var(--text-primary)] font-medium" : ""
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
