import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { Section } from "@/components/ui/section";

export default function NotFound() {
  return (
    <>
      <PageHero
        eyebrow="404"
        title="This page is not deployed."
        description="The portfolio route you requested does not exist. Return to the main system map and continue exploring the work."
      />
      <Section className="pb-28">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </Section>
    </>
  );
}
