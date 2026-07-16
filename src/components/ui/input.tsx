import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-card-border bg-surface px-4 text-sm text-foreground placeholder:text-muted/70 transition-colors focus:border-indigo-400/50 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-card-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/70 transition-colors focus:border-indigo-400/50 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
