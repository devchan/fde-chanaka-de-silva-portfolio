"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  FlaskConical,
  Layers,
  Search,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { navLinks } from "@/data/site";
import { projects } from "@/data/projects";
import { blogPosts } from "@/data/blog";
import { experiments } from "@/data/experiments";
import { cn } from "@/lib/utils";

interface PaletteItem {
  id: string;
  title: string;
  hint: string;
  href: string;
  group: "Pages" | "Projects" | "Blog" | "AI Lab";
}

const icons: Record<PaletteItem["group"], React.ReactNode> = {
  Pages: <User className="h-4 w-4" />,
  Projects: <Layers className="h-4 w-4" />,
  Blog: <FileText className="h-4 w-4" />,
  "AI Lab": <FlaskConical className="h-4 w-4" />,
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<PaletteItem[]>(
    () => [
      ...navLinks.map((l) => ({
        id: `page-${l.href}`,
        title: l.label,
        hint: "Page",
        href: l.href,
        group: "Pages" as const,
      })),
      ...projects.map((p) => ({
        id: `project-${p.slug}`,
        title: p.title,
        hint: p.category,
        href: `/projects/${p.slug}`,
        group: "Projects" as const,
      })),
      ...blogPosts.map((b) => ({
        id: `blog-${b.slug}`,
        title: b.title,
        hint: b.category,
        href: `/blog/${b.slug}`,
        group: "Blog" as const,
      })),
      ...experiments.map((e) => ({
        id: `lab-${e.slug}`,
        title: e.title,
        hint: e.category,
        href: `/ai-lab/${e.slug}`,
        group: "AI Lab" as const,
      })),
    ],
    []
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)
    );
  }, [items, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  function select(item: PaletteItem) {
    close();
    router.push(item.href);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18 }}
            className="glass w-full max-w-xl overflow-hidden rounded-2xl bg-background/90 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-card-border px-4">
              <Search className="h-4 w-4 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, filtered.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === "Enter" && filtered[active]) {
                    select(filtered[active]);
                  }
                }}
                placeholder="Search pages, projects, posts, experiments…"
                className="h-13 w-full bg-transparent py-4 text-sm outline-none placeholder:text-muted/70"
                aria-label="Search"
              />
              <kbd className="rounded-md border border-card-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted">
                ESC
              </kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  No results for “{query}”
                </p>
              )}
              {filtered.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => select(item)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    i === active ? "bg-surface-strong" : "hover:bg-surface"
                  )}
                >
                  <span className="text-muted">{icons[item.group]}</span>
                  <span className="flex-1 truncate">{item.title}</span>
                  <span className="text-xs text-muted">{item.hint}</span>
                  {i === active && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
