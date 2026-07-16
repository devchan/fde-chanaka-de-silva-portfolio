import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-foreground text-background hover:opacity-85 shadow-lg shadow-black/10 dark:shadow-white/5",
        gradient:
          "text-white bg-[linear-gradient(100deg,var(--accent-1),var(--accent-2),var(--accent-3))] bg-[length:150%_150%] bg-left hover:bg-right shadow-lg shadow-indigo-500/20",
        outline:
          "border border-card-border bg-surface hover:bg-surface-strong text-foreground",
        ghost: "hover:bg-surface text-muted hover:text-foreground",
      },
      size: {
        sm: "h-8 px-4 text-xs",
        md: "h-10 px-5",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
