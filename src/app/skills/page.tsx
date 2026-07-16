import type { Metadata } from "next";
import { CompetencyGrid } from "@/components/skills/competency-grid";
import { PageHero } from "@/components/shared/page-hero";
import { Section, SectionHeading } from "@/components/ui/section";
import { competencies, frontendSkills, testimonials } from "@/data/skills";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Forward Deployed Engineering competencies across AI engineering, backend, APIs, distributed systems, cloud, databases, observability, infrastructure, and enterprise engineering.",
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  return (
    <>
      <PageHero
        eyebrow="Skills"
        title="Forward Deployed Engineering Competencies"
        description="A broad but production-tested skill matrix for building, deploying, debugging, and explaining enterprise AI and software platforms."
      />
      <Section>
        <SectionHeading
          eyebrow="Competencies"
          title="Enterprise AI delivery skill matrix"
          description="The categories map directly to what forward deployed engineering demands: customer discovery, systems design, implementation, deployment, and incident response."
        />
        <CompetencyGrid competencies={competencies} />
      </Section>
      <Section>
        <SectionHeading
          eyebrow="Frontend"
          title="Product-grade frontend engineering"
          description="Modern UI work across dashboards, data-heavy workflows, architecture explorers, and AI-assisted interfaces."
        />
        <div className="flex flex-wrap gap-3">
          {frontendSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-lg border border-card-border bg-card px-4 py-3 font-mono text-sm text-muted"
            >
              {skill}
            </span>
          ))}
        </div>
      </Section>
      <Section className="pb-28">
        <SectionHeading eyebrow="Signals" title="What teams value" />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.quote} className="rounded-lg border border-card-border bg-card p-6">
              <blockquote className="text-sm leading-relaxed text-muted">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="block font-medium">{testimonial.name}</span>
                <span className="text-muted">{testimonial.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
