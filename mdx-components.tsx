import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  h1: (props) => <h1 className="text-4xl font-bold tracking-normal" {...props} />,
  h2: (props) => <h2 className="mt-10 text-2xl font-semibold" {...props} />,
  p: (props) => <p className="mt-4 leading-relaxed text-muted" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-5 text-muted" {...props} />,
  code: (props) => (
    <code
      className="rounded-md border border-card-border bg-surface px-1.5 py-0.5 font-mono text-sm"
      {...props}
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
