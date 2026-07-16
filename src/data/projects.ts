import type { ProjectCaseStudy } from "@/lib/types";

export const projects: ProjectCaseStudy[] = [
  // -------------------------------------------------------------------------
  // 1. Enterprise Property Technology Platform
  // -------------------------------------------------------------------------
  {
    slug: "enterprise-proptech-platform",
    title: "Enterprise Property Technology Platform",
    tagline:
      "Multi-tenant SaaS platform powering property management for 200+ agencies across three markets, rebuilt from a monolith into domain-aligned services.",
    category: "Enterprise SaaS",
    featured: true,
    year: "2021",
    role: "Solution Architect & Senior Engineer",
    stack: [
      "PHP",
      "Laravel",
      "Vue.js",
      "MySQL",
      "Redis",
      "AWS",
      "Docker",
      "GitHub Actions",
      "REST",
      "Stripe",
    ],
    metrics: [
      { label: "Agencies onboarded", value: "200+" },
      { label: "Uptime SLA", value: "99.95%" },
      { label: "p95 API latency", value: "180 ms" },
      { label: "Release cadence", value: "Weekly → daily" },
    ],
    sections: {
      businessProblem: [
        "The company sold property management software to real estate agencies, but the original codebase was a nine-year-old PHP monolith with a single shared database. Every new agency added load to the same MySQL instance, and one tenant running a large end-of-month statement batch could degrade response times for everyone. Support tickets about slowness spiked to 60+ per week during peak periods.",
        "Sales had signed two enterprise agencies with 5,000+ managed properties each, and the platform simply could not onboard them safely. Deployments were monthly, all-hands-on-deck events with a rollback rate around 20%. The business needed a platform that could scale per tenant, ship changes weekly or faster, and pass the security reviews these larger customers required.",
      ],
      architecture: [
        "I designed a strangler-fig migration from the monolith to domain-aligned Laravel services: tenancy and identity, property and lease management, trust accounting, and communications. Each service owned its schema, with tenant isolation enforced through a shared tenancy library that scoped every query by tenant ID and blocked cross-tenant access at the ORM layer. An API gateway handled routing, rate limiting per tenant, and JWT validation.",
        "Cross-service workflows such as lease renewal and rent disbursement ran through Redis-backed queues rather than synchronous calls, so a slow accounting job never blocked the property service. The heaviest workload, end-of-month statement generation for thousands of owners per agency, moved to a dedicated worker fleet on AWS that autoscaled from 2 to 24 containers based on queue depth.",
        "The Vue.js frontend consumed a versioned REST API, which let us migrate screens off the legacy monolith one module at a time without a big-bang cutover. Stripe handled subscription billing with per-tenant metered usage for SMS and document storage.",
      ],
      systemDesign: [
        "Tenant-scoped query builder baked into a shared Laravel package, making cross-tenant data leaks a compile-time-style impossibility rather than a code-review hope.",
        "Read replicas for reporting queries, with a query router that sent anything tagged as analytical to the replica pool, cutting primary DB load by roughly 40%.",
        "Idempotency keys on all financial mutations so retried disbursement jobs could never double-pay an owner.",
        "Queue-depth-based autoscaling for statement workers, sized so month-end runs completed inside a 4-hour window instead of the previous 14 hours.",
        "Per-tenant rate limits and circuit breakers at the gateway, so a single agency running a bulk import could not starve other tenants.",
        "Blue-green deployments via GitHub Actions with automated smoke tests against a seeded tenant before traffic switch.",
      ],
      responsibilities: [
        "Owned the target architecture and the 18-month strangler migration roadmap, sequenced so revenue-critical trust accounting moved last.",
        "Designed and built the multi-tenancy library used by every service, including the tenant-scoped ORM layer and connection routing.",
        "Led a team of five engineers through the extraction of the property and communications domains.",
        "Rebuilt the end-of-month statement pipeline as an autoscaling queue-driven system on AWS ECS.",
        "Introduced the CI/CD pipeline on GitHub Actions, taking deployments from monthly manual releases to daily automated ones.",
        "Ran architecture reviews and wrote the security documentation that got the platform through two enterprise procurement audits.",
      ],
      challenges: [
        {
          title: "Migrating trust accounting without downtime",
          description:
            "Trust accounting handles client money and is regulated, so we could not tolerate inconsistency during migration. I built a dual-write layer with nightly reconciliation reports comparing ledgers between old and new systems; we ran both in parallel for six weeks and only cut over after 30 consecutive days of zero-diff reconciliation.",
        },
        {
          title: "Noisy-neighbor tenants",
          description:
            "Two agencies represented 30% of total data volume. Per-tenant rate limits at the gateway plus dedicated queue lanes for bulk operations meant their imports and reports ran on isolated capacity, and p95 latency for smaller tenants stopped correlating with big-tenant activity.",
        },
        {
          title: "Schema drift during the strangler period",
          description:
            "For 18 months, some tables were owned by the monolith and read by new services. I enforced a rule that only one system could write any given table, published change-data events for readers, and tracked ownership in a living schema registry document that gated migrations in CI.",
        },
      ],
      implementation: [
        "The tenancy package came first: a Laravel service provider that resolved the tenant from the JWT, bound it into the container, and applied a global query scope to every Eloquent model. It also managed per-tenant Redis prefixes and S3 paths. Getting this right early meant every subsequently extracted service inherited correct isolation for free.",
        "Service extraction followed a repeatable playbook: define the API contract, build the service against a copy of production data, dual-run with shadow traffic for two weeks, compare responses, then flip the gateway route. The communications service went first as the lowest-risk domain, and the lessons from it cut the property service migration time roughly in half.",
        "Observability was non-negotiable given the moving parts. Structured logs with tenant and request IDs flowed to CloudWatch, and I added latency and error-rate dashboards per service with alerts wired to on-call. The reconciliation tooling for accounting doubled as a permanent data-quality monitor after cutover.",
      ],
      results: [
        "Onboarded both 5,000+ property enterprise agencies; the larger one imported 480k historical records in under 3 hours using the bulk lanes.",
        "p95 API latency dropped from 1.4 s to 180 ms across the top 20 endpoints.",
        "End-of-month statement generation went from a 14-hour overnight ordeal to a 3.5-hour autoscaled run with zero manual intervention.",
        "Deployment frequency moved from monthly to daily, with change failure rate falling from ~20% to under 3%.",
        "Platform sustained 99.95% measured uptime over the following 12 months against a 99.9% contractual SLA.",
        "Support tickets attributable to performance dropped from 60+ per week to single digits.",
      ],
      lessonsLearned: [
        "Extract the lowest-risk domain first, even if it is not the most painful one; the migration playbook you build is worth more than the early win itself.",
        "Dual-write plus automated reconciliation buys you the confidence to migrate money-handling systems that no amount of testing alone can provide.",
        "Multi-tenancy enforced in a shared library beats multi-tenancy enforced by convention every single time.",
        "Per-tenant rate limiting is a product feature, not just an infrastructure control; it changed how sales scoped enterprise deals.",
      ],
      futureImprovements: [
        "Move the largest tenants to dedicated database shards with an automated shard-rebalancing tool.",
        "Replace the remaining monolith cron jobs with event-driven schedules to retire the legacy box entirely.",
        "Adopt OpenTelemetry for distributed tracing across the service boundary instead of correlating logs by request ID.",
        "Introduce a customer-facing status page fed directly from the same SLO metrics used internally.",
      ],
    },
    diagramId: "microservices",
  },

  // -------------------------------------------------------------------------
  // 2. Field Service Management Platform
  // -------------------------------------------------------------------------
  {
    slug: "field-service-management-platform",
    title: "Field Service Management Platform",
    tagline:
      "Event-driven job dispatch and scheduling platform coordinating 1,200 field technicians in near real time, with offline-tolerant mobile sync.",
    category: "Enterprise SaaS",
    featured: true,
    year: "2019",
    role: "Lead Backend Engineer",
    stack: [
      "PHP",
      "Laravel",
      "Node.js",
      "Vue.js",
      "MySQL",
      "Redis",
      "AWS",
      "Docker",
      "REST",
    ],
    metrics: [
      { label: "Field technicians", value: "1,200" },
      { label: "Jobs dispatched", value: "18k/day" },
      { label: "Dispatch latency", value: "<2 s" },
      { label: "Missed appointments", value: "-38%" },
    ],
    sections: {
      businessProblem: [
        "A facilities maintenance company ran dispatch for 1,200 field technicians on a system where job assignments were pushed by a polling mobile app every 10 minutes. Technicians regularly drove to jobs that had been cancelled or reassigned, and dispatchers worked from a board that was minutes stale. The company estimated 6-8% of technician hours were wasted on stale assignments.",
        "The commercial driver was SLA penalties: their largest contracts carried response-time commitments of 2-4 hours for priority faults, and missed windows triggered fee clawbacks. They needed dispatch decisions to reach technicians in seconds, a live view for dispatchers, and the whole thing had to tolerate technicians going offline in basements and rural areas for an hour at a time.",
      ],
      architecture: [
        "I designed an event-driven core around a Redis Streams event log. Every state change, job created, assigned, accepted, en route, on site, completed, was an immutable event. A Laravel API handled commands and validation, while a Node.js WebSocket layer fanned events out to dispatcher dashboards and technician apps within a couple of seconds of the source change.",
        "The scheduling engine consumed the same event stream to maintain a materialized view of technician availability, skills, and location, and produced ranked assignment suggestions. Dispatchers could accept a suggestion in one click or override it; either path emitted the same assignment event, so downstream consumers never cared how a decision was made.",
        "Mobile offline tolerance came from an append-only sync protocol: the app kept a local event journal, and on reconnect both sides exchanged events since the last acknowledged sequence number. Conflicts, like a technician completing a job that dispatch had reassigned, resolved through explicit domain rules rather than last-write-wins.",
      ],
      systemDesign: [
        "Event log as the source of truth with consumer groups per subsystem, so the dispatch board, scheduling engine, and reporting each replayed independently after a failure.",
        "Sequence-number-based mobile sync that survived hour-long offline gaps without full resyncs, keeping reconnect payloads under 50 KB in the typical case.",
        "Materialized availability view rebuilt from events, making the scheduling engine stateless and trivially restartable.",
        "Domain-rule conflict resolution for offline edits, with a small set of documented outcomes instead of silent data loss.",
        "Geospatial indexing of technician positions in Redis for sub-100 ms nearest-qualified-technician queries.",
        "Dead-letter handling with automated replay tooling, so a bad event never silently stalled a consumer group.",
      ],
      responsibilities: [
        "Owned backend architecture end to end, from the event schema to the sync protocol specification the mobile team built against.",
        "Built the scheduling engine, including the skills-and-proximity ranking model and the availability materializer.",
        "Wrote the Node.js WebSocket fan-out service and its Redis-backed presence tracking.",
        "Designed the offline sync protocol and led three joint debugging weeks with the mobile team to harden it against real network conditions.",
        "Set up load testing that replayed a full production day at 5x speed before each major release.",
        "Mentored two mid-level engineers who took over the reporting consumers, and ran the on-call rotation for the dispatch core.",
      ],
      challenges: [
        {
          title: "Offline conflicts with real-world consequences",
          description:
            "A technician marking a job complete while dispatch reassigns it offline is not a merge conflict, it is a business dispute. I catalogued the eight realistic conflict pairs with operations staff and encoded an explicit resolution for each, with an audit trail. Disputed-job tickets fell to near zero once outcomes became predictable.",
        },
        {
          title: "Event ordering across consumers",
          description:
            "Early prototypes processed events out of order under load, producing dispatch boards that briefly showed impossible states. Partitioning streams by job ID guaranteed per-job ordering while keeping parallelism across jobs, which fixed the anomalies without serializing the whole system.",
        },
        {
          title: "WebSocket scale on a modest budget",
          description:
            "1,200 concurrent mobile connections plus 80 dispatcher dashboards had to run on a small AWS footprint. Careful payload design (deltas, not snapshots), connection-level backpressure, and horizontal sharding by region kept the fan-out tier on three t3.medium instances.",
        },
      ],
      implementation: [
        "The event schema came first and was treated as a public contract: versioned, documented, and validated at the producer. That discipline paid off when the reporting team and a third-party integrator both built consumers without ever needing changes to the core.",
        "The scheduling engine started as a straightforward weighted scoring function over skills match, travel distance, current workload, and SLA priority. We resisted the temptation to make it clever early; instead we logged every suggestion alongside the dispatcher's actual choice, and used three months of that data to tune weights. Suggestion acceptance rate went from 55% to 84%.",
        "Rollout was region by region. The first region ran two weeks in shadow mode, with the new system generating assignments that were compared against dispatcher decisions but never sent to devices. That surfaced a timezone bug and a skills-taxonomy mismatch before a single technician was affected.",
      ],
      results: [
        "Dispatch-to-device latency dropped from a 10-minute polling worst case to under 2 seconds via WebSocket push.",
        "Missed SLA appointment windows fell 38% in the first quarter after full rollout, directly reducing contractual penalty payments.",
        "Wasted technician drive time from stale assignments was cut by an estimated 5,000 hours per year.",
        "Scheduling suggestion acceptance reached 84%, letting dispatchers manage 50% more technicians per seat.",
        "The platform processed 18k job events per day with the core services running on a deliberately modest 6-container footprint.",
        "Zero data-loss incidents from offline sync across two years of operation.",
      ],
      lessonsLearned: [
        "Offline-first sync is a domain modelling problem wearing a networking costume; enumerate the conflicts with the business before writing resolution code.",
        "Shadow mode is the cheapest insurance available for replacing a human workflow with an automated one.",
        "Logging the human override alongside the machine suggestion is the highest-value training data you can collect.",
        "Per-entity ordering with cross-entity parallelism is almost always the right event-stream partitioning answer.",
      ],
      futureImprovements: [
        "Replace the weighted scoring model with a learned ranking model trained on the accumulated suggestion/override dataset.",
        "Add predictive travel-time estimates from a routing API instead of straight-line distance.",
        "Move the event log from Redis Streams to a managed Kafka-compatible service for longer retention and simpler compliance replay.",
        "Expose a public webhook API so client companies can consume job events into their own systems.",
      ],
    },
    diagramId: "event-driven",
  },

  // -------------------------------------------------------------------------
  // 3. Compliance Matrix Engine
  // -------------------------------------------------------------------------
  {
    slug: "compliance-matrix-engine",
    title: "Compliance Matrix Engine",
    tagline:
      "Rules-driven compliance evaluation engine assessing 1.4M entity checks nightly across jurisdiction-specific regulation sets, with full auditability.",
    category: "Platform Engineering",
    featured: false,
    year: "2022",
    role: "Senior Software Engineer (Platform)",
    stack: [
      "Go",
      "PostgreSQL",
      "Redis",
      "Kubernetes",
      "Terraform",
      "GitHub Actions",
      "gRPC",
      "Prometheus",
      "Grafana",
    ],
    metrics: [
      { label: "Nightly evaluations", value: "1.4M" },
      { label: "Batch window", value: "6 h → 35 min" },
      { label: "Rule sets managed", value: "40+" },
      { label: "Audit reconstruction", value: "100%" },
    ],
    sections: {
      businessProblem: [
        "The platform tracked regulated entities, properties, licenses, and safety certificates, across multiple jurisdictions, each with its own regulation set and renewal timelines. Compliance status was computed by a tangle of SQL views and PHP cron jobs that took six hours nightly and nobody fully understood. When a jurisdiction changed a rule, updates took two to three weeks of risky development.",
        "Worse, the output was not auditable. When a customer disputed a compliance flag, or a regulator asked why an entity was marked compliant on a specific date, reconstructing the answer meant archaeology through logs and database backups. Legal flagged this as a material risk. The business needed rule changes deployable in days, evaluations explainable per entity per date, and the nightly batch finished before business hours in every timezone served.",
      ],
      architecture: [
        "I designed a standalone evaluation engine in Go, exposed over gRPC, that separated three concerns cleanly: rule definitions, entity facts, and evaluation results. Rules were versioned declarative documents, conditions over typed entity attributes with effective-date ranges, stored in PostgreSQL and authored through an internal UI with validation. Facts were ingested from the main platform through a change-data feed.",
        "Evaluation was a pure function: (rule set version, fact snapshot, evaluation date) always produced the same result, and the engine stored the full input references with every output. This made historical reconstruction exact rather than approximate; answering 'why was this entity compliant on March 3rd' became a single indexed query returning the rule version, the facts used, and the decision trace.",
        "The nightly batch ran as a Kubernetes job that partitioned entities across workers. Because evaluation was pure and inputs were snapshotted, workers scaled horizontally with zero coordination beyond partition assignment, and any failed partition could be re-run idempotently.",
      ],
      systemDesign: [
        "Declarative, versioned rule documents with effective-date ranges, so a regulation change scheduled for a future date could be authored and reviewed weeks ahead.",
        "Pure-function evaluation with snapshotted inputs, giving deterministic replay and exact historical reconstruction for audits.",
        "Decision traces stored per evaluation: every fired condition and its input values, compressed to keep storage around 40 bytes per check.",
        "Horizontally partitioned batch workers on Kubernetes, scaling to 30 pods to finish 1.4M evaluations in 35 minutes.",
        "Incremental re-evaluation triggered by fact changes during the day, so an updated certificate reflected in compliance status within a minute instead of waiting for the nightly run.",
        "Rule linting and dry-run diff in CI: every rule change PR showed exactly which entities would change status before merge.",
      ],
      responsibilities: [
        "Designed the rule document model and evaluation semantics in collaboration with the compliance domain experts.",
        "Built the Go evaluation engine, the gRPC API, and the batch orchestration on Kubernetes.",
        "Implemented the decision-trace storage format and the audit reconstruction query path.",
        "Created the dry-run diff tooling that let compliance officers preview the blast radius of a rule change before deployment.",
        "Wrote the Terraform modules and GitHub Actions pipelines for the engine's infrastructure.",
        "Migrated all 40+ legacy rule sets, pairing with domain experts to translate undocumented SQL logic into reviewed declarative rules.",
      ],
      challenges: [
        {
          title: "Translating undocumented legacy logic",
          description:
            "The old SQL views encoded years of unwritten decisions, including bugs customers had come to depend on. I built a differential harness that ran both systems against production data nightly and categorized every mismatch. Of 11,000 initial diffs, about 9,400 were legacy bugs we fixed deliberately with customer notice, and the rest drove rule corrections.",
        },
        {
          title: "Effective-dated everything",
          description:
            "Rules, facts, and jurisdiction assignments all change over time, and audits ask about the past. Modelling every input as a bitemporal record (valid time plus recorded time) was heavy up front but eliminated an entire class of 'the data changed after the fact' audit problems.",
        },
        {
          title: "Keeping traces affordable",
          description:
            "Naive JSON decision traces would have added ~2 TB per year. A compact binary trace format referencing rule-version IDs instead of inlining rule text, plus columnar compression, brought it to roughly 25 GB per year with no loss of reconstruction fidelity.",
        },
      ],
      implementation: [
        "The engine core was around 8,000 lines of Go with the evaluation semantics property-tested heavily: for any rule set and fact set, evaluation had to be deterministic, total, and order-independent. Property testing caught three subtle bugs around date-boundary conditions that example-based tests had missed.",
        "Migration ran rule set by rule set over five months. Each set went through translation, differential validation against the legacy system, sign-off by a compliance officer using the dry-run diff report, then cutover. The differential harness stayed on for 30 days after each cutover as a regression tripwire.",
        "Prometheus metrics covered evaluation throughput, per-rule-set latency, and diff counts during migrations, with Grafana dashboards the compliance team themselves watched. Giving the domain team direct visibility built the trust needed to retire the legacy system completely.",
      ],
      results: [
        "Nightly batch window shrank from 6 hours to 35 minutes for 1.4M entity checks.",
        "Rule change lead time dropped from 2-3 weeks of development to same-day authoring with next-day deployment after review.",
        "100% of audit requests answered with exact historical reconstruction; average response time for audit queries fell from days of manual work to under a minute.",
        "Intraday incremental evaluation reflected fact changes in compliance status within 60 seconds.",
        "Roughly 9,400 latent compliance calculation bugs identified and deliberately resolved during migration.",
        "Compliance team became self-sufficient in rule authoring; engineering involvement in rule changes dropped to review-only.",
      ],
      lessonsLearned: [
        "Purity and snapshotted inputs are the cheapest route to auditability; explanation becomes a query instead of a forensic project.",
        "A differential harness against the legacy system is worth building properly, it becomes your migration engine, your test suite, and your trust-building tool.",
        "Bitemporal modelling is expensive to retrofit and cheap to do up front in any system where regulators ask about the past.",
        "Dry-run diffs turn scary rule deployments into reviewable pull requests for non-engineers.",
      ],
      futureImprovements: [
        "Add a rule simulation sandbox where compliance officers can test hypothetical regulation changes against production-shaped data.",
        "Expose evaluation-as-a-service to customer systems via a public gRPC/REST API with per-customer rate limits.",
        "Auto-generate plain-language explanations of decision traces for customer-facing compliance reports.",
        "Explore incremental view maintenance to replace the remaining nightly batch entirely with continuous evaluation.",
      ],
    },
    diagramId: "distributed-system",
  },

  // -------------------------------------------------------------------------
  // 4. Microsoft Graph Email Integration
  // -------------------------------------------------------------------------
  {
    slug: "msgraph-email-integration",
    title: "Microsoft Graph Email Integration",
    tagline:
      "Webhook-driven two-way email sync between a CRM and Microsoft 365 for 3,000+ mailboxes, replacing 15-minute polling with sub-5-second delivery.",
    category: "Integrations",
    featured: false,
    year: "2023",
    role: "Senior Backend Engineer",
    stack: [
      "PHP",
      "Laravel",
      "Microsoft Graph",
      "OAuth2",
      "MySQL",
      "Redis",
      "Azure",
      "Docker",
      "REST",
    ],
    metrics: [
      { label: "Mailboxes synced", value: "3,000+" },
      { label: "Sync latency", value: "15 min → <5 s" },
      { label: "Messages processed", value: "250k/day" },
      { label: "Graph API cost", value: "-70% calls" },
    ],
    sections: {
      businessProblem: [
        "The CRM's email integration polled every connected Microsoft 365 mailbox on a 15-minute schedule via IMAP. Sales reps would call a lead, and the email thread context in the CRM was up to 15 minutes stale, which produced embarrassing double-contacts and made the timeline feature untrustworthy. Polling 3,000 mailboxes also burned worker capacity: over 280k IMAP sessions a day, most returning nothing new.",
        "Microsoft was simultaneously deprecating basic authentication for IMAP, putting a hard deadline on the whole approach. The business needed near-real-time sync, modern OAuth2 authentication, and two-way capability so emails sent from the CRM appeared correctly in the user's Sent Items. Reliability mattered more than raw speed: losing a customer email silently was the one unforgivable failure.",
      ],
      architecture: [
        "I rebuilt the integration on Microsoft Graph change notifications. Each connected mailbox got a Graph subscription; when mail arrived, Graph pushed a webhook within seconds, and a lightweight receiver validated it and enqueued a fetch job. Workers pulled full message content via Graph delta queries, matched messages to CRM contacts and deals, and wrote them to the timeline. Median arrival-to-timeline latency landed under 5 seconds.",
        "Because webhooks are inherently lossy, delivery is at-most-once from your perspective if anything hiccups, I paired them with a delta-query reconciliation sweep. Every mailbox ran a delta sync every 30 minutes using stored delta tokens, catching anything a missed webhook dropped. Webhooks provided speed; delta queries provided the correctness guarantee.",
        "OAuth2 token management was centralized in a token service handling refresh, encryption at rest, and admin-consent flows for organization-wide connections. Subscription lifecycle management ran as a scheduled process, since Graph subscriptions expire every ~3 days and renewal failures were the top cause of silent sync death in early testing.",
      ],
      systemDesign: [
        "Webhooks for latency, delta-query reconciliation for completeness, a deliberate two-layer design where neither mechanism needs to be perfect.",
        "Idempotent message ingestion keyed on Graph immutable IDs, so webhook/delta overlap never produced duplicate timeline entries.",
        "Subscription lifecycle manager with renewal at 70% of TTL, health scoring per mailbox, and automatic resubscribe-plus-backfill on failure.",
        "Per-tenant Graph throttling budget with adaptive backoff honoring Retry-After headers, keeping the app out of Microsoft's penalty box during bulk onboarding.",
        "Encrypted token vault with automatic refresh and proactive expiry alerts routed to customer success before users noticed anything.",
        "Contact-matching pipeline with confidence tiers: exact address match auto-linked, fuzzy matches queued for one-click user confirmation.",
      ],
      responsibilities: [
        "Owned the integration end to end: architecture, Graph API design decisions, implementation, and production operation.",
        "Built the webhook receiver, delta reconciliation engine, and subscription lifecycle manager.",
        "Implemented OAuth2 authorization code and admin-consent flows, including the token service and encryption model.",
        "Designed the migration that moved 3,000+ mailboxes from IMAP polling to Graph with zero user re-authentication where tenant admins granted consent.",
        "Wrote the throttling strategy after profiling Graph's per-app and per-mailbox limits against our real traffic shape.",
        "Built operational dashboards for per-mailbox sync health that customer success used directly, cutting escalations to engineering by more than half.",
      ],
      challenges: [
        {
          title: "Silent subscription death",
          description:
            "Graph subscriptions expire roughly every three days, and a failed renewal means a mailbox silently stops syncing. I treated subscription health as a first-class monitored resource: renewals at 70% TTL, a watchdog comparing expected-vs-received webhook volume per mailbox, and automatic resubscribe with delta backfill. Silent-death incidents went from weekly to zero.",
        },
        {
          title: "Graph throttling during bulk onboarding",
          description:
            "Onboarding a 400-mailbox tenant triggered 429 storms that degraded sync for existing customers. I introduced per-tenant concurrency budgets, honored Retry-After strictly, and spread initial historical backfills over off-peak hours. Bulk onboarding stopped affecting steady-state customers entirely.",
        },
        {
          title: "Duplicate and self-referencing messages",
          description:
            "Emails sent from the CRM via Graph would echo back through the webhook as new inbound mail. Tagging outbound messages with an internet-message header and matching on immutable IDs at ingestion made the pipeline fully idempotent, eliminating duplicate timeline entries that had plagued the beta.",
        },
      ],
      implementation: [
        "I started with a two-week spike against a test tenant purely to learn Graph's failure modes: subscription expiry behavior, throttling response shapes, delta token invalidation cases. That spike produced a failure-mode catalog that drove the design more than the happy-path docs did.",
        "The rollout ran in three rings: internal mailboxes, 50 volunteer customers, then general migration in tenant-sized batches. Each ring ran the new pipeline in parallel with legacy polling, with a comparator flagging any message one system saw and the other missed. Ring two caught the delta-token invalidation case that occurs when a mailbox moves between Exchange servers, which we then handled with automatic full resync.",
        "The final migration was mostly a consent problem, not a code problem. I built an admin-consent flow so a tenant administrator could authorize all their organization's mailboxes at once, which converted what could have been 3,000 individual user re-auth requests into about 90 admin approvals.",
      ],
      results: [
        "Email sync latency dropped from up to 15 minutes to under 5 seconds median, under 12 seconds p99.",
        "Outbound Graph/IMAP call volume fell roughly 70% while message throughput grew to 250k messages per day.",
        "Zero confirmed lost messages after full rollout, verified by the reconciliation layer across 18 months of operation.",
        "Silent sync failures went from the top support category for the email feature to zero recorded incidents.",
        "Completed migration off basic-auth IMAP five weeks ahead of Microsoft's deprecation deadline.",
        "Timeline feature engagement rose 45% as reps started trusting its freshness.",
      ],
      lessonsLearned: [
        "Webhooks are a latency optimization, never a source of truth; always pair them with a pull-based reconciliation loop.",
        "Spike on failure modes before designing, third-party API docs describe the happy path, production teaches you everything else.",
        "Subscription and token lifecycle deserve the same monitoring rigor as request paths; most integration outages are lifecycle bugs.",
        "Admin-consent flows are a massive UX and migration lever for B2B integrations; invest in them early.",
      ],
      futureImprovements: [
        "Extend the same architecture to calendar and contact sync, reusing the subscription manager and reconciliation engine.",
        "Add Google Workspace support behind the same internal sync interface to make provider choice invisible to product code.",
        "Move webhook receivers to Azure Functions for scale-to-zero economics on the spiky notification traffic.",
        "Use message classification to auto-file support-related emails to the ticketing integration.",
      ],
    },
    diagramId: "msgraph-integration",
  },

  // -------------------------------------------------------------------------
  // 5. AI Document Processing Pipeline
  // -------------------------------------------------------------------------
  {
    slug: "ai-document-processing-pipeline",
    title: "AI Document Processing Pipeline",
    tagline:
      "LLM-powered extraction pipeline turning ~40k unstructured property and legal documents per month into validated structured data with human review only on low confidence.",
    category: "AI & ML",
    featured: true,
    year: "2024",
    role: "Lead AI Engineer",
    stack: [
      "Python",
      "OpenAI",
      "LangGraph",
      "PostgreSQL",
      "pgvector",
      "Redis",
      "AWS",
      "Docker",
      "OpenTelemetry",
      "REST",
    ],
    metrics: [
      { label: "Documents processed", value: "40k/mo" },
      { label: "Manual effort", value: "-62%" },
      { label: "Field-level accuracy", value: "98.1%" },
      { label: "Cost per document", value: "$0.04" },
    ],
    sections: {
      businessProblem: [
        "Operations teams manually keyed data from leases, inspection reports, insurance certificates, and compliance documents into the platform, roughly 40k documents a month across customers, at an average of 9 minutes per document. Data entry errors on financial fields like rent amounts and bond values caused downstream accounting corrections, and onboarding a new customer's historical document archive took weeks of temp labor.",
        "Traditional template-based OCR extraction had been tried and failed: document layouts varied wildly across thousands of agencies, property managers, and insurers, and template maintenance became its own full-time job. The business case was straightforward, cut manual keying dramatically, but the hard requirement was trust: wrong data written confidently is worse than no automation, so the system had to know when it was unsure.",
      ],
      architecture: [
        "I designed a multi-stage pipeline orchestrated with LangGraph. Documents entered via API or email ingestion, went through preprocessing (OCR for scans, layout-aware text extraction for digital PDFs), then a classification stage routed each document to a type-specific extraction graph. Extraction used OpenAI models with structured output schemas per document type, followed by a deterministic validation stage checking cross-field consistency, date sanity, and financial arithmetic.",
        "The confidence system was the architectural centerpiece. Every extracted field carried a confidence score derived from model log-probabilities, validation outcomes, and agreement between a fast primary extraction and a cheap verification pass. Documents where all critical fields cleared threshold flowed straight through; anything below routed to a human review UI showing the source region alongside the extracted value for one-click confirm or correct.",
        "Corrections fed a feedback store that served two purposes: few-shot example retrieval via pgvector, similar previously-corrected documents were embedded and injected into prompts for hard cases, and a weekly evaluation harness that scored pipeline versions against a growing golden dataset before any prompt or model change shipped.",
      ],
      systemDesign: [
        "Type-specific extraction graphs behind a common interface, so adding a new document type meant a new schema and prompt set, not pipeline surgery.",
        "Confidence-gated human-in-the-loop: 78% of documents fully automated, 22% routed to review, with the threshold tunable per field criticality.",
        "Deterministic validation layer (cross-field checks, arithmetic, date logic) catching LLM plausible-nonsense errors that no confidence score would flag.",
        "pgvector-backed retrieval of similar corrected examples for dynamic few-shot prompting, lifting accuracy on rare layouts.",
        "Golden-dataset evaluation harness in CI, blocking any prompt or model change that regressed field accuracy.",
        "Queue-based processing with per-customer fairness lanes, so one customer's 10k-document backfill never delayed another's daily flow.",
      ],
      responsibilities: [
        "Owned the pipeline architecture and led a team of three engineers building it.",
        "Designed the confidence scoring model and tuned automation/review thresholds jointly with operations leadership against an agreed error budget.",
        "Built the LangGraph orchestration, the structured-output extraction stages, and the validation rule engine.",
        "Created the evaluation harness and golden dataset workflow that made prompt changes safe to ship weekly.",
        "Implemented cost controls: model tiering, prompt caching, and batch processing that held unit cost at $0.04 per document.",
        "Instrumented the pipeline with OpenTelemetry traces spanning ingestion to database write, making per-stage latency and failure attribution routine.",
      ],
      challenges: [
        {
          title: "Confidently wrong extractions",
          description:
            "The dangerous failure was not a refusal but a plausible wrong number, a rent of $2,450 extracted as $2,540. Log-prob confidence alone missed many of these. Layering deterministic cross-field validation (rent times frequency matching annual figures, dates ordering correctly) plus a cheap second-model agreement check cut undetected critical-field errors to under 0.2%.",
        },
        {
          title: "Long documents versus context limits",
          description:
            "Eighty-page leases exceeded practical context budgets and degraded extraction focus. A retrieval step first located candidate sections per field group using embeddings over document chunks, then extraction ran per section. Accuracy on long documents rose 11 points and token cost per document fell by half.",
        },
        {
          title: "Evaluation before automation trust",
          description:
            "Operations would not turn off manual keying based on a demo. We ran the pipeline in shadow mode against live manual entry for six weeks, building both the golden dataset and a defensible accuracy report per field per document type. The threshold negotiation that followed was grounded in that data, not vibes.",
        },
      ],
      implementation: [
        "The first month was deliberately unglamorous: ingestion, OCR normalization, and a rock-solid document store with immutable originals and versioned extraction results. Every later capability leaned on being able to reprocess any document against any pipeline version and diff the outcomes.",
        "Extraction prompts were treated as versioned artifacts with the same review discipline as code. Each document type had a schema, a prompt, and a test suite of golden documents; CI ran the full evaluation on every change and published an accuracy diff to the PR. This is what made weekly iteration safe, and it caught two would-be regressions from model version upgrades.",
        "The review UI mattered as much as the models. Reviewers saw the source page region highlighted next to each low-confidence field, corrected in place, and their throughput hit 45 seconds per document versus 9 minutes for full manual entry. Corrections flowed back automatically into the few-shot retrieval store, so the system measurably improved on exactly the layouts it had been weakest on.",
      ],
      results: [
        "Automated 78% of ~40k monthly documents end to end; overall manual effort down 62% accounting for review time.",
        "Field-level accuracy of 98.1% on critical fields, with undetected error rate under 0.2% verified by ongoing sampled audits.",
        "Customer historical-archive onboarding dropped from 3-4 weeks of temp labor to 2-3 days of pipeline time plus review.",
        "Unit cost held at $0.04 per document through model tiering and section-targeted extraction.",
        "Review throughput of 45 seconds per flagged document, a 12x improvement over full manual keying.",
        "Six new document types added by a single engineer each in under a week, validating the extensibility bet.",
      ],
      lessonsLearned: [
        "In extraction systems, calibrated uncertainty is the product; raw accuracy is table stakes.",
        "Deterministic validation catches the LLM errors that statistical confidence never will; always layer both.",
        "An evaluation harness wired into CI is the single highest-leverage investment in any LLM system, it converts prompt engineering from art to engineering.",
        "Shadow mode against the existing human process buys organizational trust that no benchmark can.",
        "Design the correction feedback loop on day one; it is the moat that makes the system better every week.",
      ],
      futureImprovements: [
        "Fine-tune a smaller model on the accumulated corrected dataset to cut cost and latency on the five highest-volume document types.",
        "Add table-structure-aware extraction for financial schedules, the current weakest document class.",
        "Active-learning review routing that prioritizes documents whose corrections would most improve the model, not just lowest confidence.",
        "Expose extraction-as-an-API for customers to push documents programmatically with webhook results.",
      ],
    },
    diagramId: "rag-pipeline",
  },

  // -------------------------------------------------------------------------
  // 6. Lead Analytics Dashboard
  // -------------------------------------------------------------------------
  {
    slug: "lead-analytics-dashboard",
    title: "Lead Analytics Dashboard",
    tagline:
      "Real-time lead attribution and funnel analytics ingesting 500k events per day from web, phone, and portal sources into sub-second dashboards.",
    category: "Data & Analytics",
    featured: false,
    year: "2018",
    role: "Senior Full-Stack Engineer",
    stack: [
      "PHP",
      "Laravel",
      "Vue.js",
      "MySQL",
      "Redis",
      "AWS",
      "Google APIs",
      "REST",
    ],
    metrics: [
      { label: "Events ingested", value: "500k/day" },
      { label: "Dashboard load", value: "<800 ms" },
      { label: "Attribution coverage", value: "92%" },
      { label: "Report gen time", value: "45 min → 3 s" },
    ],
    sections: {
      businessProblem: [
        "Marketing teams at client agencies spent money across Google Ads, listing portals, social campaigns, and phone tracking numbers, but lead attribution lived in four disconnected tools and a monthly spreadsheet exercise. Producing a single campaign ROI report took an analyst around 45 minutes per agency, and by the time it existed the spend decisions it should have informed were already made.",
        "The product opportunity was a live attribution dashboard inside the platform agencies already used. The engineering problem was that lead events arrived from wildly heterogeneous sources, webhook bursts from portals, call-tracking posts, form submissions, and Google Ads API pulls, at around 500k events per day across tenants, and the dashboards had to aggregate them per campaign, per source, per agent, in under a second.",
      ],
      architecture: [
        "I built an ingestion tier where every source adapter normalized events into a common lead-event schema and dropped them onto Redis-backed queues. Workers deduplicated, resolved identity (matching a phone call to an earlier web enquiry from the same person), applied attribution rules, and wrote to MySQL. The write model was append-only events; the read model was a set of pre-aggregated rollup tables maintained incrementally by the same workers.",
        "The rollup design was the key decision. Instead of computing aggregates at query time, workers incremented per-tenant, per-campaign, per-day counters as events arrived. Dashboard queries became primary-key lookups over small rollup tables, which is how a shared MySQL instance served sub-second dashboards without exotic infrastructure. A nightly job recomputed rollups from the event log to correct any drift, keeping the fast path honest.",
        "The Vue.js dashboard polled a lightweight summary endpoint every 30 seconds for the live view and hit the rollup API for drill-downs. Attribution rules, first-touch, last-touch, and a configurable weighted model, were applied at ingestion with results stored per event, so switching a report between models was a column choice rather than a recomputation.",
      ],
      systemDesign: [
        "Source-adapter pattern with a normalized event schema, making each new lead source an isolated adapter rather than a pipeline change.",
        "Append-only event log as truth with incrementally maintained rollup tables as the read model, a pragmatic CQRS on plain MySQL.",
        "Identity resolution window matching calls, forms, and portal enquiries into a single lead journey using phone, email, and click-ID signals.",
        "All attribution models computed at ingestion and stored, trading cheap storage for instant model switching in reports.",
        "Nightly rollup reconciliation from the event log, bounding any incremental-update drift to 24 hours.",
        "Burst absorption via queue buffering sized for portal webhook storms of 50x average rate.",
      ],
      responsibilities: [
        "Designed and built the full pipeline: source adapters, normalization, identity resolution, attribution engine, and rollup maintenance.",
        "Built the Google Ads and call-tracking integrations, including OAuth flows and quota-aware API polling.",
        "Developed the Vue.js dashboard with the product designer, iterating directly with three pilot agencies.",
        "Defined the attribution rule engine with marketing domain input, and documented model behavior for customer-facing teams.",
        "Load-tested ingestion against recorded portal burst traffic and tuned queue and worker sizing.",
        "Operated the pipeline in production and built the drift-reconciliation tooling after the first counter-skew incident.",
      ],
      challenges: [
        {
          title: "Cross-channel identity resolution",
          description:
            "A phone call 20 minutes after a web enquiry is usually the same person, but naive matching created false merges that corrupted funnels. I implemented tiered matching, exact identifiers first, then time-windowed fuzzy signals with a confidence floor, and made merges reversible with an audit trail. False-merge complaints stopped while attribution coverage held at 92%.",
        },
        {
          title: "Portal webhook storms",
          description:
            "Listing portals batched their webhook deliveries, producing bursts of 30-50k events in a few minutes against a 6-event-per-second average. Queue buffering with backpressure-aware workers absorbed bursts without dashboard staleness exceeding a couple of minutes, and without provisioning for peak permanently.",
        },
        {
          title: "Rollup drift",
          description:
            "Incrementally maintained counters inevitably drifted after worker crashes mid-batch. Rather than pursuing perfect exactly-once semantics on 2018-era infrastructure, I made the nightly full recomputation authoritative and surfaced a data-freshness indicator in the UI. Honest and simple beat theoretically pure.",
        },
      ],
      implementation: [
        "The first adapter, web forms, went end to end in two weeks to validate the schema and rollup approach with a pilot agency before generalizing. Each subsequent source followed the adapter contract: authenticate, fetch or receive, normalize, emit. The Google Ads adapter was the hardest, mostly due to API quota management across dozens of connected customer accounts.",
        "Identity resolution shipped deliberately late, after two months of collecting raw events, because designing matching rules against real data beat designing them against assumptions. The observed patterns (portal enquiries followed by calls within 30 minutes dominated) directly shaped the matching windows.",
        "The dashboard went through weekly iteration with pilot agencies. The most-used feature ended up being one we almost did not build: a per-agent response-time leaderboard, which agencies used to drive a measurable drop in lead response times and which became a selling point in demos.",
      ],
      results: [
        "Campaign ROI reporting went from a 45-minute manual analyst exercise to a 3-second dashboard load.",
        "92% of leads automatically attributed to a source and campaign across web, phone, and portal channels.",
        "Pipeline sustained 500k events per day with p99 ingestion-to-dashboard latency under 2 minutes even during portal bursts.",
        "Pilot agencies cut median lead response time from 42 minutes to 11 minutes using the response leaderboard.",
        "Feature became part of the platform's top subscription tier and was cited in 14 competitive wins during the following year.",
        "Zero additional infrastructure beyond existing MySQL and Redis; the rollup design kept incremental cost near zero.",
      ],
      lessonsLearned: [
        "Pre-aggregated read models on boring infrastructure outperform clever query-time solutions for dashboard workloads at this scale.",
        "Collect real event data before designing identity resolution; the actual patterns will surprise you and simplify the rules.",
        "A visible data-freshness indicator buys more user trust than invisible engineering heroics chasing perfect consistency.",
        "The feature users love most often falls out of the data you already have; leave room for cheap experiments.",
      ],
      futureImprovements: [
        "Migrate the event log to a columnar store to enable ad-hoc historical analysis beyond the pre-built rollups.",
        "Add multi-touch attribution with configurable decay curves now that per-event model storage has proven out.",
        "Stream dashboard updates over WebSockets instead of 30-second polling.",
        "Anomaly detection alerts on campaign metrics, flagging spend spikes and conversion drops without waiting for a human to look.",
      ],
    },
    diagramId: "message-queue",
  },

  // -------------------------------------------------------------------------
  // 7. Workflow Automation Platform
  // -------------------------------------------------------------------------
  {
    slug: "workflow-automation-platform",
    title: "Workflow Automation Platform",
    tagline:
      "No-code workflow engine executing 2M+ automation runs per month across 40+ trigger and action types, built for non-technical operations users.",
    category: "Platform Engineering",
    featured: true,
    year: "2022",
    role: "Staff-level Tech Lead",
    stack: [
      "PHP",
      "Laravel",
      "Node.js",
      "Vue.js",
      "MySQL",
      "Redis",
      "AWS",
      "Docker",
      "SendGrid",
      "REST",
    ],
    metrics: [
      { label: "Workflow runs", value: "2M+/mo" },
      { label: "Trigger-to-action p95", value: "4.2 s" },
      { label: "Action types", value: "40+" },
      { label: "Support automations", value: "-55% tickets" },
    ],
    sections: {
      businessProblem: [
        "Every sizable customer wanted slightly different process automation: notify the owner when an inspection is overdue, escalate maintenance jobs stuck in quote for 5 days, send a review request 3 days after move-in. Engineering was drowning in these as bespoke feature requests, with a backlog of 200+ automation asks and a six-month wait that was cited in churn interviews.",
        "The bet was a no-code workflow builder: triggers from platform events, conditional logic, delays, and actions like emails, SMS, task creation, and webhooks, composable by an operations manager rather than an engineer. The engineering challenge was execution semantics: workflows with multi-day delays had to survive deploys and infrastructure changes, actions had to not double-fire, and a customer building an accidental infinite loop could not take down the platform.",
      ],
      architecture: [
        "I designed the engine around durable workflow runs stored in MySQL, with Redis queues driving execution. Each run was a state machine: it advanced step by step, persisting state before every side effect, so a worker crash or deploy mid-run resumed exactly where it left off. Delays were not sleeping processes but persisted wake-up times scanned by a scheduler, which is what let runs span weeks across hundreds of deploys.",
        "Triggers came from the platform's existing domain events. A trigger-matching service evaluated event streams against active workflow subscriptions, tens of thousands of workflows across tenants, using an inverted index on event type and tenant so matching stayed O(relevant workflows) rather than O(all workflows). Matched events spawned runs onto per-tenant fair-share queues.",
        "Actions executed through an adapter layer with per-action idempotency keys, timeout budgets, and retry policies. Every external effect (email via SendGrid, SMS, webhooks to customer systems) recorded an outcome, and the run timeline UI showed users exactly what happened at each step, which turned out to be as important as the execution engine itself for trust and self-service debugging.",
      ],
      systemDesign: [
        "State-persisted-before-side-effect execution, making every run resumable across crashes and deploys with at-least-once step processing plus idempotent actions.",
        "Persisted wake-up scheduling for delays, supporting multi-week waits with no live process and a scan cost independent of how many runs are sleeping.",
        "Inverted-index trigger matching keeping event evaluation fast as workflow count grew past 30k active definitions.",
        "Loop and runaway protection: per-workflow run-rate budgets, cycle detection on workflow graphs at save time, and a circuit breaker that pauses a workflow after anomalous firing with owner notification.",
        "Per-tenant fair-share execution queues so one tenant's 100k-run burst never delayed another tenant's time-sensitive automation.",
        "Versioned workflow definitions: in-flight runs complete on the version they started with, edits apply to new runs only, eliminating a whole category of mid-run mutation bugs.",
      ],
      responsibilities: [
        "Led the four-engineer team; owned the execution engine design and wrote its core state machine and scheduler myself.",
        "Designed the workflow definition model and versioning semantics with the product team.",
        "Built the trigger-matching service and its inverted-index subscription store.",
        "Defined the action adapter contract and reviewed all 40+ adapter implementations for idempotency and timeout compliance.",
        "Designed the abuse and runaway protections after red-teaming the builder with deliberately hostile workflow constructions.",
        "Established the load-testing regime that replayed production event traffic at 10x against a staging tenant set before each release.",
      ],
      challenges: [
        {
          title: "Exactly-once effects on at-least-once infrastructure",
          description:
            "Queues deliver at least once, and customers will not accept a tenant getting two rent-reminder SMS messages. Every action executes with a deterministic idempotency key derived from run ID and step ID, checked at the adapter layer before any external call. Duplicate side effects dropped to zero measured against SendGrid and SMS provider delivery logs.",
        },
        {
          title: "Customer-built infinite loops",
          description:
            "A workflow that fires on record update and then updates that record is one checkbox away from a self-sustaining storm. Save-time cycle detection catches direct loops; the runtime rate circuit breaker catches indirect ones spanning multiple workflows. In the first year the breaker fired 60+ times, each one a platform incident that did not happen.",
        },
        {
          title: "Long-running runs versus schema evolution",
          description:
            "Runs sleeping for 30 days would wake into a world where the workflow, or the engine, had changed. Definition versioning solved the former. For the latter, engine state was serialized in a versioned envelope with explicit migration functions, tested by replaying a corpus of captured in-flight run states against every engine change in CI.",
        },
      ],
      implementation: [
        "We built the engine before the builder UI, driving it with hand-written JSON definitions for six internal use cases. Proving execution semantics, resumability, idempotency, delay correctness, against real usage first meant the UI team built on solid ground and the engine API barely changed afterwards.",
        "The action adapter contract was deliberately strict: declared timeout, declared idempotency mechanism, structured outcome reporting, no exceptions crossing the boundary. Strictness paid compound interest, 40+ adapters written by multiple teams over two years and none of them ever destabilized the engine.",
        "Launch was gated behind a template library rather than a blank canvas. Twenty pre-built workflows covering the most-requested automations gave customers working starting points, drove 3x higher activation than blank-canvas beta cohorts, and taught users the mental model before they built from scratch.",
      ],
      results: [
        "2M+ workflow runs per month within a year of launch, across 30k+ active workflow definitions.",
        "Automation feature-request backlog (200+ items) effectively dissolved; 85% of the requests were satisfiable by customers self-serving.",
        "Trigger-to-first-action p95 of 4.2 seconds for immediate workflows; delay wake-up accuracy within 30 seconds of scheduled time.",
        "Zero duplicate external side effects measured over 18 months against provider delivery logs.",
        "Customers citing automation in retention interviews rose to 40%; the feature anchored the top pricing tier.",
        "Support tickets for the automated process categories fell 55% as customers debugged their own workflows via the run timeline.",
      ],
      lessonsLearned: [
        "Build and prove the execution engine against real use cases before the visual builder; semantics are harder to change than UI.",
        "Idempotency belongs in the platform contract, not in each integration author's memory.",
        "Users trust automation they can inspect; the run timeline was as valuable as the engine underneath it.",
        "Templates beat blank canvases for activation in any builder product.",
        "Design for the hostile customer configuration on day one; the circuit breaker was the feature that let us sleep.",
      ],
      futureImprovements: [
        "Add an approval-step primitive so workflows can pause for human sign-off, the top post-launch request.",
        "Workflow analytics showing conversion through multi-step sequences, not just per-run outcomes.",
        "An LLM-assisted builder that drafts a workflow from a plain-language description of the desired process.",
        "Cross-tenant workflow sharing with a curated community template marketplace.",
      ],
    },
    diagramId: "event-driven",
  },

  // -------------------------------------------------------------------------
  // 8. Enterprise CRM Platform
  // -------------------------------------------------------------------------
  {
    slug: "enterprise-crm-platform",
    title: "Enterprise CRM Platform",
    tagline:
      "Ground-up CRM for real estate sales teams: pipeline management, communications, and reporting for 5,000+ daily active agents across 300 offices.",
    category: "Enterprise SaaS",
    featured: true,
    year: "2020",
    role: "Lead Backend Engineer",
    stack: [
      "PHP",
      "Laravel",
      "Vue.js",
      "MySQL",
      "Redis",
      "AWS",
      "Docker",
      "SendGrid",
      "Stripe",
      "REST",
    ],
    metrics: [
      { label: "Daily active agents", value: "5,000+" },
      { label: "Contacts managed", value: "12M" },
      { label: "p95 search latency", value: "120 ms" },
      { label: "Data migration", value: "300 offices, 0 loss" },
    ],
    sections: {
      businessProblem: [
        "The company's legacy CRM was a decade-old desktop-era product losing deals to modern cloud competitors. Agents lived on their phones between inspections and open homes, but the old system had no usable mobile experience, search that took 4-6 seconds over a few hundred thousand contacts, and no connection to the email and calendar tools agents actually used. Churn among sub-50-seat customers was accelerating quarter over quarter.",
        "Leadership committed to a ground-up rebuild: a cloud CRM handling 12M contacts across 300 offices, fast search, live pipeline boards, and integrated communications. The non-negotiable constraint was migration: 300 offices of live business data, contact histories going back 15 years, had to move without loss and without any office losing more than one weekend of access. A botched migration would have been an extinction-level event for customer trust.",
      ],
      architecture: [
        "I led the backend design: a modular Laravel application, deliberately not microservices at this stage, with hard module boundaries (contacts, pipeline, communications, reporting) enforced through internal contracts, giving us extraction options later without paying distributed-systems tax on day one. MySQL was the system of record with read replicas; Redis handled sessions, caching, and queues.",
        "Search was its own subsystem: a denormalized search index maintained by queue workers consuming entity-change events, supporting prefix, fuzzy, and phone-number-shaped matching over 12M contacts at 120 ms p95. Contact timelines, every call, email, SMS, note, and inspection against a contact, used an append-only activity stream per contact, which made the highest-read surface in the product cheap to render and trivially cacheable.",
        "Communications integrated SendGrid for tracked email and a telephony provider for click-to-call with recording, all writing back into the activity stream. The Vue.js SPA consumed a versioned REST API designed API-first, which let the mobile web experience and two early integration partners build against stable contracts while the UI was still evolving.",
      ],
      systemDesign: [
        "Modular monolith with contract-enforced module boundaries, chosen deliberately over microservices for a small team, with extraction seams documented for the future.",
        "Denormalized, event-maintained search index delivering 120 ms p95 across 12M contacts, including phone-number and fuzzy-name matching tuned for real agent query patterns.",
        "Append-only per-contact activity streams making timeline reads O(one range scan) and enabling aggressive caching of the hottest product surface.",
        "Office-level data partitioning with row-level scoping, matching the real permission model of franchise groups sharing some data and isolating the rest.",
        "Migration pipeline as a first-class product: repeatable per-office ETL with validation gates, dry runs, and automated rollback.",
        "Read-replica routing for reporting so end-of-quarter analytics never touched the primary serving agent traffic.",
      ],
      responsibilities: [
        "Led backend architecture and a team of six engineers from first commit through GA and the full migration program.",
        "Designed the data model, module boundaries, and the versioned API-first contracts consumed by web, mobile, and partners.",
        "Built the search subsystem personally after the first prototype missed latency targets by an order of magnitude.",
        "Owned the migration pipeline: per-office ETL, the validation gate suite, and the cutover runbook executed 300 times.",
        "Ran capacity planning and load testing against modelled Monday-morning peak traffic (agents syncing after weekend opens).",
        "Interviewed agents in the field quarterly, which repeatedly reshaped backend priorities, notably the phone-number search work.",
      ],
      challenges: [
        {
          title: "Migrating 300 offices without losing trust",
          description:
            "Each office had 15 years of quirky data in the legacy system. The migration pipeline ran a validation suite of 200+ checks (record counts, relationship integrity, financial totals, sampled deep comparisons) and any failure blocked cutover automatically. We ran every office as a dry run first. Across 300 production migrations we hit zero data-loss incidents and only three cutovers needed rollback and re-run.",
        },
        {
          title: "Search that matches how agents think",
          description:
            "Agents search by fragments: half a phone number, a misspelled surname, 'the buyer from the Smith St open'. Generic full-text search scored poorly on all of these. I built a purpose-tuned index with normalized phone n-grams, name phonetics, and recency weighting, validated against a corpus of real (anonymized) legacy search logs. Search success rate in usability tests went from 61% to 94%.",
        },
        {
          title: "Monday-morning thundering herd",
          description:
            "Traffic showed 6x spikes Monday 8-10 am as offices synced weekend activity. Rather than provisioning for peak, we combined queue-deferred non-critical writes, pre-warmed caches from predicted-active contact sets, and autoscaled read replicas on a schedule. Peak p95 held within 15% of off-peak.",
        },
      ],
      implementation: [
        "The first six months built the contact and pipeline core against a single pilot office running their real business on it, brutal but invaluable. Weekly sessions watching agents work exposed assumptions no spec review would have caught, including that phone-fragment search mattered more than any feature on our roadmap.",
        "The migration program treated ETL as a product with its own roadmap. Legacy data required 40+ documented cleansing rules developed iteratively across dry runs. Office cutovers ran Friday night to Sunday, with the validation gate deciding go/no-go automatically and a support bridge on Monday morning. By office 50 the process was so routine we ran 12 per weekend.",
        "Post-GA, performance work was continuous and data-driven: every endpoint carried latency budgets in monitoring, and the weekly performance review picked the worst offender. That cadence, more than any single optimization, is what kept p95s flat while contact volume grew 4x over two years.",
      ],
      results: [
        "Migrated all 300 offices in 14 months with zero data-loss incidents and 97% of cutovers completing inside the weekend window.",
        "Contact search p95 of 120 ms across 12M contacts, versus 4-6 seconds in the legacy system.",
        "5,000+ daily active agents within a year of GA, with mobile web sessions representing 55% of usage.",
        "Sub-50-seat customer churn reversed from accelerating to a 30% year-over-year reduction.",
        "Platform absorbed 6x Monday-morning traffic spikes with p95 degradation held under 15%.",
        "API-first design enabled two integration partners to launch alongside GA, an outcome that took the legacy product a decade not to achieve.",
      ],
      lessonsLearned: [
        "A modular monolith with enforced boundaries was the right call for the team size; we got the structure of services without the operational tax.",
        "Migration is a product, not a task; the validation gate and dry-run discipline are what made 300 cutovers boring.",
        "Watch real users work before optimizing anything; phone-fragment search was invisible in specs and decisive in adoption.",
        "Scheduled, predictable load (Monday mornings) rewards scheduled, predictable scaling far more than reactive autoscaling.",
      ],
      futureImprovements: [
        "Extract the search subsystem to a dedicated service as the first proof of the documented module seams.",
        "Native mobile apps with offline contact access for agents at inspections in poor-coverage areas.",
        "Lead-scoring models over the activity stream data to prioritize agent follow-ups.",
        "GraphQL gateway for integration partners who repeatedly request more flexible querying than the REST resources offer.",
      ],
    },
    diagramId: "crm-architecture",
  },

  // -------------------------------------------------------------------------
  // 9. AI Knowledge Assistant
  // -------------------------------------------------------------------------
  {
    slug: "ai-knowledge-assistant",
    title: "AI Knowledge Assistant",
    tagline:
      "RAG-based assistant answering staff questions over 60k internal documents with cited, permission-aware answers, deflecting 35% of internal support load.",
    category: "AI & ML",
    featured: true,
    year: "2025",
    role: "Lead AI Engineer",
    stack: [
      "Python",
      "LangGraph",
      "OpenAI",
      "Qdrant",
      "PostgreSQL",
      "Redis",
      "Next.js",
      "TypeScript",
      "Kubernetes",
      "OpenTelemetry",
    ],
    metrics: [
      { label: "Documents indexed", value: "60k" },
      { label: "Queries served", value: "9k/week" },
      { label: "Answer groundedness", value: "96%" },
      { label: "Support deflection", value: "35%" },
    ],
    sections: {
      businessProblem: [
        "A 1,400-person company had institutional knowledge scattered across a wiki, SharePoint, policy PDFs, product docs, and years of resolved support tickets, around 60k documents in total. Staff either interrupted senior colleagues or filed internal tickets; the internal support team spent an estimated 40% of its time answering questions whose answers already existed somewhere. New-hire ramp time was heavily gated on 'knowing who to ask'.",
        "An off-the-shelf chatbot pilot had failed for two reasons that defined our requirements: it hallucinated policy answers with confident wording, unacceptable when the question is about leave entitlements or security procedure, and it ignored document permissions, happily quoting an executive-only document to anyone. The system had to cite real sources for every claim, respect per-user access at retrieval time, and say 'I do not know' when the corpus did not contain the answer.",
      ],
      architecture: [
        "I built the assistant as a LangGraph agent over a retrieval stack designed permission-first. Documents synced from each source system with their ACLs; chunks were stored in Qdrant with permission metadata, and every retrieval query filtered by the requesting user's resolved group memberships before similarity ranking, so an unauthorized chunk was never even a candidate. Permission filtering at retrieval, not at generation, was the load-bearing decision.",
        "The answer pipeline separated retrieval, synthesis, and verification. A query-planning step decomposed compound questions and rewrote follow-ups using conversation context; hybrid retrieval combined dense vectors with keyword search and a reranker. Synthesis generated answers with inline citations bound to specific chunks, and a verification pass checked each claim against its cited chunk, unsupported claims were removed or the answer downgraded to 'not found in the knowledge base' with suggested contacts.",
        "Every answer shipped with clickable citations opening the source at the relevant section. Feedback (thumbs plus optional correction) flowed into an evaluation set, and a weekly retrieval-quality report drove chunking and reranking tuning. The whole pipeline was traced with OpenTelemetry so any bad answer could be replayed step by step, retrieval candidates, rerank scores, synthesis inputs, verification verdicts.",
      ],
      systemDesign: [
        "Permission filtering applied at retrieval time via ACL metadata in Qdrant, structurally preventing unauthorized content from entering any prompt.",
        "Verification pass binding every claim to a cited chunk, with unsupported claims stripped; groundedness held at 96% on the audited sample.",
        "Hybrid dense-plus-keyword retrieval with reranking, chosen after evaluation showed pure vector search missed exact-term policy queries (form names, system codes) badly.",
        "Explicit 'not found' behavior with routing to the right human team, treated as a first-class answer type rather than a failure.",
        "Incremental source-sync pipeline keeping index freshness under 15 minutes for wiki and ticket updates, with ACL changes propagating on the same path.",
        "Full-pipeline tracing enabling step-level replay of any answer for debugging and audit.",
      ],
      responsibilities: [
        "Owned architecture and led two engineers; built the retrieval stack and verification pipeline personally.",
        "Designed the permission model mapping four source systems' ACL semantics onto a single retrieval-time filter representation.",
        "Built source connectors and the incremental sync pipeline with ACL propagation.",
        "Created the evaluation framework: a 500-question golden set with per-question expected sources, run against every pipeline change in CI.",
        "Ran the security review with the infosec team, including red-team sessions attempting permission bypass via prompt manipulation.",
        "Drove the phased rollout from a 50-person pilot to company-wide availability, including the feedback triage process.",
      ],
      challenges: [
        {
          title: "Four incompatible permission models",
          description:
            "SharePoint, the wiki, the ticket system, and the policy repository each expressed access differently (groups, page inheritance, role tiers, ad hoc shares). I designed a normalized ACL representation with per-source resolvers, synced group membership on a 10-minute cycle, and defaulted to deny on any resolution ambiguity. Red-team sessions produced zero unauthorized retrievals across 200+ bypass attempts.",
        },
        {
          title: "Hallucination on policy questions",
          description:
            "Synthesis occasionally blended two similar policies into a plausible hybrid, the exact failure that killed the previous pilot. The claim-level verification pass, checking each sentence against its cited chunk with a cheap model, plus a rule that policy-category answers must quote rather than paraphrase entitlement numbers, cut audited hallucination below 1% of answers.",
        },
        {
          title: "Stale knowledge with real consequences",
          description:
            "An answer citing a superseded travel policy is worse than no answer. Document-level supersession tracking (new versions demote old chunks), freshness indicators on every citation, and index freshness under 15 minutes addressed the mechanical side; a monthly stale-content report to document owners addressed the human side.",
        },
      ],
      implementation: [
        "The first two months went into the evaluation set and retrieval quality before any chat UI existed. A 500-question golden set, built with the internal support team from real ticket history, exposed that naive chunking destroyed policy tables and that pure vector search failed exact-code lookups, both fixed before they could become production incidents. Every subsequent change ran against this set in CI with retrieval and groundedness metrics on the PR.",
        "The pilot with 50 support-heavy staff ran six weeks with every answer audited. The audit process directly produced the verification pass design: we categorized every bad answer and found most traced to retrieval gaps, not generation, which redirected effort toward hybrid search and reranking rather than prompt tuning. Groundedness rose from 83% to 96% over the pilot.",
        "Company rollout was deliberately unglamorous: a Next.js chat interface, a Slack entry point, and answer quality that had already been proven. Adoption grew on internal word of mouth to 9k queries a week within four months. The weekly feedback triage, 30 minutes with support leads reviewing flagged answers, remains the engine of continuous quality improvement.",
      ],
      results: [
        "35% of previously ticketed internal questions deflected to self-service answers within four months of company-wide launch.",
        "96% answer groundedness and under 1% audited hallucination rate, sustained across weekly quality reviews.",
        "9k queries per week from 1,100 monthly active staff, with 82% positive feedback rate.",
        "Zero permission violations in production and in 200+ red-team bypass attempts.",
        "New-hire ramp surveys showed 'finding how things work' scores improving 28 points; the assistant became part of onboarding by default.",
        "Internal support team reallocated roughly two full-time-equivalents from repetitive Q&A to process improvement work.",
      ],
      lessonsLearned: [
        "Build the evaluation set before the product; every architectural argument afterwards gets settled by numbers instead of opinions.",
        "Permission enforcement belongs at retrieval, structurally, not at generation, behaviorally; the model should never see what the user cannot.",
        "Most 'hallucination' problems in RAG are retrieval problems wearing a generation costume; fix retrieval first.",
        "'I do not know, ask this team' is a feature that builds more trust than a marginal increase in answer coverage.",
        "A standing human feedback loop with the domain team beats any amount of offline benchmark chasing.",
      ],
      futureImprovements: [
        "Agentic multi-step retrieval for questions requiring synthesis across many documents, such as policy comparisons.",
        "Proactive stale-answer detection: re-run popular historical queries when their cited sources change and notify prior askers of updates.",
        "Structured action execution, letting the assistant file the correct request form, not just link to it, with human confirmation.",
        "Per-team fine-tuned retrieval profiles, since engineering and HR queries show measurably different retrieval characteristics.",
      ],
    },
    diagramId: "ai-agent-workflow",
  },

  // -------------------------------------------------------------------------
  // 10. Enterprise Integration Hub
  // -------------------------------------------------------------------------
  {
    slug: "enterprise-integration-hub",
    title: "Enterprise Integration Hub",
    tagline:
      "Unified integration platform connecting the core product to 25+ external systems through one gateway: managed auth, rate limiting, retries, and observability.",
    category: "Integrations",
    featured: false,
    year: "2023",
    role: "Solution Architect & Senior Engineer",
    stack: [
      "Node.js",
      "TypeScript",
      "Go",
      "PostgreSQL",
      "Redis",
      "Kubernetes",
      "Terraform",
      "OAuth2",
      "OpenTelemetry",
      "Grafana",
    ],
    metrics: [
      { label: "Connected systems", value: "25+" },
      { label: "API calls proxied", value: "6M/day" },
      { label: "Integration build time", value: "6 wk → 4 days" },
      { label: "Integration incidents", value: "-73%" },
    ],
    sections: {
      businessProblem: [
        "Over eight years, the platform had accumulated integrations with accounting packages, listing portals, payment providers, e-signature services, and communication tools, 25+ external systems, each built ad hoc by whichever team needed it. Auth handling, retry logic, rate limiting, and error reporting were reimplemented differently every time, with predictably different bugs. Integration failures were the largest incident category, and every third-party outage or API change became a multi-team fire drill.",
        "The cost showed up in two ways: new integrations took roughly six weeks each because every one restarted from zero, and operational load kept climbing because 25 bespoke implementations meant 25 distinct failure behaviors nobody fully knew. Product wanted to double the integration catalog; operations wanted the pager to stop. Both pointed at the same answer: a shared integration platform.",
      ],
      architecture: [
        "I designed a hub with three layers. An egress gateway (Go) fronted all outbound third-party traffic: centralized credential injection, per-provider rate limiting, circuit breaking, retries with budget-aware backoff, and uniform request/response logging. A connector runtime (Node.js/TypeScript) hosted per-provider connectors written against a strict SDK contract covering auth flows, pagination, webhook verification, and error taxonomy. A sync orchestration layer managed scheduled and event-driven data flows with cursor persistence and dead-letter handling.",
        "Credentials moved into a dedicated vault service handling OAuth2 flows, token refresh, and encryption, with connectors receiving short-lived injected tokens rather than storing anything. This retired eleven separate homegrown token-refresh implementations, three of which were found storing credentials with reversible encryption during the audit that preceded the migration.",
        "Observability was uniform by construction: every proxied call carried OpenTelemetry traces with provider, connector, and tenant attributes, feeding Grafana dashboards and per-provider SLO alerts. When a third party degraded, the on-call saw one dashboard telling them which provider, which tenants, and whether the circuit breaker had already contained it, instead of correlating five services' logs.",
      ],
      systemDesign: [
        "Single egress gateway giving one enforcement point for rate limits, retries, circuit breaking, and credential injection across all 25+ providers.",
        "Strict connector SDK contract (typed auth, pagination, webhook, and error interfaces) making connector quality a property of the platform rather than of each author.",
        "Centralized OAuth2 vault with short-lived token injection, eliminating credential storage from all connector code.",
        "Provider-level circuit breakers with tenant-visible status, converting third-party outages from platform incidents into communicated degradations.",
        "Cursor-persisted sync orchestration with idempotent upserts and dead-letter queues, making every data flow resumable and replayable.",
        "Uniform tracing and per-provider SLOs, so integration health became a dashboard instead of tribal knowledge.",
      ],
      responsibilities: [
        "Owned the hub architecture and the migration strategy for all existing integrations; led a team of five across two squads.",
        "Built the Go egress gateway, including the rate limiter and circuit-breaker implementations tuned per provider.",
        "Designed the connector SDK and wrote the first three connectors as reference implementations with an accompanying conformance test suite.",
        "Led the credential audit and the vault migration, coordinating disclosure and remediation for the weakly-encrypted credential findings.",
        "Defined the per-provider SLOs with operations and built the alerting that replaced ad hoc integration monitoring.",
        "Ran the 14-month migration of 25 legacy integrations, sequenced by incident frequency so the noisiest moved first.",
      ],
      challenges: [
        {
          title: "Migrating live integrations without data gaps",
          description:
            "Accounting and payment syncs could not miss records during cutover. Each migration ran old and new paths in parallel with a comparison harness diffing outputs for two weeks, then cut over with the legacy path in warm standby. Cursor handoff was rehearsed in staging with production-shaped data. All 25 migrations completed without a confirmed data gap.",
        },
        {
          title: "Rate limits shared by adversarial workloads",
          description:
            "A tenant's bulk historical sync and another tenant's real-time payment status check hit the same provider quota. The gateway implemented two-tier budgeting, a reserved interactive lane and a preemptible bulk lane per provider, so latency-sensitive calls never queued behind backfills. Interactive p95 through the gateway stayed under 40 ms of added overhead.",
        },
        {
          title: "25 different error vocabularies",
          description:
            "Every provider fails differently, and the old integrations surfaced raw provider errors to users. The SDK enforced mapping into a common taxonomy (auth-expired, rate-limited, provider-down, invalid-data, retriable-unknown) with defined platform behavior per class. Support could finally answer 'what does this error mean' from one runbook, and automated recovery handled the retriable classes uniformly.",
        },
      ],
      implementation: [
        "The gateway went first and delivered value before any connector migrated: pointing legacy integrations' outbound traffic through it immediately gave uniform logging, rate limiting, and circuit breaking to code that had never had them. Integration incident count started falling a quarter before the first connector was rewritten.",
        "The connector SDK was extracted from, not designed ahead of, the first three reference connectors, an accounting package, a listing portal, and an e-signature provider, chosen for maximal diversity of auth and sync patterns. The conformance suite that every connector must pass encodes the lessons from those three, and it is why connector number 25 behaves like connector number 4.",
        "Migration sequencing was ruthlessly incident-driven: the top five noisiest integrations moved first and accounted for most of the operational win. By the back half of the program, connector rewrites were routine enough that two were completed by engineers outside the platform team, which was the real validation of the SDK.",
      ],
      results: [
        "Integration-related incidents down 73% year over year after full migration; integration incidents left the top-five incident categories entirely.",
        "New integration build time reduced from ~6 weeks to 4 days median, measured across the eight integrations added post-platform.",
        "Gateway proxied 6M calls per day with p95 added overhead under 40 ms.",
        "Eleven bespoke token-refresh implementations retired; three weak credential-storage findings remediated during the vault migration.",
        "Third-party outages contained by circuit breakers with tenant-visible status pages, cutting outage-driven support tickets by more than half.",
        "Integration catalog grew from 25 to 33 systems in the year after launch with no growth in the platform team's operational load.",
      ],
      lessonsLearned: [
        "Ship the gateway before the framework; centralizing egress delivered most of the operational win before a single connector was rewritten.",
        "Extract SDK contracts from real reference implementations rather than designing them speculatively.",
        "A common error taxonomy is the least glamorous and most compounding investment in any integration platform.",
        "Sequencing migrations by incident frequency front-loads the value and builds the political capital a long program needs.",
        "Conformance test suites are how platform teams scale beyond themselves; outside teams shipping connectors was the success metric that mattered.",
      ],
      futureImprovements: [
        "Self-service connector development portal with sandboxed testing against recorded provider fixtures.",
        "Declarative sync definitions for simple providers, generating connectors from an API spec plus mapping config instead of code.",
        "Per-tenant integration usage analytics exposed in the product, turning the hub's telemetry into a customer-facing feature.",
        "Automated provider API change detection by diffing observed response shapes against expected schemas, alerting before breakage hits users.",
      ],
    },
    diagramId: "enterprise-integration",
  },
];

export function getProject(slug: string): ProjectCaseStudy | undefined {
  return projects.find((p) => p.slug === slug);
}
