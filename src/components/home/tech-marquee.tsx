import { technologies } from "@/data/site";

export function TechMarquee() {
  const list = [...technologies, ...technologies];
  return (
    <div
      className="marquee-mask relative mx-auto max-w-6xl overflow-hidden py-14"
      aria-label="Technologies I work with"
    >
      <div className="animate-marquee flex w-max gap-3">
        {list.map((tech, i) => (
          <span
            key={`${tech}-${i}`}
            aria-hidden={i >= technologies.length}
            className="glass rounded-full px-5 py-2 font-mono text-sm text-muted transition-colors hover:text-foreground"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
