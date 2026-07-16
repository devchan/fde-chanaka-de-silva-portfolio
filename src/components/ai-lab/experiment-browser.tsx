"use client";

import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Experiment } from "@/lib/types";
import { cn } from "@/lib/utils";

const categories = [
  "All",
  "AI Agents",
  "RAG",
  "Prompt Engineering",
  "LLM Systems",
  "Semantic Search",
  "MCP",
  "Orchestration",
] as const;

export function ExperimentBrowser({
  experiments,
}: {
  experiments: Experiment[];
}) {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return experiments.filter((experiment) => {
      const matchesCategory =
        category === "All" || experiment.category === category;
      const matchesQuery =
        q.length === 0 ||
        [
          experiment.title,
          experiment.summary,
          experiment.category,
          experiment.status,
          ...experiment.stack,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, experiments, query]);

  return (
    <div>
      <div className="mb-8 grid gap-4">
        <label className="relative block max-w-xl">
          <span className="sr-only">Search AI experiments</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search AI systems"
            className="pl-9"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="AI Lab categories">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cn(
                "h-9 rounded-lg border px-3 text-sm transition-colors",
                category === item
                  ? "border-transparent bg-foreground text-background"
                  : "border-card-border bg-surface text-muted hover:text-foreground"
              )}
              role="tab"
              aria-selected={category === item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {filtered.map((experiment) => (
          <Link
            key={experiment.slug}
            href={`/ai-lab/${experiment.slug}`}
            className="group rounded-lg border border-card-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-surface"
          >
            <div className="flex items-center justify-between gap-3">
              <Badge variant={experiment.status === "production" ? "success" : "accent"}>
                {experiment.status}
              </Badge>
              <ArrowUpRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-normal group-hover:text-gradient">
              {experiment.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {experiment.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {experiment.stack.slice(0, 5).map((item) => (
                <span key={item} className="rounded-md bg-surface px-2 py-1 font-mono text-[11px] text-muted">
                  {item}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
