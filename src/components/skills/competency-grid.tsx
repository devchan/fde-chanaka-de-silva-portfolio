import {
  Activity,
  Boxes,
  Brain,
  Building2,
  Cloud,
  Database,
  Network,
  Plug,
  Server,
  Terminal,
} from "lucide-react";
import type { CompetencyCategory } from "@/lib/types";

const icons = {
  activity: Activity,
  boxes: Boxes,
  brain: Brain,
  building: Building2,
  cloud: Cloud,
  database: Database,
  network: Network,
  plug: Plug,
  server: Server,
  terminal: Terminal,
};

export function CompetencyGrid({
  competencies,
}: {
  competencies: CompetencyCategory[];
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {competencies.map((category) => {
        const Icon = icons[category.icon as keyof typeof icons] ?? Brain;
        return (
          <section
            key={category.title}
            className="rounded-lg border border-card-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-[var(--accent-2)]">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-semibold tracking-normal">
                {category.title}
              </h2>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {category.items.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-card-border bg-surface px-2.5 py-1 text-xs text-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
