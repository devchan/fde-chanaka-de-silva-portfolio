import type { Metadata } from "next";
import { BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { Section, SectionHeading } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { experience } from "@/data/experience";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Enterprise software engineering experience across SaaS platforms, AI systems, CRM, workflow automation, integrations, and cloud infrastructure.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <>
      <PageHero
        eyebrow="Experience"
        title="Eleven years of production ownership across enterprise systems."
        description={`${site.name} has built and led software across CRM, field service, proptech, integrations, analytics, and applied AI systems for real operational teams.`}
      />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Career"
            title="Production roles and responsibilities"
            description="A practical progression from full-stack delivery to architecture, customer-facing engineering, and AI-enabled enterprise systems."
          />
        </Reveal>
        <div className="space-y-6">
          {experience.map((entry, index) => (
            <Reveal key={`${entry.company}-${entry.period}`} delay={index * 0.08}>
              <article className="rounded-lg border border-card-border bg-card p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge variant="accent">{entry.period}</Badge>
                    <h2 className="mt-4 text-2xl font-semibold tracking-normal">
                      {entry.role}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {entry.company} / {entry.location}
                    </p>
                  </div>
                  <BriefcaseBusiness className="h-6 w-6 text-[var(--accent-2)]" />
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted">
                  {entry.summary}
                </p>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {entry.highlights.map((highlight) => (
                    <div key={highlight} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {entry.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-card-border bg-surface px-2.5 py-1 font-mono text-xs text-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pb-28">
        <Reveal>
          <SectionHeading
            eyebrow="Operating Model"
            title="Forward deployed engineering style"
            description="The common thread is ownership across discovery, architecture, implementation, deployment, customer validation, and operational support."
          />
        </Reveal>
        <Stagger className="grid gap-5 md:grid-cols-3">
          {[
            "Embedded with business users to translate workflow pain into precise system requirements.",
            "Comfortable moving between architecture diagrams, code, infrastructure, and incident response.",
            "Focused on measurable outcomes: latency, automation rate, support load, revenue leakage, and reliability.",
          ].map((item) => (
            <div key={item} className="rounded-lg border border-card-border bg-card p-6 text-sm leading-relaxed text-muted">
              {item}
            </div>
          ))}
        </Stagger>
      </Section>
    </>
  );
}
