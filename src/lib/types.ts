/** Shared domain types for the portfolio. All content data files conform to these. */

// ---------------------------------------------------------------------------
// Projects / Case Studies
// ---------------------------------------------------------------------------

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectChallenge {
  title: string;
  description: string;
}

export interface ProjectSections {
  /** Paragraphs describing the business problem. */
  businessProblem: string[];
  /** Paragraphs describing the high-level architecture. */
  architecture: string[];
  /** Bullet points describing key system design decisions. */
  systemDesign: string[];
  /** Bullet points — my responsibilities. */
  responsibilities: string[];
  /** Key challenges with short explanations. */
  challenges: ProjectChallenge[];
  /** Paragraphs describing implementation details. */
  implementation: string[];
  /** Bullet points — measurable results. */
  results: string[];
  /** Bullet points — lessons learned. */
  lessonsLearned: string[];
  /** Bullet points — future improvements. */
  futureImprovements: string[];
}

export interface ProjectCaseStudy {
  slug: string;
  title: string;
  tagline: string;
  category:
    | "Enterprise SaaS"
    | "AI & ML"
    | "Integrations"
    | "Platform Engineering"
    | "Data & Analytics";
  featured: boolean;
  year: string;
  role: string;
  stack: string[];
  metrics: ProjectMetric[];
  sections: ProjectSections;
  /** Optional id of a diagram on the Architecture page. */
  diagramId?: string;
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export type BlogCategory =
  | "Artificial Intelligence"
  | "Laravel"
  | "System Design"
  | "Distributed Systems"
  | "Cloud"
  | "Architecture"
  | "Engineering"
  | "Developer Productivity";

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "quote"; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date, e.g. "2026-05-12" */
  date: string;
  readingTime: string;
  category: BlogCategory;
  tags: string[];
  content: ContentBlock[];
}

// ---------------------------------------------------------------------------
// AI Lab Experiments
// ---------------------------------------------------------------------------

export interface CodeSnippet {
  title: string;
  lang: string;
  snippet: string;
}

export interface Experiment {
  slug: string;
  title: string;
  summary: string;
  category:
    | "AI Agents"
    | "RAG"
    | "Prompt Engineering"
    | "LLM Systems"
    | "Semantic Search"
    | "MCP"
    | "Orchestration";
  status: "production" | "prototype" | "research";
  stack: string[];
  /** Paragraphs. */
  overview: string[];
  /** Bullet points describing the architecture. */
  architecture: string[];
  code: CodeSnippet[];
  /** Bullet points. */
  lessons: string[];
}

// ---------------------------------------------------------------------------
// Architecture diagrams (data-driven SVG)
// ---------------------------------------------------------------------------

export type DiagramNodeKind =
  | "client"
  | "gateway"
  | "service"
  | "worker"
  | "datastore"
  | "queue"
  | "external"
  | "ai";

export interface DiagramNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sublabel?: string;
  kind: DiagramNodeKind;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  /** Force which side of each node the edge attaches to when auto-routing looks wrong. */
  fromSide?: "top" | "bottom" | "left" | "right";
  toSide?: "top" | "bottom" | "left" | "right";
}

export interface DiagramGroup {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ArchitectureDiagram {
  id: string;
  title: string;
  description: string;
  width: number;
  height: number;
  groups?: DiagramGroup[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  stack: string[];
}

// ---------------------------------------------------------------------------
// Skills / Competencies
// ---------------------------------------------------------------------------

export interface CompetencyCategory {
  title: string;
  icon: string; // lucide icon name mapped in the UI
  items: string[];
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}
