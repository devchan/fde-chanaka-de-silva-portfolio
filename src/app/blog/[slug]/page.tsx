import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ContentRenderer } from "@/components/shared/content-renderer";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { blogPosts, getPost } from "@/data/blog";
import { site } from "@/data/site";
import { formatDate } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: `${post.title} | ${site.name}`,
      description: post.description,
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <PageHero
        eyebrow={`${post.category} / ${formatDate(post.date)}`}
        title={post.title}
        description={post.description}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{post.readingTime}</Badge>
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-md border border-card-border bg-surface px-2.5 py-1 font-mono text-xs text-muted">
              {tag}
            </span>
          ))}
        </div>
      </PageHero>
      <Section className="pb-28">
        <article className="mx-auto max-w-3xl">
          <ContentRenderer blocks={post.content} />
          <Link href="/blog" className="mt-12 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            All articles
          </Link>
        </article>
      </Section>
    </>
  );
}
