"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "banner" | "card";
}

export function ErrorMessage({
  title = "Analysis Error",
  message,
  onRetry,
  variant = "banner",
  className,
  ...props
}: ErrorMessageProps) {
  if (variant === "card") {
    return (
      <div
        className={cn(
          "p-6 rounded-xl border border-red-500/30 bg-red-950/20 text-center space-y-3",
          className
        )}
        role="alert"
        {...props}
      >
        <div className="inline-flex p-2.5 rounded-full bg-red-500/10 text-red-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-red-200">{title}</h4>
          <p className="text-xs text-red-300/80 mt-1 max-w-md mx-auto">{message}</p>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/40 text-red-200 hover:bg-red-500/10"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Retry Analysis
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-lg border border-red-500/30 bg-red-950/20 text-red-200 text-xs",
        className
      )}
      role="alert"
      {...props}
    >
      <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <span className="font-semibold block mb-0.5">{title}</span>}
        <span className="text-red-300/90 leading-relaxed">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs underline hover:text-white shrink-0 font-medium"
        >
          Retry
        </button>
      )}
    </div>
  );
}
