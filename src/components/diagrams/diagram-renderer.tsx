import type {
  ArchitectureDiagram,
  DiagramEdge,
  DiagramNode,
  DiagramNodeKind,
} from "@/lib/types";

/**
 * Data-driven SVG architecture diagram renderer.
 * Renders nodes (styled by kind), groups, and auto-routed labeled edges.
 * Pure server component — no client JS required.
 */

const kindStyles: Record<
  DiagramNodeKind,
  { stroke: string; fill: string; chip: string; label: string }
> = {
  client: { stroke: "#38bdf8", fill: "rgba(56,189,248,0.10)", chip: "#38bdf8", label: "CLIENT" },
  gateway: { stroke: "#818cf8", fill: "rgba(129,140,248,0.10)", chip: "#818cf8", label: "GATEWAY" },
  service: { stroke: "#a78bfa", fill: "rgba(167,139,250,0.10)", chip: "#a78bfa", label: "SERVICE" },
  worker: { stroke: "#fbbf24", fill: "rgba(251,191,36,0.10)", chip: "#fbbf24", label: "WORKER" },
  datastore: { stroke: "#34d399", fill: "rgba(52,211,153,0.10)", chip: "#34d399", label: "DATA" },
  queue: { stroke: "#fb923c", fill: "rgba(251,146,60,0.10)", chip: "#fb923c", label: "QUEUE" },
  external: { stroke: "#f472b6", fill: "rgba(244,114,182,0.10)", chip: "#f472b6", label: "EXTERNAL" },
  ai: { stroke: "#e879f9", fill: "rgba(232,121,249,0.12)", chip: "#e879f9", label: "AI" },
};

type Side = "top" | "bottom" | "left" | "right";

function anchor(node: DiagramNode, side: Side): { x: number; y: number } {
  switch (side) {
    case "top":
      return { x: node.x + node.w / 2, y: node.y };
    case "bottom":
      return { x: node.x + node.w / 2, y: node.y + node.h };
    case "left":
      return { x: node.x, y: node.y + node.h / 2 };
    case "right":
      return { x: node.x + node.w, y: node.y + node.h / 2 };
  }
}

function autoSides(from: DiagramNode, to: DiagramNode): [Side, Side] {
  const fcx = from.x + from.w / 2;
  const fcy = from.y + from.h / 2;
  const tcx = to.x + to.w / 2;
  const tcy = to.y + to.h / 2;
  const dx = tcx - fcx;
  const dy = tcy - fcy;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? ["right", "left"] : ["left", "right"];
  }
  return dy > 0 ? ["bottom", "top"] : ["top", "bottom"];
}

function edgePath(
  from: DiagramNode,
  to: DiagramNode,
  edge: DiagramEdge
): { d: string; mx: number; my: number } {
  const [autoFrom, autoTo] = autoSides(from, to);
  const fromSide = edge.fromSide ?? autoFrom;
  const toSide = edge.toSide ?? autoTo;
  const a = anchor(from, fromSide);
  const b = anchor(to, toSide);

  const horizontal = fromSide === "left" || fromSide === "right";
  const bend = Math.max(28, Math.min(70, Math.hypot(b.x - a.x, b.y - a.y) / 2.5));

  const c1 = horizontal
    ? { x: a.x + (fromSide === "right" ? bend : -bend), y: a.y }
    : { x: a.x, y: a.y + (fromSide === "bottom" ? bend : -bend) };
  const toHorizontal = toSide === "left" || toSide === "right";
  const c2 = toHorizontal
    ? { x: b.x + (toSide === "left" ? -bend : bend), y: b.y }
    : { x: b.x, y: b.y + (toSide === "top" ? -bend : bend) };

  return {
    d: `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`,
    mx: (a.x + b.x) / 2 + (c1.x + c2.x - a.x - b.x) / 4,
    my: (a.y + b.y) / 2 + (c1.y + c2.y - a.y - b.y) / 4,
  };
}

