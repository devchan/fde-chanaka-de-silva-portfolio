import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { DiagramRenderer } from "@/components/diagrams/diagram-renderer";
import { MetricGrid } from "@/components/shared/metric-grid";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { getDiagram } from "@/data/diagrams";
import { getProject, projects } from "@/data/projects";
import { site } from "@/data/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.tagline,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} | ${site.name}`,
      description: project.tagline,
      type: "article",
      url: `/projects/${project.slug}`,
    },
  };
}

const sectionLabels = [
  ["businessProblem", "Business Problem"],
  ["architecture", "Architecture"],
  ["systemDesign", "System Design"],
  ["responsibilities", "My Responsibilities"],
  ["implementation", "Implementation"],
  ["results", "Results"],
  ["lessonsLearned", "Lessons Learned"],
  ["futureImprovements", "Future Improvements"],
] as const;

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const diagram = project.diagramId ? getDiagram(project.diagramId) : undefined;

  return (
    <>
      <PageHero
        eyebrow={`${project.category} / ${project.year}`}
        title={project.title}
        description={project.tagline}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">{project.role}</Badge>
          {project.stack.slice(0, 8).map((item) => (
            <span key={item} className="rounded-md border border-card-border bg-surface px-2.5 py-1 font-mono text-xs text-muted">
              {item}
            </span>
          ))}
        </div>
      </PageHero>

      <Section>
        <MetricGrid metrics={project.metrics} />
      </Section>

      {diagram && (
        <Section className="pt-0">
          <div className="rounded-lg border border-card-border bg-card p-4 md:p-6">
            <div className="mb-5">
              <Badge variant="accent">Architecture</Badge>
              <h2 className="mt-3 text-2xl font-semibold tracking-normal">
                {diagram.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {diagram.description}
              </p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-card-border bg-background/70 p-3">
              <div className="min-w-[760px]">
                <DiagramRenderer diagram={diagram} />
              </div>
            </div>
          </div>
        </Section>
      )}

      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          <article className="space-y-10">
            {sectionLabels.map(([key, label]) => (
              <section key={key} id={key}>
                <h2 className="text-2xl font-semibold tracking-normal">{label}</h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
                  {project.sections[key].map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </section>
            ))}

            <section>
              <h2 className="text-2xl font-semibold tracking-normal">Challenges</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {project.sections.challenges.map((challenge) => (
                  <div key={challenge.title} className="rounded-lg border border-card-border bg-card p-5">
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {challenge.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </article>

          <aside className="h-fit rounded-lg border border-card-border bg-card p-5 lg:sticky lg:top-28">
            <p className="text-sm font-semibold">Case study sections</p>
            <nav className="mt-4 grid gap-2 text-sm text-muted">
              {sectionLabels.map(([key, label]) => (
                <a key={key} href={`#${key}`} className="hover:text-foreground">
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-6 border-t border-card-border pt-5">
              {project.sections.results.slice(0, 3).map((item) => (
                <p key={item} className="mb-3 flex gap-2 text-xs leading-relaxed text-muted">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  {item}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </Section>

      <Section className="flex items-center justify-between gap-4 pb-28 pt-0">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          All projects
        </Link>
        <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-medium text-gradient">
          Discuss this work
          <ArrowRight className="h-4 w-4 text-[var(--accent-2)]" />
        </Link>
      </Section>
    </>
  );
}
