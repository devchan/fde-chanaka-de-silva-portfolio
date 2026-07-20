const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://chanakadesilva.dev";

export const site = {
  name: "Chanaka De Silva",
  title: "Forward Deployed Engineer",
  url: siteUrl,
  email: "chanakadesilva31@gmail.com",
  github: "https://github.com/devchan",
  linkedin: "https://www.linkedin.com/in/chanakakasun",
  // next/link prepends the configured basePath automatically; don't add it here
  // or GitHub Pages ends up with a doubled prefix and a 404.
  resumeUrl: `/resume/chanaka-de-silva-resume.pdf`,
  tagline:
    "Building enterprise AI platforms, mission-critical integrations, and distributed systems that ship.",
  description:
    "Forward Deployed Engineer and consultant with 11+ years building enterprise AI, RAG and agent systems, mission-critical integrations, and distributed systems that ship. Available for consulting engagements.",
  keywords: [
    "Forward Deployed Engineer",
    "Forward Deployed Engineer consultant",
    "AI consultant",
    "AI Solutions Engineer",
    "Solutions Architect",
    "Enterprise AI consulting",
    "RAG",
    "AI Agents",
    "LangGraph",
    "MCP",
    "Distributed Systems",
    "Senior Software Engineer",
    "Staff Software Engineer",
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

// Home-page section visibility. Editable in the admin; these are the seed
// defaults used for the static (GitHub Pages) baseline and as the fallback when
// no stored config exists.
export const features = {
  stats: true,
  techMarquee: true,
  githubGraph: true,
} as const;

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
