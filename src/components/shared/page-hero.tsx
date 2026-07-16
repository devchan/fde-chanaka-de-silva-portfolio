import * as React from "react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "bg-grid relative overflow-hidden border-b border-card-border",
        className
      )}
    >
      <div
        aria-hidden
        className="aurora-bg absolute inset-0 opacity-60 dark:opacity-80"
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 pt-14 md:pb-20 md:pt-20">
        <p className="mb-4 text-xs font-semibold uppercase text-gradient">
          {eyebrow}
        </p>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
          {description}
        </p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
