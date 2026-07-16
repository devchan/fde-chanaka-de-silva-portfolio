import type { Metadata } from "next";
import { Brain, Compass, HeartHandshake, Users } from "lucide-react";
import { Reveal, Stagger } from "@/components/motion/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { milestones } from "@/data/experience";
import { values } from "@/data/skills";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: `The professional story, mission, values, and engineering philosophy of ${site.name} — enterprise and AI software engineer.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Section className="pb-8">
        <Reveal>
          <SectionHeading
            eyebrow="About"
            title="Engineer, architect, translator."
            description="I sit at the intersection of enterprise software and applied AI — turning ambiguous business problems into systems that survive production."
          />
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="space-y-5 text-[15px] leading-relaxed text-muted">
              <p>
                I started writing production software in 2014, and I have spent
                the eleven years since inside the machinery of real businesses:
                CRM pipelines, field service dispatch, compliance workflows,
                billing systems, and the integrations that hold them together.
                That work taught me the skill I value most — listening to how a
                business actually operates, then designing software that fits
                it rather than fighting it.
              </p>
              <p>
                In enterprise SaaS product teams I have led engineering behind
                property technology ecosystems: multi-tenant SaaS platforms,
                Microsoft Graph and Stripe integrations, event-driven backends,
                and — since 2023 — AI systems in production. I have shipped RAG
                pipelines that process tens of thousands of documents a month,
                AI assistants grounded in enterprise data, and agent workflows
                with humans in the loop where it matters.
              </p>
              <p>
                My mission is simple: close the gap between what AI and modern
                infrastructure make possible and what enterprises actually
                deploy. That gap is where forward deployed engineers live, and
                it is exactly where I do my best work — embedded with users,
                accountable for outcomes, fluent in both the boardroom problem
                and the pod that is crash-looping.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>At a glance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted">
                <p><span className="font-medium text-foreground">11+ years</span> in enterprise software</p>
                <p><span className="font-medium text-foreground">3 years</span> shipping AI systems to production</p>
                <p><span className="font-medium text-foreground">25+ integrations</span> — Microsoft Graph, Stripe, SendGrid, Google APIs</p>
                <p><span className="font-medium text-foreground">6 engineers</span> mentored and led</p>
                <p><span className="font-medium text-foreground">Full lifecycle</span> — discovery to incident response</p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading eyebrow="Timeline" title="The journey so far" />
        </Reveal>
        <div className="relative ml-3 border-l border-card-border pl-8">
          {milestones.map((m, i) => (
            <Reveal key={m.year} delay={i * 0.06}>
              <div className="relative pb-10 last:pb-0">
                <span className="absolute -left-[41px] top-1 flex h-6 w-6 items-center justify-center rounded-full border border-card-border bg-background">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent-2)]" />
                </span>
                <p className="font-mono text-xs text-[var(--accent-2)]">{m.year}</p>
                <h3 className="mt-1 text-base font-semibold">{m.title}</h3>
                <p className="mt-1 max-w-xl text-sm text-muted">{m.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <Reveal>
          <SectionHeading
            eyebrow="Values"
            title="How I work"
            description="Four principles that show up in every system I build and every team I work with."
          />
        </Reveal>
        <Stagger className="grid gap-5 md:grid-cols-2">
          {values.map((v, i) => {
            const icons = [HeartHandshake, Compass, Brain, Users];
            const Icon = icons[i % icons.length];
            return (
              <Card key={v.title} hover className="p-6">
                <Icon className="h-6 w-6 text-[var(--accent-2)]" />
                <h3 className="mt-4 text-base font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {v.description}
                </p>
              </Card>
            );
          })}
        </Stagger>
      </Section>

      <Section className="pb-28">
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal>
            <Card className="h-full p-7">
              <h3 className="text-lg font-semibold">Engineering philosophy</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                <li>• Start from the user&apos;s workflow; the architecture follows.</li>
                <li>• Boring technology, deliberately applied, beats novel technology accidentally applied.</li>
                <li>• Every system needs three answers ready: how it fails, how you know, and how you recover.</li>
                <li>• Evals and tests are not overhead — they are how you move fast for years instead of weeks.</li>
                <li>• Documentation is part of the deliverable. If only I can run it, it is not done.</li>
              </ul>
            </Card>
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="h-full p-7">
              <h3 className="text-lg font-semibold">Leadership &amp; AI journey</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                I lead by shipping alongside the team: design reviews that teach,
                code reviews that raise the bar, and incident retros without
                blame. Since 2023 I have driven our AI adoption — starting with
                narrow, measurable wins (document extraction, semantic search),
                building the eval infrastructure to trust them, then expanding
                into RAG assistants and multi-agent workflows. I believe the
                next decade belongs to engineers who can deploy AI into messy
                enterprise reality, and I have organised my career around being
                one of them.
              </p>
            </Card>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
