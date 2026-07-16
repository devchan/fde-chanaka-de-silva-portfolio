"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { Input } from "@/components/ui/input";
import type { ProjectCaseStudy } from "@/lib/types";
import { cn } from "@/lib/utils";

const categories = [
  "All",
  "Enterprise SaaS",
  "AI & ML",
  "Integrations",
  "Platform Engineering",
  "Data & Analytics",
] as const;

export function ProjectFilter({ projects }: { projects: ProjectCaseStudy[] }) {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesCategory =
        category === "All" || project.category === category;
      const matchesQuery =
        q.length === 0 ||
        [
          project.title,
          project.tagline,
          project.category,
          project.role,
          ...project.stack,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, projects, query]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project categories">
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
        <label className="relative block lg:w-80">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search case studies"
            className="pl-9"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
