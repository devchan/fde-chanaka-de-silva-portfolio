import type { Metadata } from "next";
import { AiPlayground } from "@/components/ai-lab/ai-playground";
import { ExperimentBrowser } from "@/components/ai-lab/experiment-browser";
import { PageHero } from "@/components/shared/page-hero";
import { Section, SectionHeading } from "@/components/ui/section";
import { experiments } from "@/data/experiments";

export const metadata: Metadata = {
  title: "AI Lab",
  description:
    "AI experiments covering agents, RAG, prompt evaluation, MCP, LangGraph, OpenAI Agents SDK, semantic search, and vector databases.",
  alternates: { canonical: "/ai-lab" },
};

export default function AiLabPage() {
  return (
    <>
      <PageHero
        eyebrow="AI Lab"
        title="Applied AI systems with guardrails, evals, and enterprise constraints."
        description="Experiments and production patterns across LLM applications, multi-agent workflows, RAG, MCP tooling, semantic search, and vector infrastructure."
      />
      <Section>
        <AiPlayground />
      </Section>
      <Section className="pb-28 pt-0">
        <SectionHeading
          eyebrow="Experiments"
          title="AI engineering portfolio"
          description="Each experiment documents the overview, architecture, implementation snippets, and lessons learned."
        />
        <ExperimentBrowser experiments={experiments} />
      </Section>
    </>
  );
}
