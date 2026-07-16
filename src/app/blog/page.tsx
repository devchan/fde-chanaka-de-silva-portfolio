import type { Metadata } from "next";
import { BlogFilter } from "@/components/blog/blog-filter";
import { PageHero } from "@/components/shared/page-hero";
import { Section } from "@/components/ui/section";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technical writing on artificial intelligence, Laravel, system design, distributed systems, cloud, architecture, engineering, and developer productivity.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Engineering notes from enterprise software and applied AI."
        description="Practical writing on production RAG, queue design, idempotency, event-driven consistency, Kubernetes cost, integrations, observability, and developer productivity."
      />
      <Section className="pb-28">
        <BlogFilter posts={posts} />
      </Section>
    </>
  );
}
