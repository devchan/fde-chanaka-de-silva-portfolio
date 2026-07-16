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
        }
      })}
    </div>
  );
}
