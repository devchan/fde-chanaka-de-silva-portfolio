"use client";

import { useMemo, useState } from "react";
import { DiagramRenderer } from "@/components/diagrams/diagram-renderer";
import { Badge } from "@/components/ui/badge";
import type { ArchitectureDiagram } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ArchitectureExplorer({
  diagrams,
}: {
  diagrams: ArchitectureDiagram[];
}) {
  const [activeId, setActiveId] = useState(diagrams[0]?.id ?? "");
  const active = useMemo(
    () => diagrams.find((diagram) => diagram.id === activeId) ?? diagrams[0],
    [activeId, diagrams]
  );

  if (!active) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-2" aria-label="Architecture diagrams">
        {diagrams.map((diagram) => (
          <button
            key={diagram.id}
            onClick={() => setActiveId(diagram.id)}
            className={cn(
              "w-full rounded-lg border p-4 text-left transition-colors",
              active.id === diagram.id
                ? "border-emerald-400/50 bg-emerald-400/10"
                : "border-card-border bg-surface hover:bg-surface-strong"
            )}
          >
            <span className="font-medium">{diagram.title}</span>
            <span className="mt-1 block text-xs leading-relaxed text-muted">
              {diagram.nodes.length} components / {diagram.edges.length} flows
            </span>
          </button>
        ))}
      </aside>

      <article className="rounded-lg border border-card-border bg-card p-4 md:p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="success">SVG Architecture</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal">
              {active.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              {active.description}
            </p>
          </div>
          <div className="flex gap-3 text-xs text-muted">
            <span>{active.nodes.length} nodes</span>
            <span>{active.edges.length} edges</span>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-card-border bg-background/70 p-3">
          <div className="min-w-[760px]">
            <DiagramRenderer diagram={active} />
          </div>
        </div>
      </article>
    </div>
  );
}
