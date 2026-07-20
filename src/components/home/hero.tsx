"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Download, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { publicPath } from "@/lib/paths";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

export function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const visualX = useTransform(sx, (v) => v * 18);
  const visualY = useTransform(sy, (v) => v * 18);

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      onMouseMove={onMouseMove}
      className="bg-grid relative overflow-hidden"
      aria-label="Introduction"
    >
      <div aria-hidden className="aurora-bg absolute inset-0" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex max-w-6xl flex-col items-start px-6 pb-20 pt-16 md:pb-28 md:pt-24"
      >
        <motion.div
          variants={item}
          className="glass mb-8 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Available for Forward Deployed Engineer consulting engagements
        </motion.div>

        <motion.h1
          variants={item}
          className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-normal md:text-7xl"
        >
          Enterprise software,
          <br />
          <span className="text-gradient">deployed where it matters.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-7 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
        >
          I&apos;m {site.name} — {site.title} with 11+ years building enterprise
          SaaS platforms, AI-powered systems, and mission-critical integrations.
          From CRM pipelines to RAG architectures, I take complex systems from
          whiteboard to production.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/resume"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(100deg,var(--accent-1),var(--accent-2),var(--accent-3))] px-7 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03]"
          >
            <Download className="h-4 w-4" />
            Download Resume
          </Link>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="glass inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-medium transition-colors hover:bg-surface-strong"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="glass inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-medium transition-colors hover:bg-surface-strong"
          >
            <LinkedinIcon className="h-4 w-4" />
            LinkedIn
          </a>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <Mail className="h-4 w-4" />
            Contact
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-14 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-muted"
        >
          {site.targetRoles.map((role) => (
            <span key={role} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[var(--accent-2)]" />
              {role}
            </span>
          ))}
        </motion.div>

        <motion.div
          variants={item}
          style={{ x: visualX, y: visualY }}
          className="mt-16 w-full rounded-lg border border-card-border shadow-2xl shadow-cyan-500/10"
        >
          <Image
            src={publicPath("/images/platform-console.svg")}
            alt="Enterprise AI platform console showing workflows, system health, traces, and retrieval evidence"
            width={1200}
            height={760}
            priority
            className="h-auto w-full rounded-lg"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
