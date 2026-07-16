import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProjectCaseStudy } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function ProjectCard({ project }: { project: ProjectCaseStudy }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="glass group relative flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge variant="accent">{project.category}</Badge>
        <span className="font-mono text-xs text-muted">{project.year}</span>
      </div>

      <h3 className="mt-4 text-lg font-semibold tracking-normal transition-colors group-hover:text-gradient">
        {project.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {project.tagline}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {project.stack.slice(0, 5).map((tech) => (
          <span
            key={tech}
            className="rounded-md bg-surface px-2 py-0.5 font-mono text-[11px] text-muted"
          >
            {tech}
          </span>
        ))}
        {project.stack.length > 5 && (
          <span className="rounded-md px-2 py-0.5 font-mono text-[11px] text-muted">
            +{project.stack.length - 5}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-card-border pt-4">
        <div className="flex gap-4">
          {project.metrics.slice(0, 2).map((m) => (
            <div key={m.label}>
              <p className="text-sm font-semibold">{m.value}</p>
              <p className="text-[11px] text-muted">{m.label}</p>
            </div>
          ))}
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
      </div>
    </Link>
  );
}
