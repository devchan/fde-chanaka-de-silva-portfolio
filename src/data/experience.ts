import type { ExperienceEntry } from "@/lib/types";

export const experience: ExperienceEntry[] = [
  {
    company: "Enterprise PropTech SaaS Company",
    role: "Senior Software Engineer",
    period: "2019 — Present",
    location: "Remote",
    summary:
      "Senior engineer on an enterprise property technology and field service management ecosystem serving property managers, facility teams, and service suppliers.",
    highlights: [
      "Led architecture and delivery of a multi-tenant field service management platform handling thousands of daily work orders across web and mobile clients.",
      "Designed the Microsoft Graph email integration that replaced 15-minute IMAP polling with webhook-driven sync, cutting email-to-CRM latency to under 5 seconds.",
      "Built an AI document processing pipeline (OCR, LLM extraction, RAG retrieval) that automated compliance document handling for 40k+ documents per month.",
      "Introduced event-driven architecture with an outbox pattern across core services, eliminating a class of cross-service consistency bugs.",
      "Owned Stripe billing integration end to end: metered subscriptions, webhooks with idempotency guarantees, dunning, and revenue reporting.",
      "Mentored a team of 6 engineers; established code review standards, CI/CD pipelines, and observability practices (OpenTelemetry, Prometheus, Grafana).",
    ],
    stack: [
      "Laravel",
      "PHP",
      "Python",
      "Vue.js",
      "MySQL",
      "Redis",
      "AWS",
      "Kubernetes",
      "OpenAI",
      "Microsoft Graph",
      "Stripe",
    ],
  },
  {
    company: "Enterprise SaaS Consultancy",
    role: "Software Engineer → Lead Engineer",
    period: "2016 — 2019",
    location: "Colombo, Sri Lanka",
    summary:
      "Delivered CRM, workflow automation, and analytics products for enterprise clients across real estate, logistics, and professional services.",
    highlights: [
      "Built an enterprise CRM platform (leads, pipelines, activities, reporting) adopted by 200+ sales users, integrating SendGrid, Google APIs, and telephony.",
      "Designed a workflow automation engine with a visual builder, conditional branching, and queue-backed execution processing 1M+ actions per month.",
      "Developed a lead analytics dashboard aggregating multi-channel attribution data with sub-second query performance via pre-aggregation and Redis caching.",
      "Drove the migration of legacy monoliths to service-oriented architectures on AWS with Docker and CI/CD.",
    ],
    stack: [
      "PHP",
      "Laravel",
      "Node.js",
      "Vue.js",
      "MySQL",
      "PostgreSQL",
      "Redis",
      "AWS",
      "Docker",
    ],
  },
  {
    company: "Software Solutions Firm",
    role: "Software Engineer",
    period: "2014 — 2016",
    location: "Colombo, Sri Lanka",
    summary:
      "Full-stack engineer building web applications and API integrations for SMB and enterprise customers.",
    highlights: [
      "Shipped customer portals, booking systems, and payment integrations for a dozen client projects.",
      "Built REST APIs and OAuth2-secured integrations connecting client systems to third-party platforms.",
      "Progressed from junior to mid-level engineer while owning increasingly complex modules end to end.",
    ],
    stack: ["PHP", "JavaScript", "MySQL", "Linux", "REST APIs"],
  },
];

export const milestones = [
  { year: "2014", title: "Started professional engineering career", detail: "First production systems: web apps, REST APIs, payment integrations." },
  { year: "2016", title: "First enterprise CRM delivery", detail: "Led modules of a CRM platform serving 200+ sales users." },
  { year: "2018", title: "Cloud & DevOps depth", detail: "Docker, AWS, CI/CD pipelines became core to every delivery." },
  { year: "2019", title: "Enterprise proptech platform leadership", detail: "Senior engineer on enterprise proptech and field service platforms." },
  { year: "2021", title: "Event-driven architecture at scale", detail: "Outbox pattern, message queues, and distributed workflows in production." },
  { year: "2023", title: "AI engineering pivot", detail: "First LLM features in production: document extraction and semantic search." },
  { year: "2024", title: "RAG & agents in production", detail: "Shipped RAG pipelines, AI knowledge assistant, and agentic workflows." },
  { year: "2026", title: "Forward Deployed focus", detail: "Deep in MCP, LangGraph, multi-agent systems, and enterprise AI delivery." },
] as const;
