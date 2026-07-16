import type { ProjectMetric } from "@/lib/types";

export function MetricGrid({ metrics }: { metrics: ProjectMetric[] }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border border-card-border bg-card-border sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-background/90 p-5">
          <dt className="text-xs uppercase text-muted">{metric.label}</dt>
          <dd className="mt-2 text-2xl font-semibold tracking-normal text-gradient">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