function NodeShape({ node }: { node: DiagramNode }) {
  const s = kindStyles[node.kind];

  if (node.kind === "datastore") {
    const rx = node.w / 2;
    const ry = 9;
    return (
      <g>
        <path
          d={`M ${node.x} ${node.y + ry} A ${rx} ${ry} 0 0 1 ${node.x + node.w} ${node.y + ry} V ${node.y + node.h - ry} A ${rx} ${ry} 0 0 1 ${node.x} ${node.y + node.h - ry} Z`}
          fill={s.fill}
          stroke={s.stroke}
          strokeWidth={1.2}
        />
        <ellipse
          cx={node.x + rx}
          cy={node.y + ry}
          rx={rx}
          ry={ry}
          fill={s.fill}
          stroke={s.stroke}
          strokeWidth={1.2}
        />
      </g>
    );
  }

  return (
    <rect
      x={node.x}
      y={node.y}
      width={node.w}
      height={node.h}
      rx={node.kind === "queue" ? node.h / 2 : 12}
      fill={s.fill}
      stroke={s.stroke}
      strokeWidth={1.2}
      strokeDasharray={node.kind === "external" ? "5 4" : undefined}
    />
  );
}

export function DiagramRenderer({ diagram }: { diagram: ArchitectureDiagram }) {
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox={`0 0 ${diagram.width} ${diagram.height}`}
      role="img"
      aria-label={`${diagram.title} — ${diagram.description}`}
      className="h-auto w-full"
    >
      <defs>
        <marker
          id={`arrow-${diagram.id}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>

      {/* Groups */}
      {diagram.groups?.map((g) => (
        <g key={g.label}>
          <rect
            x={g.x}
            y={g.y}
            width={g.w}
            height={g.h}
            rx={16}
            fill="var(--surface)"
            stroke="var(--card-border)"
            strokeDasharray="6 5"
          />
          <text
            x={g.x + 16}
            y={g.y + 22}
            fill="var(--muted)"
            fontSize={11}
            fontWeight={600}
            letterSpacing="0.14em"
            style={{ textTransform: "uppercase" }}
          >
            {g.label.toUpperCase()}
          </text>
        </g>
      ))}

      {/* Edges under nodes */}
      {diagram.edges.map((e, i) => {
        const from = nodeMap.get(e.from);
        const to = nodeMap.get(e.to);
        if (!from || !to) return null;
        const { d, mx, my } = edgePath(from, to, e);
        return (
          <g key={`${e.from}-${e.to}-${i}`}>
            <path
              d={d}
              fill="none"
              stroke="var(--muted)"
              strokeOpacity={0.55}
              strokeWidth={1.3}
              strokeDasharray={e.dashed ? "5 4" : undefined}
              markerEnd={`url(#arrow-${diagram.id})`}
            />
            {e.label && (
              <g>
                <rect
                  x={mx - e.label.length * 3.4 - 6}
                  y={my - 9}
                  width={e.label.length * 6.8 + 12}
                  height={18}
                  rx={9}
                  fill="var(--background)"
                  stroke="var(--card-border)"
                />
                <text
                  x={mx}
                  y={my + 3.5}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="var(--font-geist-mono)"
                  fill="var(--muted)"
                >
                  {e.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {diagram.nodes.map((n) => {
        const s = kindStyles[n.kind];
        const cy = n.y + n.h / 2;
        return (
          <g key={n.id}>
            <NodeShape node={n} />
            <text
              x={n.x + n.w / 2}
              y={n.sublabel ? cy - 1 : cy + 4}
              textAnchor="middle"
              fontSize={12.5}
              fontWeight={600}
              fill="var(--foreground)"
            >
              {n.label}
            </text>
            {n.sublabel && (
              <text
                x={n.x + n.w / 2}
                y={cy + 14}
                textAnchor="middle"
                fontSize={10}
                fontFamily="var(--font-geist-mono)"
                fill="var(--muted)"
              >
                {n.sublabel}
              </text>
            )}
            <circle cx={n.x + 12} cy={n.y + (n.kind === "datastore" ? 4 : 0)} r={0} fill="none" />
            <text
              x={n.x + n.w / 2}
              y={n.y - 6}
              textAnchor="middle"
              fontSize={8.5}
              fontWeight={700}
              letterSpacing="0.12em"
              fill={s.chip}
              opacity={0.9}
            >
              {kindStyles[n.kind].label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
