import type { Metadata } from "next";
import { ProjectFilter } from "@/components/projects/project-filter";
import { PageHero } from "@/components/shared/page-hero";
import { Section } from "@/components/ui/section";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Enterprise case studies covering SaaS platforms, compliance engines, Microsoft Graph, AI document processing, CRM analytics, workflow automation, and integration hubs.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Case studies for enterprise AI and mission-critical systems."
        description="Each case study is framed around the business problem, architecture, system design, implementation decisions, measured results, and what should improve next."
      />
      <Section className="pb-28">
        <ProjectFilter projects={projects} />
      </Section>
    </>
  );
}
