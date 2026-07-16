import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { PageHero } from "@/components/shared/page-hero";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { Section } from "@/components/ui/section";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Chanaka De Silva for Forward Deployed Engineer, Staff Software Engineer, AI Solutions Engineer, Solutions Architect, and technical consulting opportunities.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let’s talk about enterprise AI, platforms, and customer-facing engineering."
        description="Open to Forward Deployed Engineer, Staff Software Engineer, AI Solutions Engineer, Solutions Architect, and technical consulting opportunities."
      />
      <Section className="pb-28">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
              { icon: LinkedinIcon, label: "LinkedIn", value: "linkedin.com/in/chanakadesilva", href: site.linkedin },
              { icon: GithubIcon, label: "GitHub", value: "github.com/chanakadesilva", href: site.github },
              { icon: MapPin, label: "Location", value: "Colombo, Sri Lanka / Remote", href: null },
            ].map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="rounded-lg border border-card-border bg-card p-5">
                  <Icon className="h-5 w-5 text-[var(--accent-2)]" />
                  <p className="mt-3 text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-sm text-muted">{item.value}</p>
                </div>
              );
              return item.href ? (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="block transition-transform hover:-translate-y-1">
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </aside>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
