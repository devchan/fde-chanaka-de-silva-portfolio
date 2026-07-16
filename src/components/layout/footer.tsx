import Link from "next/link";
import { Mail, Rss } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { navLinks, site } from "@/data/site";
import { publicPath } from "@/lib/paths";

export function Footer() {
  return (
    <footer className="border-t border-card-border">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[linear-gradient(135deg,var(--accent-1),var(--accent-3))] font-mono text-[10px] font-bold text-white">
              CD
            </span>
            {site.name}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            {site.tagline}
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-surface text-muted transition-colors hover:text-foreground"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-surface text-muted transition-colors hover:text-foreground"
            >
              <LinkedinIcon className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label="Email"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-surface text-muted transition-colors hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href={publicPath("/rss.xml")}
              aria-label="RSS feed"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-surface text-muted transition-colors hover:text-foreground"
            >
              <Rss className="h-4 w-4" />
            </a>
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-1 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-2 py-1.5 text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="text-sm text-muted">
          <p className="font-medium text-foreground">Open to opportunities</p>
          <p className="mt-2 leading-relaxed">
            Forward Deployed Engineer · Staff Engineer · AI Solutions Engineer ·
            Solutions Architect
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-3 inline-block text-gradient font-medium"
          >
            {site.email}
          </a>
        </div>
      </div>
      <div className="border-t border-card-border py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.name}. Built with Next.js, TypeScript,
        Tailwind CSS &amp; Framer Motion.
      </div>
    </footer>
  );
}
