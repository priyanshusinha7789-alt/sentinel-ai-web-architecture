"use client";

import React, { createContext, useContext, useState, useRef } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = (item: Omit<ToastItem, "id">) => {
    counterRef.current += 1;
    const id = `toast-${counterRef.current}`;
    const newToast: ToastItem = { ...item, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = item.duration || 4000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (title: string, message?: string) =>
    addToast({ type: "success", title, message });
  const error = (title: string, message?: string) =>
    addToast({ type: "error", title, message });
  const warning = (title: string, message?: string) =>
    addToast({ type: "warning", title, message });
  const info = (title: string, message?: string) =>
    addToast({ type: "info", title, message });

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-2",
              t.type === "success" && "bg-emerald-950/90 border-emerald-800 text-emerald-200",
              t.type === "warning" && "bg-amber-950/90 border-amber-800 text-amber-200",
              t.type === "error" && "bg-red-950/90 border-red-800 text-red-200",
              t.type === "info" && "bg-slate-900/90 border-slate-700 text-slate-200"
            )}
            role="status"
          >
            {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              <span className="font-semibold block">{t.title}</span>
              {t.message && <span className="opacity-80 mt-0.5 block">{t.message}</span>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="p-0.5 rounded opacity-70 hover:opacity-100 focus:outline-none"
              aria-label="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
