"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/data/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "flex w-full max-w-6xl items-center justify-between gap-2 rounded-2xl px-4 py-2.5 transition-all duration-300",
          scrolled || open ? "glass shadow-lg shadow-black/5" : "border border-transparent"
        )}
        aria-label="Main navigation"
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 text-sm font-semibold tracking-normal"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--accent-1),var(--accent-3))] font-mono text-xs font-bold text-white">
            CD
          </span>
          <span className="hidden sm:block">{site.name}</span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "relative rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              )}
            >
              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-surface-strong"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
              )
            }
            aria-label="Open command palette"
            className="hidden h-9 items-center gap-2 rounded-full border border-card-border bg-surface px-3 text-xs text-muted transition-colors hover:text-foreground md:flex"
          >
            <Command className="h-3.5 w-3.5" />
            <kbd className="font-mono text-[10px]">Ctrl K</kbd>
          </button>
          <ThemeToggle />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-surface text-muted lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass absolute top-[72px] mx-4 w-[calc(100%-2rem)] max-w-6xl rounded-2xl p-3 shadow-xl lg:hidden"
          >
            <div className="grid grid-cols-2 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-surface-strong text-foreground"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
