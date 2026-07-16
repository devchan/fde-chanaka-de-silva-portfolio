import type { Metadata } from "next";
import { Download, Mail } from "lucide-react";
import { LinkButton } from "@/components/shared/link-button";
import { PageHero } from "@/components/shared/page-hero";
import { Section, SectionHeading } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { competencies } from "@/data/skills";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume preview for Chanaka De Silva, Senior Software Engineer focused on enterprise AI, forward deployed engineering, and SaaS architecture.",
  alternates: { canonical: "/resume" },
};

export default function ResumePage() {
  return (
    <>
      <PageHero
        eyebrow="Resume"
        title="Senior Software Engineer for enterprise AI and deployed systems."
        description="A recruiter-friendly view of experience, projects, technical scope, and target roles. The download button points to the PDF resume path in the public site."
      >
        <div className="flex flex-wrap gap-3">
          <LinkButton href={site.resumeUrl} size="lg">
            <Download className="h-4 w-4" />
            Download Resume
          </LinkButton>
          <LinkButton href="/contact" variant="outline" size="lg">
            <Mail className="h-4 w-4" />
            Contact
          </LinkButton>
        </div>
      </PageHero>

      <Section>
        <div className="rounded-lg border border-card-border bg-card p-6 md:p-8">
          <div className="flex flex-col gap-5 border-b border-card-border pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-normal">{site.name}</h2>
              <p className="mt-2 text-muted">{site.title} / 11+ Years Experience</p>
            </div>
            <div className="text-sm text-muted md:text-right">
              <p>{site.email}</p>
              <p>{site.github}</p>
              <p>{site.linkedin}</p>
            </div>
          </div>
          <p className="mt-6 max-w-4xl text-sm leading-relaxed text-muted">
            {site.description} Experienced in designing software that connects business workflows from lead generation to service delivery, including integrations with Microsoft Graph, Stripe, SendGrid, Google APIs, AI services, and enterprise cloud platforms.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {site.targetRoles.map((role) => (
              <Badge key={role} variant="accent">
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="Experience" title="Professional history" />
        <div className="space-y-5">
          {experience.map((entry) => (
            <article key={entry.company} className="rounded-lg border border-card-border bg-card p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{entry.role}</h3>
                  <p className="text-sm text-muted">{entry.company} / {entry.location}</p>
                </div>
                <Badge>{entry.period}</Badge>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
                {entry.highlights.slice(0, 4).map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading eyebrow="Selected Work" title="Relevant case studies" />
        <div className="grid gap-5 md:grid-cols-2">
          {projects.slice(0, 6).map((project) => (
            <div key={project.slug} className="rounded-lg border border-card-border bg-card p-5">
              <h3 className="font-semibold">{project.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{project.tagline}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="pb-28 pt-0">
        <SectionHeading eyebrow="Technical Scope" title="Core competencies" />
        <div className="grid gap-4 md:grid-cols-2">
          {competencies.map((category) => (
            <div key={category.title} className="rounded-lg border border-card-border bg-card p-5">
              <h3 className="font-semibold">{category.title}</h3>
              <p className="mt-2 text-sm text-muted">{category.items.join(" / ")}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
