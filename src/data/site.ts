const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://chanakadesilva.dev";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const site = {
  name: "Chanaka De Silva",
  title: "Senior Software Engineer",
  url: siteUrl,
  email: "chanakadesilva31@gmail.com",
  github: "https://github.com/devchan",
  linkedin: "https://www.linkedin.com/in/chanakakasun",
  resumeUrl: `${basePath}/resume/chanaka-de-silva-resume.pdf`,
  tagline:
    "Building enterprise AI platforms, mission-critical integrations, and distributed systems that ship.",
  description:
    "Senior Software Engineer with 11+ years of experience building enterprise SaaS products, CRM platforms, workflow automation, cloud integrations, distributed applications, AI-powered solutions, and scalable backend architectures.",
  keywords: [
    "Forward Deployed Engineer",
    "Senior Software Engineer",
    "Staff Software Engineer",
    "AI Solutions Engineer",
    "Solutions Architect",
    "Enterprise AI",
    "RAG",
    "AI Agents",
    "LangGraph",
    "MCP",
    "Distributed Systems",
    "Laravel",
    "Next.js",
    "Kubernetes",
  ],
  targetRoles: [
    "Forward Deployed Engineer",
    "Staff Software Engineer",
    "Senior Software Engineer",
    "AI Solutions Engineer",
    "Solutions Architect",
    "Technical Consultant",
  ],
} as const;

export const stats = [
  { label: "Years Experience", value: 11, suffix: "+" },
  { label: "Projects Delivered", value: 40, suffix: "+" },
  { label: "Enterprise Integrations", value: 25, suffix: "+" },
  { label: "AI Solutions Built", value: 12, suffix: "+" },
] as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/architecture", label: "Architecture" },
  { href: "/ai-lab", label: "AI Lab" },
  { href: "/skills", label: "Skills" },
  { href: "/blog", label: "Blog" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
] as const;

export const technologies = [
  "PHP",
  "Laravel",
  "Python",
  "Go",
  "Rust",
  "Node.js",
  "Vue.js",
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "MySQL",
  "PostgreSQL",
  "Redis",
  "pgvector",
  "Qdrant",
  "Milvus",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Terraform",
  "OpenAI",
  "LangGraph",
  "gRPC",
  "GraphQL",
  "OpenTelemetry",
  "Prometheus",
  "Grafana",
] as const;
