import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { TechMarquee } from "@/components/home/tech-marquee";
import { GithubGraph } from "@/components/home/github-graph";
import { ProjectCard } from "@/components/projects/project-card";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { projects } from "@/data/projects";
import { blogPosts } from "@/data/blog";
import { formatDate } from "@/lib/utils";

export default function HomePage() {
  const featured = projects.filter((p) => p.featured).slice(0, 6);
  const latestPosts = [...blogPosts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <>
      <Hero />
      <Stats />
      <TechMarquee />

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Selected Work"
            title="Enterprise systems in production"
            description="Case studies from 11 years of building CRM platforms, AI pipelines, integration hubs, and distributed systems for real businesses."
          />
        </Reveal>
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </Stagger>
        <Reveal className="mt-10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-gradient"
          >
            View all case studies <ArrowRight className="h-4 w-4 text-[var(--accent-2)]" />
          </Link>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Open Source & Activity"
            title="Always shipping"
          />
        </Reveal>
        <GithubGraph />
      </Section>

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Writing"
            title="Latest from the blog"
            description="Notes on AI systems, distributed architecture, and engineering craft."
          />
        </Reveal>
        <Stagger className="grid gap-5 md:grid-cols-3">
          {latestPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass group flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30"
            >
              <p className="font-mono text-xs text-muted">
                {formatDate(post.date)} · {post.readingTime}
              </p>
              <h3 className="mt-3 flex-1 text-base font-semibold leading-snug tracking-normal group-hover:text-gradient">
                {post.title}
              </h3>
              <p className="mt-3 line-clamp-2 text-sm text-muted">
                {post.description}
              </p>
              <p className="mt-4 text-xs font-medium text-[var(--accent-2)]">
                {post.category}
              </p>
            </Link>
          ))}
        </Stagger>
      </Section>

      <Section className="pb-28">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-lg px-8 py-14 text-center md:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_50%_120%,rgba(129,140,248,0.25),transparent)]"
            />
            <h2 className="relative text-3xl font-bold tracking-normal md:text-4xl">
              Let&apos;s build something that ships.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-muted">
              I partner with teams to take AI platforms and enterprise systems
              from ambiguous requirements to production. Currently open to
              Forward Deployed and Staff Engineering roles.
            </p>
            <div className="relative mt-8 flex justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(100deg,var(--accent-1),var(--accent-2),var(--accent-3))] px-7 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03]"
              >
                Get in touch <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/projects"
                className="glass inline-flex h-12 items-center rounded-full px-6 text-sm font-medium transition-colors hover:bg-surface-strong"
              >
                Explore my work
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
