import type { ArchitectureDiagram } from "@/lib/types";

/**
 * Data-driven architecture diagrams rendered by the SVG diagram component.
 * Layout grid: canvas width 1000, columns at roughly x = 30 / 234 / 438 / 642 / 846,
 * node size ~144x60, >=60px horizontal and >=30px vertical gaps between nodes.
 */
export const diagrams: ArchitectureDiagram[] = [
  // -------------------------------------------------------------------------
  // 1. Microservices Architecture
  // -------------------------------------------------------------------------
  {
    id: "microservices",
    title: "Microservices Architecture",
    description:
      "A multi-tenant SaaS platform decomposed into domain services behind an API gateway, each owning its datastore, with async messaging for cross-service events.",
    width: 1000,
    height: 560,
    nodes: [
      { id: "client", x: 30, y: 240, w: 144, h: 60, label: "Web Client", sublabel: "React SPA", kind: "client" },
      { id: "gateway", x: 234, y: 240, w: 144, h: 60, label: "API Gateway", sublabel: "Kong", kind: "gateway" },
      { id: "redis", x: 234, y: 90, w: 144, h: 60, label: "Redis", sublabel: "sessions / cache", kind: "datastore" },
      { id: "auth", x: 438, y: 40, w: 144, h: 60, label: "Auth Service", sublabel: "Go", kind: "service" },
      { id: "tenants", x: 438, y: 140, w: 144, h: 60, label: "Tenant Service", sublabel: "Laravel", kind: "service" },
      { id: "search", x: 438, y: 240, w: 144, h: 60, label: "Search Service", sublabel: "Go", kind: "service" },
      { id: "billing", x: 438, y: 340, w: 144, h: 60, label: "Billing Service", sublabel: "Laravel", kind: "service" },
      { id: "notifications", x: 438, y: 440, w: 144, h: 60, label: "Notifications", sublabel: "Node.js", kind: "service" },
      { id: "auth-db", x: 642, y: 40, w: 144, h: 60, label: "Auth DB", sublabel: "PostgreSQL", kind: "datastore" },
      { id: "tenants-db", x: 642, y: 140, w: 144, h: 60, label: "Tenants DB", sublabel: "PostgreSQL", kind: "datastore" },
      { id: "search-idx", x: 642, y: 240, w: 144, h: 60, label: "Search Index", sublabel: "Elasticsearch", kind: "datastore" },
      { id: "billing-db", x: 642, y: 340, w: 144, h: 60, label: "Billing DB", sublabel: "PostgreSQL", kind: "datastore" },
      { id: "bus", x: 642, y: 440, w: 144, h: 60, label: "Message Bus", sublabel: "Kafka", kind: "queue" },
    ],
    edges: [
      { from: "client", to: "gateway", label: "HTTPS" },
      { from: "gateway", to: "redis", label: "cache", fromSide: "top", toSide: "bottom" },
      { from: "gateway", to: "auth", label: "JWT" },
      { from: "gateway", to: "tenants" },
      { from: "gateway", to: "search" },
      { from: "gateway", to: "billing" },
      { from: "auth", to: "auth-db", label: "SQL" },
      { from: "tenants", to: "tenants-db", label: "SQL" },
      { from: "search", to: "search-idx", label: "index" },
      { from: "billing", to: "billing-db", label: "SQL" },
      { from: "billing", to: "bus", label: "events", dashed: true, fromSide: "bottom", toSide: "top" },
      { from: "bus", to: "notifications", label: "consume", dashed: true, fromSide: "left", toSide: "right" },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. AI Agent Workflow
  // -------------------------------------------------------------------------
  {
    id: "ai-agent-workflow",
    title: "AI Agent Workflow",
    description:
      "A supervisor agent routes user requests to specialist agents that call a governed tool layer, with guardrails on every hop and results merged by a synthesis step.",
    width: 1000,
    height: 480,
    nodes: [
      { id: "user", x: 30, y: 210, w: 144, h: 60, label: "User", sublabel: "chat UI", kind: "client" },
      { id: "guardrails", x: 234, y: 50, w: 144, h: 60, label: "Guardrails", sublabel: "policy / PII", kind: "service" },
      { id: "supervisor", x: 234, y: 210, w: 144, h: 60, label: "Supervisor Agent", sublabel: "GPT-4o", kind: "ai" },
      { id: "agent-crm", x: 438, y: 50, w: 144, h: 60, label: "CRM Agent", sublabel: "function calling", kind: "ai" },
      { id: "agent-search", x: 438, y: 210, w: 144, h: 60, label: "Search Agent", sublabel: "tool use", kind: "ai" },
      { id: "agent-data", x: 438, y: 370, w: 144, h: 60, label: "Data Agent", sublabel: "SQL generation", kind: "ai" },
      { id: "tool-crm", x: 642, y: 50, w: 144, h: 60, label: "CRM API", sublabel: "REST", kind: "external" },
      { id: "tool-search", x: 642, y: 210, w: 144, h: 60, label: "Web Search", sublabel: "search API", kind: "external" },
      { id: "tool-db", x: 642, y: 370, w: 144, h: 60, label: "Database", sublabel: "PostgreSQL", kind: "datastore" },
      { id: "synthesis", x: 846, y: 210, w: 144, h: 60, label: "Response Synthesis", sublabel: "streaming", kind: "ai" },
    ],
    edges: [
      { from: "user", to: "supervisor", label: "prompt" },
      { from: "supervisor", to: "guardrails", label: "checks", dashed: true, fromSide: "top", toSide: "bottom" },
      { from: "supervisor", to: "agent-crm", label: "route" },
      { from: "supervisor", to: "agent-search" },
      { from: "supervisor", to: "agent-data" },
      { from: "agent-crm", to: "tool-crm", label: "REST" },
      { from: "agent-search", to: "tool-search", label: "query" },
      { from: "agent-data", to: "tool-db", label: "SQL" },
      { from: "tool-crm", to: "synthesis", label: "results", dashed: true },
      { from: "tool-search", to: "synthesis", dashed: true },
      { from: "tool-db", to: "synthesis", dashed: true },
    ],
  },

  // -------------------------------------------------------------------------
  // 3. RAG Pipeline
  // -------------------------------------------------------------------------
  {
    id: "rag-pipeline",
    title: "RAG Pipeline",
    description:
      "Offline ingestion chunks and embeds documents into pgvector while the online query lane rewrites, retrieves, reranks, and generates grounded answers.",
    width: 1000,
    height: 560,
    groups: [
      { label: "Ingestion", x: 10, y: 22, w: 796, h: 128 },
      { label: "Query", x: 10, y: 232, w: 988, h: 278 },
    ],
    nodes: [
      { id: "docs", x: 30, y: 70, w: 144, h: 60, label: "Documents", sublabel: "S3 / uploads", kind: "external" },
      { id: "ingest", x: 234, y: 70, w: 144, h: 60, label: "Ingestion Worker", sublabel: "Laravel queue", kind: "worker" },
      { id: "chunker", x: 438, y: 70, w: 144, h: 60, label: "Chunk + Embed", sublabel: "text-embedding-3", kind: "ai" },
      { id: "vectordb", x: 642, y: 70, w: 144, h: 60, label: "Vector DB", sublabel: "pgvector", kind: "datastore" },
      { id: "user", x: 30, y: 280, w: 138, h: 60, label: "User", sublabel: "chat UI", kind: "client" },
      { id: "rewrite", x: 238, y: 280, w: 138, h: 60, label: "Query Rewrite", sublabel: "GPT-4o mini", kind: "ai" },
      { id: "hybrid", x: 446, y: 280, w: 138, h: 60, label: "Hybrid Retrieval", sublabel: "BM25 + ANN", kind: "service" },
      { id: "reranker", x: 654, y: 280, w: 138, h: 60, label: "Reranker", sublabel: "cross-encoder", kind: "ai" },
      { id: "llm", x: 852, y: 280, w: 138, h: 60, label: "LLM", sublabel: "GPT-4o", kind: "ai" },
      { id: "response", x: 852, y: 430, w: 138, h: 60, label: "Response", sublabel: "streamed + cited", kind: "client" },
    ],
    edges: [
      { from: "docs", to: "ingest", label: "fetch" },
      { from: "ingest", to: "chunker", label: "clean" },
      { from: "chunker", to: "vectordb", label: "embed" },
      { from: "vectordb", to: "hybrid", label: "ANN", dashed: true, fromSide: "bottom", toSide: "top" },
      { from: "user", to: "rewrite", label: "query" },
      { from: "rewrite", to: "hybrid" },
      { from: "hybrid", to: "reranker", label: "top-50" },
      { from: "reranker", to: "llm", label: "top-5" },
      { from: "llm", to: "response", label: "answer", fromSide: "bottom", toSide: "top" },
    ],
  },

  // -------------------------------------------------------------------------
  // 4. Enterprise Integration Hub
  // -------------------------------------------------------------------------
  {
    id: "enterprise-integration",
    title: "Enterprise Integration Hub",
    description:
      "A central integration hub brokers outbound API calls to third-party SaaS while webhooks flow back through a verified receiver, queue, and sync workers.",
    width: 1000,
    height: 580,
    groups: [{ label: "External SaaS", x: 826, y: 12, w: 172, h: 518 }],
    nodes: [
      { id: "core", x: 30, y: 240, w: 144, h: 60, label: "Core Platform", sublabel: "Laravel", kind: "service" },
      { id: "hub", x: 234, y: 240, w: 144, h: 60, label: "Integration Hub", sublabel: "connector registry", kind: "gateway" },
      { id: "workers", x: 234, y: 470, w: 144, h: 60, label: "Sync Workers", sublabel: "Horizon", kind: "worker" },
      { id: "queue", x: 438, y: 470, w: 144, h: 60, label: "Job Queue", sublabel: "Redis", kind: "queue" },
      { id: "receiver", x: 642, y: 470, w: 144, h: 60, label: "Webhook Receiver", sublabel: "signature verify", kind: "service" },
      { id: "msgraph", x: 846, y: 60, w: 140, h: 60, label: "Microsoft Graph", sublabel: "mail / calendar", kind: "external" },
      { id: "stripe", x: 846, y: 190, w: 140, h: 60, label: "Stripe", sublabel: "billing", kind: "external" },
      { id: "sendgrid", x: 846, y: 320, w: 140, h: 60, label: "SendGrid", sublabel: "email", kind: "external" },
      { id: "google", x: 846, y: 450, w: 140, h: 60, label: "Google APIs", sublabel: "OAuth2", kind: "external" },
    ],
    edges: [
      { from: "core", to: "hub", label: "REST" },
      { from: "hub", to: "msgraph", label: "Graph API" },
      { from: "hub", to: "stripe" },
      { from: "hub", to: "sendgrid" },
      { from: "hub", to: "google" },
      { from: "msgraph", to: "receiver", label: "webhook", dashed: true, fromSide: "left", toSide: "top" },
      { from: "stripe", to: "receiver", label: "webhook", dashed: true, fromSide: "left", toSide: "top" },
      { from: "receiver", to: "queue", label: "enqueue", fromSide: "left", toSide: "right" },
      { from: "queue", to: "workers", label: "consume", fromSide: "left", toSide: "right" },
      { from: "workers", to: "core", label: "upsert", fromSide: "left", toSide: "bottom" },
    ],
  },

  // -------------------------------------------------------------------------
  // 5. CRM Platform
  // -------------------------------------------------------------------------
  {
    id: "crm-architecture",
    title: "CRM Platform",
    description:
      "A Vue SPA drives a Laravel API split into domain services over MySQL and Redis, with queued jobs handling outbound email through SendGrid.",
    width: 1000,
    height: 500,
    nodes: [
      { id: "spa", x: 30, y: 210, w: 144, h: 60, label: "Vue SPA", sublabel: "Vue 3 + Pinia", kind: "client" },
      { id: "api", x: 234, y: 210, w: 144, h: 60, label: "Laravel API", sublabel: "REST / Sanctum", kind: "gateway" },
      { id: "leads", x: 438, y: 40, w: 144, h: 60, label: "Leads Service", sublabel: "scoring", kind: "service" },
      { id: "pipeline", x: 438, y: 140, w: 144, h: 60, label: "Pipeline Service", sublabel: "deal stages", kind: "service" },
      { id: "activities", x: 438, y: 240, w: 144, h: 60, label: "Activities Service", sublabel: "timeline", kind: "service" },
      { id: "reporting", x: 438, y: 340, w: 144, h: 60, label: "Reporting Service", sublabel: "aggregations", kind: "service" },
      { id: "mysql", x: 642, y: 90, w: 144, h: 60, label: "MySQL", sublabel: "InnoDB", kind: "datastore" },
      { id: "redis", x: 642, y: 240, w: 144, h: 60, label: "Redis", sublabel: "cache", kind: "datastore" },
      { id: "queue", x: 642, y: 390, w: 144, h: 60, label: "Job Queue", sublabel: "Redis", kind: "queue" },
      { id: "qworkers", x: 846, y: 390, w: 144, h: 60, label: "Queue Workers", sublabel: "Horizon", kind: "worker" },
      { id: "sendgrid", x: 846, y: 240, w: 144, h: 60, label: "SendGrid", sublabel: "transactional", kind: "external" },
    ],
    edges: [
      { from: "spa", to: "api", label: "HTTPS" },
      { from: "api", to: "leads" },
      { from: "api", to: "pipeline" },
      { from: "api", to: "activities" },
      { from: "api", to: "reporting" },
      { from: "leads", to: "mysql", label: "SQL" },
      { from: "pipeline", to: "mysql", label: "SQL" },
      { from: "reporting", to: "redis", label: "cache" },
      { from: "activities", to: "queue", label: "jobs", dashed: true },
      { from: "queue", to: "qworkers", label: "consume" },
      { from: "qworkers", to: "sendgrid", label: "email", fromSide: "top", toSide: "bottom" },
    ],
  },

  // -------------------------------------------------------------------------
  // 6. Microsoft Graph Email Integration
  // -------------------------------------------------------------------------
  {
    id: "msgraph-integration",
    title: "Microsoft Graph Email Integration",
    description:
      "Graph change notifications push mailbox events through a verified receiver into a queue, where sync workers fetch, normalize, and persist email with OAuth2 and delta-sync support.",
    width: 1000,
    height: 440,
    groups: [{ label: "Microsoft 365", x: 10, y: 42, w: 388, h: 128 }],
    nodes: [
      { id: "mailbox", x: 30, y: 90, w: 144, h: 60, label: "M365 Mailbox", sublabel: "Exchange Online", kind: "external" },
      { id: "webhooks", x: 234, y: 90, w: 144, h: 60, label: "Graph Webhooks", sublabel: "subscriptions", kind: "external" },
      { id: "receiver", x: 438, y: 90, w: 144, h: 60, label: "Webhook Receiver", sublabel: "validation token", kind: "service" },
      { id: "queue", x: 642, y: 90, w: 144, h: 60, label: "Sync Queue", sublabel: "Redis", kind: "queue" },
      { id: "syncworker", x: 846, y: 90, w: 144, h: 60, label: "Sync Worker", sublabel: "Graph SDK", kind: "worker" },
      { id: "normalizer", x: 846, y: 300, w: 144, h: 60, label: "Normalizer", sublabel: "MIME parser", kind: "service" },
      { id: "mysql", x: 642, y: 300, w: 144, h: 60, label: "MySQL", sublabel: "emails / threads", kind: "datastore" },
      { id: "token", x: 234, y: 300, w: 144, h: 60, label: "OAuth2 Token Service", sublabel: "refresh flow", kind: "service" },
      { id: "scheduler", x: 30, y: 300, w: 144, h: 60, label: "Delta Scheduler", sublabel: "cron", kind: "worker" },
    ],
    edges: [
      { from: "mailbox", to: "webhooks", label: "changes" },
      { from: "webhooks", to: "receiver", label: "push", dashed: true },
      { from: "receiver", to: "queue", label: "enqueue" },
      { from: "queue", to: "syncworker", label: "consume" },
      { from: "syncworker", to: "normalizer", label: "raw", fromSide: "bottom", toSide: "top" },
      { from: "normalizer", to: "mysql", label: "upsert", fromSide: "left", toSide: "right" },
      { from: "token", to: "syncworker", label: "token", fromSide: "right", toSide: "bottom" },
      { from: "scheduler", to: "queue", label: "delta", dashed: true, fromSide: "top", toSide: "bottom" },
    ],
  },

  // -------------------------------------------------------------------------
  // 7. Stripe Payment Flow
  // -------------------------------------------------------------------------
  {
    id: "stripe-payment-flow",
    title: "Stripe Payment Flow",
    description:
      "Checkout creates payment intents through the API while Stripe webhooks drive an idempotent handler, queue, and billing service that persists state and emails receipts.",
    width: 1000,
    height: 420,
    nodes: [
      { id: "checkout", x: 30, y: 90, w: 144, h: 60, label: "Checkout Client", sublabel: "Stripe.js", kind: "client" },
      { id: "api", x: 234, y: 90, w: 144, h: 60, label: "Payments API", sublabel: "Laravel Cashier", kind: "service" },
      { id: "stripe", x: 438, y: 90, w: 144, h: 60, label: "Stripe", sublabel: "Payment Intents", kind: "external" },
      { id: "sendgrid", x: 642, y: 90, w: 144, h: 60, label: "SendGrid", sublabel: "receipts", kind: "external" },
      { id: "db", x: 846, y: 90, w: 144, h: 60, label: "PostgreSQL", sublabel: "orders / invoices", kind: "datastore" },
      { id: "handler", x: 438, y: 300, w: 144, h: 60, label: "Webhook Handler", sublabel: "idempotency keys", kind: "service" },
      { id: "queue", x: 642, y: 300, w: 144, h: 60, label: "Job Queue", sublabel: "Redis", kind: "queue" },
      { id: "billing", x: 846, y: 300, w: 144, h: 60, label: "Billing Service", sublabel: "invoicing", kind: "service" },
    ],
    edges: [
      { from: "checkout", to: "api", label: "HTTPS" },
      { from: "api", to: "stripe", label: "intent" },
      { from: "stripe", to: "handler", label: "webhook", dashed: true, fromSide: "bottom", toSide: "top" },
      { from: "handler", to: "queue", label: "enqueue" },
      { from: "queue", to: "billing", label: "consume" },
      { from: "billing", to: "db", label: "SQL", fromSide: "top", toSide: "bottom" },
      { from: "billing", to: "sendgrid", label: "receipt", dashed: true, fromSide: "left", toSide: "bottom" },
    ],
  },

  // -------------------------------------------------------------------------
  // 8. Message Queue Architecture
  // -------------------------------------------------------------------------
  {
    id: "message-queue",
    title: "Message Queue Architecture",
    description:
      "Producer services publish to a topic exchange fanned out to consumer groups, with failed messages parked in a DLQ, replayed by a retry worker, and monitored by a metrics exporter.",
    width: 1000,
    height: 490,
    nodes: [
      { id: "svc-orders", x: 30, y: 60, w: 144, h: 60, label: "Orders Service", sublabel: "producer", kind: "service" },
      { id: "svc-users", x: 30, y: 180, w: 144, h: 60, label: "Users Service", sublabel: "producer", kind: "service" },
      { id: "svc-billing", x: 30, y: 300, w: 144, h: 60, label: "Billing Service", sublabel: "producer", kind: "service" },
      { id: "exchange", x: 234, y: 180, w: 144, h: 60, label: "Topic Exchange", sublabel: "RabbitMQ", kind: "queue" },
      { id: "cons-email", x: 438, y: 40, w: 144, h: 60, label: "Email Consumers", sublabel: "group: email", kind: "worker" },
      { id: "cons-webhook", x: 438, y: 150, w: 144, h: 60, label: "Webhook Consumers", sublabel: "group: webhooks", kind: "worker" },
      { id: "cons-analytics", x: 438, y: 260, w: 144, h: 60, label: "Analytics Consumers", sublabel: "group: analytics", kind: "worker" },
      { id: "dlq", x: 642, y: 380, w: 144, h: 60, label: "Dead Letter Queue", sublabel: "TTL 7d", kind: "queue" },
      { id: "retry", x: 234, y: 380, w: 144, h: 60, label: "Retry Worker", sublabel: "exp. backoff", kind: "worker" },
      { id: "metrics", x: 846, y: 380, w: 144, h: 60, label: "Metrics Exporter", sublabel: "Prometheus", kind: "service" },
    ],
    edges: [
      { from: "svc-orders", to: "exchange", label: "publish" },
      { from: "svc-users", to: "exchange" },
      { from: "svc-billing", to: "exchange" },
      { from: "exchange", to: "cons-email", label: "route" },
      { from: "exchange", to: "cons-webhook" },
      { from: "exchange", to: "cons-analytics" },
      { from: "cons-analytics", to: "dlq", label: "nack", dashed: true, fromSide: "right", toSide: "left" },
      { from: "dlq", to: "retry", label: "replay", fromSide: "left", toSide: "right" },
      { from: "retry", to: "exchange", label: "requeue", dashed: true, fromSide: "top", toSide: "bottom" },
      { from: "dlq", to: "metrics", label: "depth", dashed: true },
    ],
  },

  // -------------------------------------------------------------------------
  // 9. Event-driven Architecture
  // -------------------------------------------------------------------------
  {
    id: "event-driven",
    title: "Event-driven Architecture",
    description:
      "Services write events transactionally to an outbox relayed onto Kafka, where independent consumers build read models, send notifications, and keep an audit trail.",
    width: 1000,
    height: 460,
    groups: [
      { label: "Producers", x: 10, y: 12, w: 184, h: 408 },
      { label: "Consumers", x: 826, y: 12, w: 172, h: 408 },
    ],
    nodes: [
      { id: "orders", x: 30, y: 60, w: 144, h: 60, label: "Orders Service", sublabel: "Laravel", kind: "service" },
      { id: "payments", x: 30, y: 200, w: 144, h: 60, label: "Payments Service", sublabel: "Laravel", kind: "service" },
      { id: "shipping", x: 30, y: 340, w: 144, h: 60, label: "Shipping Service", sublabel: "Go", kind: "service" },
      { id: "outbox", x: 234, y: 200, w: 144, h: 60, label: "Outbox Table", sublabel: "same TX", kind: "datastore" },
      { id: "relay", x: 438, y: 200, w: 144, h: 60, label: "Outbox Relay", sublabel: "CDC poller", kind: "worker" },
      { id: "bus", x: 642, y: 200, w: 144, h: 60, label: "Event Bus", sublabel: "Kafka", kind: "queue" },
      { id: "read-models", x: 642, y: 60, w: 144, h: 60, label: "Read Models", sublabel: "denormalized", kind: "datastore" },
      { id: "projections", x: 846, y: 60, w: 144, h: 60, label: "Projections", sublabel: "CQRS", kind: "worker" },
      { id: "notifications", x: 846, y: 200, w: 144, h: 60, label: "Notifications", sublabel: "email / push", kind: "worker" },
      { id: "audit", x: 846, y: 340, w: 144, h: 60, label: "Audit Log", sublabel: "append-only", kind: "worker" },
    ],
    edges: [
      { from: "orders", to: "outbox", label: "TX" },
      { from: "payments", to: "outbox", label: "TX" },
      { from: "shipping", to: "outbox", label: "TX" },
      { from: "outbox", to: "relay", label: "poll" },
      { from: "relay", to: "bus", label: "publish" },
      { from: "bus", to: "projections", label: "events", dashed: true },
      { from: "bus", to: "notifications", label: "events", dashed: true },
      { from: "bus", to: "audit", label: "events", dashed: true },
      { from: "projections", to: "read-models", label: "upsert", fromSide: "left", toSide: "right" },
    ],
  },

  // -------------------------------------------------------------------------
  // 10. Distributed System
  // -------------------------------------------------------------------------
  {
    id: "distributed-system",
    title: "Distributed System",
    description:
      "Load-balanced stateless replicas backed by a distributed cache, primary/replica database, workers, and object storage, fully instrumented through an OpenTelemetry pipeline.",
    width: 1000,
    height: 600,
    groups: [{ label: "Observability", x: 214, y: 432, w: 592, h: 128 }],
    nodes: [
      { id: "lb", x: 30, y: 150, w: 144, h: 60, label: "Load Balancer", sublabel: "ALB / nginx", kind: "gateway" },
      { id: "app-1", x: 234, y: 40, w: 144, h: 60, label: "App Replica 1", sublabel: "stateless", kind: "service" },
      { id: "app-2", x: 234, y: 150, w: 144, h: 60, label: "App Replica 2", sublabel: "stateless", kind: "service" },
      { id: "app-3", x: 234, y: 260, w: 144, h: 60, label: "App Replica 3", sublabel: "stateless", kind: "service" },
      { id: "cache", x: 438, y: 40, w: 144, h: 60, label: "Distributed Cache", sublabel: "Redis Cluster", kind: "datastore" },
      { id: "db-primary", x: 438, y: 150, w: 144, h: 60, label: "Primary DB", sublabel: "PostgreSQL", kind: "datastore" },
      { id: "workers", x: 438, y: 260, w: 144, h: 60, label: "Background Workers", sublabel: "job queues", kind: "worker" },
      { id: "db-replica", x: 642, y: 150, w: 144, h: 60, label: "Read Replica", sublabel: "PostgreSQL", kind: "datastore" },
      { id: "storage", x: 846, y: 260, w: 144, h: 60, label: "Object Storage", sublabel: "S3", kind: "datastore" },
      { id: "otel", x: 234, y: 480, w: 144, h: 60, label: "OTel Collector", sublabel: "OTLP", kind: "service" },
      { id: "prometheus", x: 438, y: 480, w: 144, h: 60, label: "Prometheus", sublabel: "TSDB", kind: "datastore" },
      { id: "grafana", x: 642, y: 480, w: 144, h: 60, label: "Grafana", sublabel: "dashboards", kind: "service" },
    ],
    edges: [
      { from: "lb", to: "app-1", label: "HTTP" },
      { from: "lb", to: "app-2" },
      { from: "lb", to: "app-3" },
      { from: "app-1", to: "cache", label: "get/set" },
      { from: "app-2", to: "db-primary", label: "SQL" },
      { from: "app-3", to: "workers", label: "jobs", dashed: true },
      { from: "workers", to: "db-primary", label: "SQL", fromSide: "top", toSide: "bottom" },
      { from: "db-primary", to: "db-replica", label: "WAL", dashed: true },
      { from: "workers", to: "storage", label: "uploads" },
      { from: "app-3", to: "otel", label: "OTLP", dashed: true, fromSide: "bottom", toSide: "top" },
      { from: "otel", to: "prometheus", label: "metrics" },
      { from: "prometheus", to: "grafana", label: "PromQL" },
    ],
  },
];

export function getDiagram(id: string): ArchitectureDiagram | undefined {
  return diagrams.find((d) => d.id === id);
}
