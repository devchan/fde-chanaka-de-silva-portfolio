"use client";

import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const modes = [
  "RAG Design",
  "Agent Workflow",
  "Integration Plan",
  "Incident Triage",
] as const;

export function AiPlayground() {
  const [mode, setMode] = useState<(typeof modes)[number]>("RAG Design");
  const [prompt, setPrompt] = useState(
    "Design a governed AI assistant for a property management team that can answer policy questions from internal documents and escalate uncertain answers."
  );
  const [submitted, setSubmitted] = useState(prompt);

  const output = useMemo(() => {
    const words = submitted.split(/\s+/).filter(Boolean).length;
    return [
      `Mode: ${mode}`,
      `Input scope: ${words} words, enterprise workflow oriented.`,
      "Architecture: request intake -> policy guardrail -> retrieval or tool plan -> evidence check -> response with escalation path.",
      "Controls: tenant-scoped permissions, citation requirement, evaluation set, rate limits, and human approval for high-impact actions.",
      "Next step: convert the scenario into acceptance tests and a small golden dataset before implementation.",
    ];
  }, [mode, submitted]);

  return (
    <div className="rounded-lg border border-card-border bg-card p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-[var(--accent-2)]" />
            AI Playground
          </h2>
          <p className="mt-1 text-sm text-muted">
            A local prompt workbench for shaping solution architecture.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {modes.map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`h-8 rounded-lg border px-3 text-xs transition-colors ${
                mode === item
                  ? "border-transparent bg-foreground text-background"
                  : "border-card-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="playground-prompt">
            Scenario
          </label>
          <Textarea
            id="playground-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={9}
            className="mt-2"
          />
          <Button className="mt-3" variant="gradient" onClick={() => setSubmitted(prompt)}>
            Generate plan
          </Button>
        </div>
        <div className="rounded-lg border border-card-border bg-background/70 p-4">
          <p className="mb-3 font-mono text-xs uppercase text-muted">
            Simulated architecture output
          </p>
          <ul className="space-y-3 text-sm leading-relaxed text-muted">
            {output.map((line) => (
              <li key={line} className="border-l border-emerald-400/40 pl-3">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
