import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { experiments, getExperiment } from "@/data/experiments";
import { site } from "@/data/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return experiments.map((experiment) => ({ slug: experiment.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) return {};

  return {
    title: experiment.title,
    description: experiment.summary,
    alternates: { canonical: `/ai-lab/${experiment.slug}` },
    openGraph: {
      title: `${experiment.title} | ${site.name}`,
      description: experiment.summary,
      type: "article",
    },
  };
}

export default async function ExperimentPage({ params }: Props) {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) notFound();

  return (
    <>
      <PageHero
        eyebrow={`${experiment.category} / ${experiment.status}`}
        title={experiment.title}
        description={experiment.summary}
      >
        <div className="flex flex-wrap gap-2">
          {experiment.stack.map((item) => (
            <span key={item} className="rounded-md border border-card-border bg-surface px-2.5 py-1 font-mono text-xs text-muted">
              {item}
            </span>
          ))}
        </div>
      </PageHero>

      <Section className="pb-28">
        <article className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-semibold tracking-normal">Overview</h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
                {experiment.overview.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-semibold tracking-normal">Architecture</h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted">
                {experiment.architecture.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold tracking-normal">Code Snippets</h2>
              <div className="mt-5 space-y-5">
                {experiment.code.map((snippet) => (
                  <figure key={snippet.title} className="rounded-lg border border-card-border bg-card p-4">
                    <figcaption className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-medium">{snippet.title}</span>
                      <Badge>{snippet.lang}</Badge>
                    </figcaption>
                    <pre className="rounded-lg bg-[#080b0f] p-4 text-sm text-slate-100">
                      <code>{snippet.snippet}</code>
                    </pre>
                  </figure>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-semibold tracking-normal">Lessons Learned</h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted">
                {experiment.lessons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
          <aside className="h-fit rounded-lg border border-card-border bg-card p-5 lg:sticky lg:top-28">
            <Badge variant={experiment.status === "production" ? "success" : "accent"}>
              {experiment.status}
            </Badge>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Enterprise AI work has to be evaluated, observable, scoped, and recoverable. This experiment documents the engineering surface around that constraint.
            </p>
            <Link href="/ai-lab" className="mt-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              AI Lab
            </Link>
          </aside>
        </article>
      </Section>
    </>
  );
}
