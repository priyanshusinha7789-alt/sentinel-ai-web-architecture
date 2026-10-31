"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Table = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-xs text-[var(--text-primary)] text-left", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-medium uppercase tracking-wider text-[11px]", className)}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("divide-y divide-[var(--border-subtle)]", className)}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "transition-colors hover:bg-[var(--bg-surface-elevated)]/60 data-[state=selected]:bg-[var(--bg-surface-elevated)]",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn("h-10 px-4 align-middle font-medium select-none whitespace-nowrap", className)}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

export const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";
