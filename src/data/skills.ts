import type { CompetencyCategory, Testimonial } from "@/lib/types";

/** Forward Deployed Engineering competency matrix. */
export const competencies: CompetencyCategory[] = [
  {
    title: "AI Engineering",
    icon: "brain",
    items: [
      "LLMs",
      "Prompt Engineering",
      "RAG",
      "AI Agents",
      "LangGraph",
      "OpenAI Agents SDK",
      "MCP",
      "A2A",
      "Tool Calling",
    ],
  },
  {
    title: "Backend Engineering",
    icon: "server",
    items: ["Python", "Go", "Rust", "PHP", "Laravel", "Node.js"],
  },
  {
    title: "API Engineering",
    icon: "plug",
    items: ["REST", "GraphQL", "gRPC", "Webhooks", "API Versioning"],
  },
  {
    title: "Distributed Systems",
    icon: "network",
    items: [
      "Event-driven Architecture",
      "Microservices",
      "High Availability",
      "Scalability",
      "Message Queues",
      "Idempotency",
    ],
  },
  {
    title: "Cloud",
    icon: "cloud",
    items: ["AWS", "Azure", "GCP"],
  },
  {
    title: "Containers & IaC",
    icon: "boxes",
    items: ["Docker", "Kubernetes", "Terraform", "GitHub Actions", "CI/CD"],
  },
  {
    title: "Databases",
    icon: "database",
    items: ["PostgreSQL", "MySQL", "Redis", "pgvector", "Milvus", "Qdrant"],
  },
  {
    title: "Observability",
    icon: "activity",
    items: ["OpenTelemetry", "Prometheus", "Grafana", "Structured Logging", "SLOs"],
  },
  {
    title: "Infrastructure",
    icon: "terminal",
    items: [
      "Linux",
      "Networking",
      "Nginx",
      "Debugging",
      "Production Incident Response",
    ],
  },
  {
    title: "Enterprise Engineering",
    icon: "building",
    items: [
      "OAuth2",
      "Authentication",
      "Solution Architecture",
      "Customer Discovery",
      "Technical Documentation",
      "Performance Optimization",
      "Cost Optimization",
    ],
  },
];

export const frontendSkills = [
  "Vue.js",
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
] as const;

export const testimonials: Testimonial[] = [
  {
    quote:
      "Chanaka is the engineer you put in front of a customer. He translates vague business pain into working systems faster than anyone I have worked with, and the systems keep working.",
    name: "Engineering Director",
    role: "Enterprise PropTech Platform",
  },
  {
    quote:
      "The Microsoft Graph integration he architected went from design doc to production in six weeks and has processed millions of emails since with barely an incident.",
    name: "Product Lead",
    role: "Field Service Management Platform",
  },
  {
    quote:
      "He brought AI into our product the right way — evals first, guardrails everywhere, and honest about what the models can and cannot do.",
    name: "CTO",
    role: "Enterprise SaaS Company",
  },
];

export const values = [
  {
    title: "Customer-first engineering",
    description:
      "The best architecture is the one that solves the customer's actual problem. I start from the workflow, not the tech stack, and validate with users early.",
  },
  {
    title: "Production is the product",
    description:
      "A demo is a promise; production is a contract. I design for observability, failure modes, and the 3 a.m. incident from day one.",
  },
  {
    title: "Simple scales, clever fails",
    description:
      "I reach for boring, proven technology first and add complexity only when the numbers demand it. Every abstraction has to pay rent.",
  },
  {
    title: "Own it end to end",
    description:
      "Discovery, design, implementation, deployment, and the follow-through afterwards. Forward deployed means being accountable for outcomes, not tickets.",
  },
] as const;
