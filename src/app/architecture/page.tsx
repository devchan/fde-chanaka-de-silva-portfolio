import type { Metadata } from "next";
import { ArchitectureExplorer } from "@/components/architecture/architecture-explorer";
import { PageHero } from "@/components/shared/page-hero";
import { Section, SectionHeading } from "@/components/ui/section";
import { diagrams } from "@/data/diagrams";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "Interactive SVG architecture diagrams for microservices, AI agents, RAG, enterprise integrations, CRM, Microsoft Graph, Stripe, queues, events, and distributed systems.",
  alternates: { canonical: "/architecture" },
};

export default function ArchitecturePage() {
  return (
    <>
      <PageHero
        eyebrow="Architecture"
        title="Systems diagrams for enterprise AI and SaaS platforms."
        description="A visual library of production architecture patterns: APIs, queues, event streams, AI orchestration, retrieval pipelines, and observability paths."
      />
      <Section className="pb-28">
        <SectionHeading
          eyebrow="Explorer"
          title="Interactive architecture explorer"
          description="Select a system pattern to inspect its components, boundaries, and critical data flows."
        />
        <ArchitectureExplorer diagrams={diagrams} />
      </Section>
    </>
  );
}
