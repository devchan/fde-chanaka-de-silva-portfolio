import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "gradient" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function LinkButton({
  className,
  variant = "gradient",
  size = "md",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
