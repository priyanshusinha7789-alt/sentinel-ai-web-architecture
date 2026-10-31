"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = "right",
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={menuRef} className={cn("relative inline-block text-left", className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            "absolute z-40 mt-1.5 w-48 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-medium)] p-1 shadow-[var(--shadow-elevated)] backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors text-left select-none",
                item.danger
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {item.icon && <span className="h-3.5 w-3.5 shrink-0">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
