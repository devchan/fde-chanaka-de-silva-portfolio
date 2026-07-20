import type { ContentBlock } from "@/lib/types";

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-lite">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "p":
            return <p key={index}>{block.text}</p>;
          case "h2":
            return <h2 key={index}>{block.text}</h2>;
          case "h3":
            return <h3 key={index}>{block.text}</h3>;
          case "ul":
            return (
              <ul key={index}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "code":
            return (
              <figure key={index} className="not-prose">
                <figcaption className="mb-2 font-mono text-xs uppercase text-muted">
                  {block.lang}
                </figcaption>
                <pre className="rounded-lg border border-card-border bg-[#080b0f] p-4 text-sm text-slate-100">
                  <code>{block.code}</code>
                </pre>
              </figure>
            );
          case "quote":
            return (
              <blockquote key={index}>
                <p>{block.text}</p>
              </blockquote>
            );
          case "roadmap": {
            // Full literal class names per accent so Tailwind detects them statically.
            const nodeAccents = [
              "border-accent-1 text-accent-1",
              "border-accent-2 text-accent-2",
              "border-accent-3 text-accent-3",
            ];
            const barAccents = [
              "border-l-accent-1",
              "border-l-accent-2",
              "border-l-accent-3",
            ];
            return (
              <figure key={index} className="not-prose my-10">
                {block.title && (
                  <figcaption className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
                    {block.title}
                  </figcaption>
                )}
                {/* div/span, not ul/li: the site's .prose-lite list styles would
                    otherwise force disc markers and padding onto the chips. */}
                <div className="relative space-y-4">
                  <span
                    aria-hidden
                    className="absolute left-5 top-3 bottom-3 w-px bg-gradient-to-b from-accent-1 via-accent-2 to-accent-3 opacity-60"
                  />
                  {block.phases.map((phase, i) => {
                    const idx = i % nodeAccents.length;
                    return (
                      <div key={phase.step} className="relative flex gap-4">
                        <span
                          className={`relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full border bg-surface-strong font-mono text-sm font-semibold ${nodeAccents[idx]}`}
                        >
                          {phase.step}
                        </span>
                        <div
                          className={`flex-1 rounded-xl border border-card-border border-l-2 bg-card p-4 backdrop-blur ${barAccents[idx]}`}
                        >
                          <h4 className="text-base font-semibold text-foreground">
                            {phase.title}
                          </h4>
                          <p className="mt-1 text-sm text-muted">{phase.focus}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {phase.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-md border border-card-border bg-surface px-2 py-1 font-mono text-xs text-muted"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </figure>
            );
          }
        }
      })}
    </div>
  );
}
