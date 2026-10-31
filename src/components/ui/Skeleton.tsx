"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--bg-surface-elevated)] opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-[var(--border-subtle)]">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === 0 ? "w-1/3" : i === 1 ? "w-1/4" : "w-1/6"
          )}
        />
      ))}
    </div>
  );
}
