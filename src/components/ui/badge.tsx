import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "outline" | "success";

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface text-muted border border-card-border",
  accent:
    "border border-indigo-400/30 bg-indigo-400/10 text-indigo-500 dark:text-indigo-300",
  outline: "border border-card-border text-foreground",
  success:
    "border border-emerald-400/30 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
