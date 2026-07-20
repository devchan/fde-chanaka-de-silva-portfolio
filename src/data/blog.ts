import type { BlogPost } from "@/lib/types";

export const blogPosts: BlogPost[] = [
  {
    slug: "production-rag-beyond-the-demo",
    title: "Production RAG: What Actually Matters Beyond the Demo",
    description:
      "Chunking strategy, hybrid retrieval, reranking, and evals — the four decisions that separate a RAG demo from a system enterprise users trust.",
    date: "2025-04-22",
    readingTime: "9 min read",
    category: "Artificial Intelligence",
    tags: ["RAG", "LLM", "Vector Search", "Evals", "Production AI"],
    content: [
      {
        type: "p",
        text: "Every RAG demo looks the same: embed some PDFs, throw cosine similarity at a question, stuff the top five chunks into a prompt. It works on the three questions you rehearsed. Then a real user asks about a clause split across two pages, or uses an internal acronym that never appears in the documents verbatim, and the system confidently answers from the wrong context.",
      },
      {
        type: "p",
        text: "I've shipped RAG into enterprise SaaS where the users are compliance teams, not hackathon judges. The gap between demo and production isn't the model — it's four unglamorous decisions: how you chunk, how you retrieve, how you rerank, and how you measure. Here's what I've learned about each.",
      },
      { type: "h2", text: "Chunking is a data modeling problem, not a splitting problem" },
      {
        type: "p",
        text: "Fixed-size 512-token chunks are the default because they're easy, not because they're right. The failure mode is structural: a policy document's exception clause lands in a different chunk than the rule it modifies, and retrieval returns the rule without the exception. That's not a relevance miss — it's a correctness bug.",
      },
      {
        type: "p",
        text: "What works: chunk along document structure (headings, list items, table rows), keep a parent-child hierarchy so you can retrieve small and expand to the enclosing section at generation time, and prepend a breadcrumb of the heading path to every chunk before embedding. That last trick alone fixed a whole class of failures where a chunk said 'the limit is 30 days' and nothing in the chunk said which limit.",
      },
      { type: "h2", text: "Hybrid retrieval, because embeddings can't spell" },
      {
        type: "p",
        text: "Dense retrieval is great at paraphrase and terrible at exact tokens. Product codes, error IDs, people's names, internal acronyms — embeddings smear them into a semantic soup. BM25 nails exact matches and fails at paraphrase. You need both, fused. Reciprocal Rank Fusion is embarrassingly simple and consistently beats either retriever alone:",
      },
      {
        type: "code",
        lang: "python",
        code: "def rrf_fuse(dense_hits, sparse_hits, k=60, top_n=20):\n    scores: dict[str, float] = {}\n    for hits in (dense_hits, sparse_hits):\n        for rank, doc_id in enumerate(hits):\n            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank + 1)\n    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)\n    return [doc_id for doc_id, _ in ranked[:top_n]]\n\n# Retrieve wide from both indexes, fuse, then rerank the fused set.\ndense = vector_index.search(query_embedding, limit=50)\nsparse = bm25_index.search(query_text, limit=50)\ncandidates = rrf_fuse(dense, sparse)",
      },
      {
        type: "p",
        text: "In one deployment, adding BM25 alongside pgvector lifted recall@20 on our eval set from 71% to 89%. Most of the recovered queries contained identifiers — exactly the queries enterprise users ask most.",
      },
      { type: "h2", text: "Rerank late, retrieve wide" },
      {
        type: "p",
        text: "Bi-encoders (your embedding model) score query and document independently, so they can't model interaction between the two. Cross-encoder rerankers read them together and are dramatically better at 'is this chunk actually about the question' — they're just too slow to run over the whole corpus. So don't: retrieve 50 candidates cheaply, rerank to 5-8 with a cross-encoder, and pass only those to the LLM. The latency cost is 100-200ms; the precision gain is the difference between the model answering from the right clause and hallucinating around a plausible-looking neighbor.",
      },
      {
        type: "ul",
        items: [
          "Retrieve 40-60 candidates from hybrid search — recall is cheap at this stage.",
          "Cross-encode rerank down to a context budget you chose deliberately, not 'whatever fits'.",
          "Deduplicate near-identical chunks before the prompt; retrieved redundancy crowds out coverage.",
          "Log retrieved chunk IDs with every generation — you cannot debug RAG without knowing what the model saw.",
        ],
      },
      { type: "h2", text: "Evals are the product" },
      {
        type: "p",
        text: "You cannot tune what you don't measure, and 'it seems better' does not survive a prompt change. Build a golden set of 50-150 real questions with annotated source passages, then track retrieval metrics (recall@k, MRR) separately from generation metrics (faithfulness, answer relevance via LLM-as-judge with a fixed rubric). Separating the two matters: most 'the AI is wrong' bugs I've triaged were retrieval bugs, and generation-level evals alone would have pointed the fix at the wrong layer.",
      },
      {
        type: "quote",
        text: "A RAG system without an eval suite isn't a system — it's a demo you haven't broken yet.",
      },
      {
        type: "p",
        text: "Run the suite in CI on every change to chunking, embedding models, or prompts. When we did this, a 'harmless' chunk-size tweak showed up as a 9-point recall regression before it ever reached a user. That's the whole game: make quality regressions as visible as type errors.",
      },
    ],
  },
  {
    slug: "scaling-laravel-horizon-queues",
    title: "Scaling Laravel Queues: Horizon Lessons from 2M Jobs a Day",
    description:
      "Queue segregation, backpressure, tuned Horizon supervisors, and the failure modes that only show up under real throughput.",
    date: "2025-06-10",
    readingTime: "8 min read",
    category: "Laravel",
    tags: ["Laravel", "Horizon", "Redis", "Queues", "Performance"],
    content: [
      {
        type: "p",
        text: "Laravel's queue system is deceptively easy to start with — dispatch a job, run a worker, done. The problems arrive with volume. On a platform processing around two million background jobs a day (email sends, webhook fan-out, report generation, AI enrichment), I learned that most queue incidents aren't Redis falling over. They're design decisions made back when the queue had one consumer and nothing was urgent.",
      },
      { type: "h2", text: "One queue is a liability, not a simplification" },
      {
        type: "p",
        text: "The default trap is putting everything on the default queue. Then a nightly report job that takes 90 seconds per run lands 10,000 times in front of password-reset emails, and your 'fast' jobs inherit the latency of your slowest tenant. Queues are isolation boundaries. Segregate by latency class, not by feature: a critical queue for user-facing sends, a default queue for normal async work, and a long queue for anything that can legitimately take minutes.",
      },
      {
        type: "code",
        lang: "php",
        code: "// config/horizon.php\n'environments' => [\n    'production' => [\n        'supervisor-critical' => [\n            'connection' => 'redis',\n            'queue' => ['critical'],\n            'balance' => 'auto',\n            'minProcesses' => 4,\n            'maxProcesses' => 24,\n            'tries' => 3,\n            'timeout' => 30,\n        ],\n        'supervisor-long' => [\n            'connection' => 'redis-long',\n            'queue' => ['reports', 'exports'],\n            'balance' => 'auto',\n            'maxProcesses' => 6,\n            'timeout' => 900,\n            'memory' => 512,\n        ],\n    ],\n],",
      },
      {
        type: "p",
        text: "Note the separate Redis connection for long jobs. Under heavy load, a single Redis instance serving both cache and queues will happily let a burst of queue traffic evict your cache — or worse, let cache pressure slow queue polling. Split them early; it's a one-line config change before it becomes an incident.",
      },
      { type: "h2", text: "Timeouts, retries, and the retry_after trap" },
      {
        type: "p",
        text: "The single most common Horizon misconfiguration I've fixed: a job timeout longer than the connection's retry_after. If timeout is 300 but retry_after is 90, Redis re-releases the job while the first worker is still running it, and now the job executes twice concurrently. Rule: retry_after must exceed your longest timeout on that connection, with margin. This is also why the long-job connection should be separate — it lets you set a generous retry_after there without delaying retries of fast jobs.",
      },
      {
        type: "ul",
        items: [
          "Set an explicit timeout on every job class; the default hides your latency assumptions.",
          "Use backoff arrays — [10, 60, 300] — instead of hammering a struggling downstream at fixed intervals.",
          "Make handlers idempotent before raising tries above 1; retries without idempotency are data corruption on a timer.",
          "Cap maxExceptions separately from tries so a poison job can't burn all retries on the same deterministic failure.",
        ],
      },
      { type: "h2", text: "Backpressure and fair scheduling across tenants" },
      {
        type: "p",
        text: "In multi-tenant SaaS, one tenant importing 400,000 contacts can starve everyone else's jobs. Horizon's auto-balancing helps between queues, not within one. What worked for us: per-tenant rate limiting at dispatch time using Redis::throttle, plus chunked dispatch — instead of enqueueing 400k jobs at once, enqueue a coordinator job that releases work in batches of a few thousand and re-dispatches itself. The queue depth stays bounded, Horizon's metrics stay meaningful, and no tenant monopolizes workers.",
      },
      {
        type: "quote",
        text: "A queue is a promise about latency. If you can't say how long a job will wait, you haven't designed the queue — you've just deferred the outage.",
      },
      { type: "h2", text: "Watch wait time, not throughput" },
      {
        type: "p",
        text: "Throughput graphs look healthy right up until they don't. The metric that predicts trouble is queue wait time — Horizon exposes it per queue, and it's the first thing to move when consumers can't keep up. We alerted at 30 seconds of wait on the critical queue and 10 minutes on long. Pair that with a failed-jobs alert that fires on rate of change rather than absolute count, and you'll catch a bad deploy in the first hundred failures instead of the first hundred thousand. Horizon gives you the dashboard for free; the discipline of deciding what 'unhealthy' means is on you.",
      },
    ],
  },
  {
    slug: "idempotency-keys-exactly-once",
    title: "Idempotency Keys: Faking Exactly-Once in Payment and Webhook Systems",
    description:
      "Exactly-once delivery doesn't exist. Exactly-once effects can — with idempotency keys, atomic claims, and stored responses.",
    date: "2025-07-29",
    readingTime: "9 min read",
    category: "System Design",
    tags: ["Idempotency", "Payments", "Webhooks", "API Design", "Reliability"],
    content: [
      {
        type: "p",
        text: "A client sends a charge request. The charge succeeds, but the response is lost to a network blip. The client, doing exactly what a well-behaved client should, retries. Without idempotency, you've just billed a customer twice — and no amount of 'be careful' fixes it, because the retry is correct behavior. Timeout ambiguity is fundamental: the caller cannot distinguish 'failed' from 'succeeded, response lost'.",
      },
      {
        type: "p",
        text: "Having built payment flows on Stripe and consumed more webhook firehoses than I care to count, my position is simple: any endpoint with side effects that can be retried must be idempotent, and the mechanism has to live server-side. Here's the design that has held up.",
      },
      { type: "h2", text: "Exactly-once delivery is impossible; exactly-once effect is engineering" },
      {
        type: "p",
        text: "Distributed systems give you at-most-once or at-least-once delivery — pick one. Every serious system picks at-least-once and pushes deduplication to the receiver. The contract: the client generates a unique idempotency key per logical operation (not per HTTP attempt), sends it on every retry of that operation, and the server guarantees the side effect happens once and every retry gets the same response.",
      },
      { type: "h2", text: "The server-side state machine" },
      {
        type: "p",
        text: "The naive implementation — check if key exists, then insert — has a race: two concurrent retries both pass the check. The claim must be atomic. A unique constraint plus insert-first is the simplest correct version:",
      },
      {
        type: "code",
        lang: "php",
        code: "public function charge(Request $request)\n{\n    $key = $request->header('Idempotency-Key');\n    abort_if(!$key, 400, 'Idempotency-Key required');\n\n    try {\n        $record = IdempotencyKey::create([\n            'key' => $key,\n            'request_hash' => hash('sha256', $request->getContent()),\n            'status' => 'in_progress',\n        ]);\n    } catch (UniqueConstraintViolationException) {\n        $record = IdempotencyKey::where('key', $key)->firstOrFail();\n        if ($record->request_hash !== hash('sha256', $request->getContent())) {\n            abort(422, 'Key reused with different payload');\n        }\n        if ($record->status === 'in_progress') {\n            abort(409, 'Original request still processing');\n        }\n        return response()->json($record->response_body, $record->response_code);\n    }\n\n    $response = $this->processCharge($request);\n    $record->update(['status' => 'completed', ...$response->toStorable()]);\n    return $response;\n}",
      },
      {
        type: "ul",
        items: [
          "Store the response, not just a 'seen' flag — retries must return the original result, including the original error.",
          "Hash the payload and reject key reuse with a different body; otherwise a client bug silently returns the wrong customer's charge.",
          "Return 409 while the first attempt is in flight rather than blocking; let the client retry with backoff.",
          "Expire keys on a policy (Stripe uses 24 hours) so the table doesn't grow forever — and document that window.",
        ],
      },
      { type: "h2", text: "Webhooks: the same problem, inverted" },
      {
        type: "p",
        text: "When you consume webhooks, you're the server in this story. Stripe, Microsoft Graph, SendGrid — all of them deliver at-least-once, and all of them will re-deliver during their retry storms precisely when your system is already degraded. Treat the event ID as the idempotency key: atomically record it before processing, skip if already recorded, and keep the handler itself safe to re-run because your dedupe window won't be infinite.",
      },
      {
        type: "quote",
        text: "Retries are not an edge case. They are the normal operation of a distributed system observed over enough time.",
      },
      { type: "h3", text: "Where the effect isn't yours" },
      {
        type: "p",
        text: "Idempotency gets harder when the side effect lives in someone else's system. If your handler calls Stripe, pass your own derived idempotency key downstream — Stripe's API accepts one for exactly this reason. Chain the keys: inbound event ID becomes the outbound idempotency key. Now a redelivered webhook that crashes halfway through can be safely reprocessed end to end.",
      },
      { type: "h2", text: "What this buys you" },
      {
        type: "p",
        text: "Once effects are idempotent, aggressive retry policies stop being scary, at-least-once queues stop being a correctness risk, and incident recovery becomes 'replay the last hour of events' instead of a forensic reconciliation project. That last one is the real payoff. The teams that recover fastest from outages aren't the ones that prevent every duplicate — they're the ones whose systems don't care.",
      },
    ],
  },
  {
    slug: "outbox-pattern-event-driven-consistency",
    title: "The Outbox Pattern: Reliable Events Without Distributed Transactions",
    description:
      "Dual writes are the quiet killer of event-driven systems. The transactional outbox fixes them with one table and a relay.",
    date: "2025-09-16",
    readingTime: "8 min read",
    category: "Distributed Systems",
    tags: ["Outbox Pattern", "Event-Driven", "Microservices", "Kafka", "Consistency"],
    content: [
      {
        type: "p",
        text: "Here's a bug I've seen in three different codebases, written by three good teams: save the order to the database, then publish an OrderCreated event to the broker. Two writes, two systems, no transaction spanning them. The service crashes between the two, or the broker times out, and now the order exists but downstream — billing, inventory, notifications — never hears about it. The inverse ordering is worse: publish first, and a rolled-back transaction means consumers act on an order that doesn't exist.",
      },
      {
        type: "p",
        text: "This is the dual-write problem, and it isn't rare. At a few thousand events an hour, a 0.01% failure window still corrupts state daily. Retries don't fix it; they just change which half is missing.",
      },
      { type: "h2", text: "One transaction, one source of truth" },
      {
        type: "p",
        text: "The transactional outbox pattern resolves it by refusing to do two writes. You write the business row and the event into the same database, in the same local transaction. An outbox table holds the pending events; a separate relay process reads them and publishes to the broker. If the transaction commits, the event is durably queued. If it rolls back, the event never existed. Atomicity comes from the one place you already have it — your database.",
      },
      {
        type: "code",
        lang: "go",
        code: "func (s *OrderService) CreateOrder(ctx context.Context, o Order) error {\n    return s.db.WithTx(ctx, func(tx *sql.Tx) error {\n        if err := insertOrder(tx, o); err != nil {\n            return err\n        }\n        evt := OutboxEvent{\n            ID:            uuid.New(),\n            AggregateType: \"order\",\n            AggregateID:   o.ID,\n            EventType:     \"order.created\",\n            Payload:       mustJSON(o),\n            CreatedAt:     time.Now().UTC(),\n        }\n        // Same transaction: commit means both exist, rollback means neither.\n        return insertOutbox(tx, evt)\n    })\n}",
      },
      { type: "h2", text: "The relay: polling vs. CDC" },
      {
        type: "p",
        text: "Something has to move events from the table to the broker. Two viable designs. A polling relay selects unpublished rows (with FOR UPDATE SKIP LOCKED so multiple relay instances don't fight), publishes, and marks them sent — simple, debuggable, adds 100ms-1s of latency. Change data capture with Debezium tails the database WAL and streams outbox inserts to Kafka with no polling and near-zero lag — more moving parts, but the right call at serious volume.",
      },
      {
        type: "p",
        text: "My honest advice: start with polling. I've run a polling relay at hundreds of events per second on unremarkable Postgres hardware. You can graduate to CDC when latency or load demands it, and the outbox table schema doesn't change — that's the beauty of the pattern as an interface.",
      },
      { type: "h2", text: "Consumers still need to earn their keep" },
      {
        type: "p",
        text: "The outbox gives you at-least-once publication — the relay can crash after publishing but before marking the row, and the event goes out again. That's the correct trade. It means consumers must deduplicate on the event ID, which you conveniently generated inside the producing transaction. Ordering also needs care: partition the broker topic by aggregate ID so all events for order 123 land in one partition, in commit order.",
      },
      {
        type: "ul",
        items: [
          "Carry the event ID end to end; it's the idempotency key for every consumer.",
          "Partition by aggregate ID to preserve per-entity ordering without global ordering costs.",
          "Version event payloads from day one — v2 of order.created will arrive sooner than you think.",
          "Monitor outbox lag (oldest unpublished row age); it's the single best health signal for the pipeline.",
          "Prune published rows on a schedule, or the outbox becomes your largest and least useful table.",
        ],
      },
      {
        type: "quote",
        text: "You don't need a distributed transaction. You need one local transaction and the honesty to handle at-least-once everywhere else.",
      },
      { type: "h2", text: "Where I'd reach for it" },
      {
        type: "p",
        text: "Any time a state change in one service must reliably trigger work in another and losing that trigger costs real money or trust: order lifecycles, billing events, provisioning workflows, audit trails, notifications. The pattern's overhead is one table, one relay, and a dedup check per consumer. Against a 2 a.m. reconciliation script that guesses which orders never got invoiced, it's the cheapest insurance in distributed systems.",
      },
    ],
  },
  {
    slug: "kubernetes-cost-optimization-without-tears",
    title: "Cutting Our Kubernetes Bill 55% Without Cutting Reliability",
    description:
      "Right-sizing requests, spot node pools with honest disruption budgets, and autoscaling that follows real load — a field report.",
    date: "2025-11-12",
    readingTime: "8 min read",
    category: "Cloud",
    tags: ["Kubernetes", "Cost Optimization", "Autoscaling", "Spot Instances", "SRE"],
    content: [
      {
        type: "p",
        text: "The uncomfortable truth about most Kubernetes bills is that you're paying for fear. Fear-driven resource requests, fear of spot interruptions, fear of scaling down. When we audited a production cluster running a Laravel-and-Node SaaS workload, average CPU utilization was 11%. We were paying for nine idle cores out of every ten. Over a quarter, we cut the compute bill by 55% with no reliability regression — and every step was boring.",
      },
      { type: "h2", text: "Requests are a bet; most teams over-bet" },
      {
        type: "p",
        text: "Requests drive scheduling and therefore cost: the scheduler reserves what you request, not what you use. Every team sets requests once, during an incident or a guess, and never revisits them. Start by measuring actual P95 usage per workload over two weeks (kube-prometheus makes this a one-query job), then set CPU requests near P95 usage and let limits breathe. For CPU, I set requests honestly and either omit limits or set them high — CPU is compressible, and CPU limits mostly buy you throttling artifacts. Memory is not compressible: set memory requests equal to limits and size them from observed peaks plus headroom, because the OOM killer does not negotiate.",
      },
      {
        type: "code",
        lang: "yaml",
        code: "resources:\n  requests:\n    cpu: 250m        # P95 observed: 210m. Was 2000m \"just in case\".\n    memory: 768Mi    # peak observed: 610Mi + headroom\n  limits:\n    memory: 768Mi    # memory: requests == limits, no surprises\n    # no cpu limit: compressible, throttling hurts more than sharing",
      },
      {
        type: "p",
        text: "That single change — right-sizing requests across roughly forty Deployments — recovered more capacity than any other step. Nodes went from 11% to around 45% average utilization, and the cluster autoscaler quietly drained a third of the nodes.",
      },
      { type: "h2", text: "Spot nodes: cheap compute for honest workloads" },
      {
        type: "p",
        text: "Spot/preemptible nodes are 60-90% cheaper, with the caveat that they vanish on two minutes' notice. The mistake is treating that as a reason to avoid them; the correct response is to sort workloads by interruption tolerance. Queue workers, cron jobs, CI runners, and stateless replicas behind a load balancer are all fine candidates — interruption just means a job retries or a pod reschedules. We ran two node pools: a small on-demand pool for stateful and latency-critical pods, and a spot pool for everything else, steered by taints and node affinity.",
      },
      {
        type: "ul",
        items: [
          "Taint spot nodes and make workloads opt in explicitly; accidental placement is how spot gets a bad reputation.",
          "Set PodDisruptionBudgets so voluntary and spot evictions can't take out all replicas of a service at once.",
          "Handle SIGTERM properly — finish the in-flight job, stop pulling new work. Two minutes is plenty if you use it.",
          "Diversify spot instance types; a single instance-type pool can be reclaimed en masse in one capacity event.",
        ],
      },
      { type: "h2", text: "Autoscale on the signal users feel" },
      {
        type: "p",
        text: "CPU-based HPA is fine for web tiers, but for queue workers it's actively wrong — a worker waiting on I/O shows low CPU while the backlog grows. Scale workers on queue depth per replica via KEDA or external metrics, scale web tiers on requests-per-second or CPU, and let the cluster autoscaler (or Karpenter) translate pod demand into nodes. The other half nobody does: scale down. Non-production environments running nights and weekends are pure waste; a scheduled scale-to-zero on preview and staging environments was worth 12% of the total bill by itself.",
      },
      {
        type: "quote",
        text: "Utilization is a proxy for honesty. A cluster at 10% utilization isn't reliable — it's unexamined.",
      },
      { type: "h2", text: "Make cost a metric, not an audit" },
      {
        type: "p",
        text: "The reason clusters drift back to waste is that cost is invisible at decision time. Put per-namespace cost (OpenCost or your cloud's allocation tooling) on the same dashboards as latency and error rate, and review it in the same weekly ritual. Optimization you do once is a project; optimization you can see is a habit. The 55% didn't come from one clever trick — it came from making waste show up on a graph someone actually looks at.",
      },
    ],
  },
  {
    slug: "enterprise-integration-hub-without-spaghetti",
    title: "Designing an Integration Hub That Doesn't Become Spaghetti",
    description:
      "A hub architecture for Microsoft Graph, Stripe, and SendGrid: anti-corruption layers, canonical events, and one place where retries live.",
    date: "2026-01-20",
    readingTime: "9 min read",
    category: "Architecture",
    tags: ["Integration Architecture", "Microsoft Graph", "Stripe", "API Design", "SaaS"],
    content: [
      {
        type: "p",
        text: "Enterprise SaaS lives or dies on integrations. Calendar sync through Microsoft Graph, billing through Stripe, transactional email through SendGrid — and every one of them starts as 'just a service class' called from wherever it's needed. Eighteen months later, Graph API calls are scattered across 30 files, three subsystems handle Stripe webhooks slightly differently, and nobody can answer 'what happens if SendGrid is down' without reading code. I've inherited that codebase. I've also had the chance to rebuild it properly.",
      },
      { type: "h2", text: "The hub: one owner per external system" },
      {
        type: "p",
        text: "The architecture that survives is a hub: every external provider gets exactly one module that owns all communication with it — authentication, rate limiting, retries, pagination, webhook verification. Domain code never imports an SDK. It talks to the hub through two narrow surfaces: commands going out ('send this email', 'create this subscription') and canonical events coming in ('payment.succeeded', 'calendar.event.updated'). The hub is the only place that knows Stripe spells things one way and Graph spells them another.",
      },
      { type: "h3", text: "Anti-corruption layers are the point, not the overhead" },
      {
        type: "p",
        text: "Each provider module translates external payloads into your domain's canonical types at the boundary. This looks like ceremony until the day Stripe deprecates an API version or you add a second email provider. When SendGrid had a regional outage, swapping in a fallback provider touched one adapter — because nothing outside the hub knew SendGrid existed.",
      },
      {
        type: "code",
        lang: "ts",
        code: "// Domain code depends on this — never on stripe-node or @microsoft/microsoft-graph-client.\ninterface PaymentGateway {\n  createSubscription(cmd: CreateSubscriptionCommand): Promise<SubscriptionResult>;\n  cancelSubscription(subscriptionId: string): Promise<void>;\n}\n\n// Inbound: every provider webhook is normalized to a canonical event.\ninterface CanonicalEvent {\n  id: string;            // provider event id — the dedupe key\n  source: 'stripe' | 'msgraph' | 'sendgrid';\n  type: string;          // 'payment.succeeded', 'email.bounced', ...\n  occurredAt: string;\n  tenantId: string;\n  payload: Record<string, unknown>;\n}\n\n// One pipeline: verify signature -> dedupe -> normalize -> publish to internal bus.",
      },
      { type: "h2", text: "Webhooks deserve a pipeline, not endpoints" },
      {
        type: "p",
        text: "Inbound is where integration codebases really rot, because each webhook gets written under deadline pressure. Resist it: build one ingestion pipeline with per-provider steps only where genuinely necessary. Verify the signature, persist the raw event immediately, ack fast, then process async. Persisting before processing sounds pedantic until a deploy bug makes you drop four hours of Stripe events — with the raw log, that's a replay command; without it, it's a support ticket avalanche.",
      },
      {
        type: "ul",
        items: [
          "Ack webhooks in under a second; providers time out and retry, and slow handlers turn their retry storm into your outage.",
          "Dedupe on provider event ID — every provider on this list delivers at-least-once.",
          "Store raw payloads with a retention policy; replayability is the difference between a bug and an incident.",
          "Handle Graph subscription renewals as first-class scheduled work — expired subscriptions fail silently, which is the worst way to fail.",
          "Respect Retry-After on 429s per provider; Graph in particular will throttle you harder if you don't.",
        ],
      },
      { type: "h2", text: "Reliability semantics live in the hub" },
      {
        type: "p",
        text: "Retries, circuit breakers, idempotency keys, rate-limit budgets — these are provider-relationship concerns, and they belong in the hub, once. Outbound commands go through a queue with per-provider backoff; Stripe calls carry idempotency keys derived from the triggering domain event; a circuit breaker per provider stops a Graph brownout from tying up every worker in the fleet. When domain code implements its own retry loop around a hub call, that's the first strand of spaghetti — the hub's contract should be strong enough that callers never feel the need.",
      },
      {
        type: "quote",
        text: "An integration architecture is judged not by how it works on a good day, but by how many files you touch when a provider changes its mind.",
      },
      { type: "h2", text: "Start smaller than this, but draw the boundary now" },
      {
        type: "p",
        text: "You don't need an integration platform team to do this. The first version is a folder per provider, a canonical event type, and the rule that SDK imports outside the hub fail code review. The architecture isn't the infrastructure — it's the boundary. Enforce the boundary from the first integration, and the second and tenth integrations get cheaper instead of exponentially more entangled.",
      },
    ],
  },
  {
    slug: "opentelemetry-tracing-across-queue-boundaries",
    title: "Tracing a Request Across Queue Boundaries with OpenTelemetry",
    description:
      "Async work breaks most tracing setups. Context propagation through message headers, span links, and the queue metrics that actually matter.",
    date: "2026-03-24",
    readingTime: "8 min read",
    category: "Engineering",
    tags: ["OpenTelemetry", "Observability", "Distributed Tracing", "Queues"],
    content: [
      {
        type: "p",
        text: "Synchronous tracing is a solved problem — install the OTel SDK, auto-instrument HTTP and your database driver, and waterfalls appear. Then a request dispatches a queue job, and the trace just stops. The user-facing symptom ('my export never arrived') lives three async hops away from the request that triggered it, and your tracing backend shows you a 40ms POST that did nothing wrong. In queue-heavy systems — which is to say, in every serious backend I've worked on — the async gap is where debugging time actually goes.",
      },
      { type: "h2", text: "Context doesn't cross the queue unless you carry it" },
      {
        type: "p",
        text: "OTel context propagation works over HTTP because instrumentation injects traceparent headers automatically. Message queues have no universal equivalent, so you do it explicitly: serialize the current context into message attributes at dispatch, extract it in the worker, and start the consumer span inside that restored context. The W3C Trace Context format is the same one HTTP uses — the queue message is just another carrier.",
      },
      {
        type: "code",
        lang: "python",
        code: "from opentelemetry import trace, propagate\n\ntracer = trace.get_tracer(\"worker\")\n\ndef dispatch(queue, task_name, body):\n    headers = {}\n    propagate.inject(headers)  # writes traceparent/tracestate\n    queue.publish(task_name, body, attributes=headers)\n\ndef handle(message):\n    parent_ctx = propagate.extract(message.attributes)\n    with tracer.start_as_current_span(\n        f\"process {message.task_name}\",\n        context=parent_ctx,\n        kind=trace.SpanKind.CONSUMER,\n        attributes={\n            \"messaging.system\": \"rabbitmq\",\n            \"messaging.destination.name\": message.queue,\n            \"messaging.message.id\": message.id,\n        },\n    ):\n        run_task(message)",
      },
      {
        type: "p",
        text: "Twenty lines, and the trace now reads: HTTP request, PRODUCER span for the publish, queue wait, CONSUMER span for the processing, and every database call the worker made — one waterfall, end to end.",
      },
      { type: "h2", text: "Child spans vs. span links: choose deliberately" },
      {
        type: "p",
        text: "Making the consumer span a child of the producer works beautifully for one-job-per-request flows. It breaks down for batch consumers and fan-in: a worker that aggregates 500 messages can't be a child of 500 traces. That's what span links are for — start a new trace for the batch and link each source context. My rule of thumb: parent-child when one message means one unit of user-attributable work; links when messages are aggregated, and for very long-delayed jobs where a 6-hour trace would be unreadable anyway.",
      },
      { type: "h3", text: "Queue wait time is the span you're missing" },
      {
        type: "p",
        text: "The gap between the producer span ending and the consumer span starting is time spent sitting in the queue — and it's the metric that explains most 'the system is slow' reports in async pipelines. Record publish time as a message attribute and emit the delta as both a span attribute and a histogram metric. When exports get slow, this number tells you instantly whether to look at the worker code or the worker count.",
      },
      {
        type: "ul",
        items: [
          "Propagate context through every hop, including job-dispatches-job chains — one missing link severs the trace.",
          "Use messaging semantic conventions so backends recognize and visualize queue hops correctly.",
          "Record retry attempt number on consumer spans; a trace showing attempt 3 of 3 tells a different story than attempt 1.",
          "Use parent-based tail-aware sampling where you can — head sampling at the HTTP edge will randomly orphan worker spans.",
        ],
      },
      {
        type: "quote",
        text: "An observability setup that ends at the queue boundary observes the part of the system that was already easy to debug.",
      },
      { type: "h2", text: "Payoff: incidents become queries" },
      {
        type: "p",
        text: "After we wired propagation through every queue in one platform, the flagship debugging moment came within a month: a customer's invoices were arriving hours late. One trace query showed a 3-hour gap between producer and consumer spans on a single queue — a supervisor misconfiguration had starved one worker pool while dashboards averaged the healthy ones. Pre-tracing, that was a day of log archaeology across four services. With the trace, it was fifteen minutes, most of which was writing the fix.",
      },
    ],
  },
  {
    slug: "how-ai-agents-changed-my-development-workflow",
    title: "How AI Agents Actually Changed My Development Workflow",
    description:
      "A year of agentic coding: MCP servers as the integration layer, where agents genuinely accelerate senior engineers, and where they quietly fail.",
    date: "2026-06-09",
    readingTime: "9 min read",
    category: "Developer Productivity",
    tags: ["AI Agents", "MCP", "Agentic Coding", "Developer Experience", "LLM"],
    content: [
      {
        type: "p",
        text: "I was skeptical of AI coding tools for a long time, and the early ones earned it — autocomplete that confidently invented APIs was a net tax on a codebase I knew well. Agentic tools changed my mind, not because the models got smarter (they did), but because the interaction model changed: instead of predicting my next line, an agent takes a task, reads the codebase, runs the tests, and iterates against real feedback. After a year of using Claude Code daily on production systems, my workflow is genuinely different. Here's the honest accounting.",
      },
      { type: "h2", text: "The unit of delegation changed" },
      {
        type: "p",
        text: "The shift isn't speed of typing — it's granularity. I used to delegate nothing smaller than a ticket; now I delegate tasks in the awkward middle: 'add tenant_id scoping to these five queries and update the tests', 'trace why this webhook handler double-fires under retry', 'migrate this module from Guzzle to the SDK'. Tasks that are 80% mechanical and 20% judgment, where the agent does the mechanics and I supply the judgment at review time. My role on these tasks moved from author to editor, and editing well-structured diffs is dramatically faster than writing them — when the task was specified well.",
      },
      {
        type: "quote",
        text: "The skill that transfers isn't prompting. It's the same skill as delegating to a capable new engineer: precise task framing, explicit constraints, and review that assumes competence but verifies everything.",
      },
      { type: "h2", text: "MCP is the part I'd defend in an architecture review" },
      {
        type: "p",
        text: "Model Context Protocol sounds like plumbing, and it is — the good kind. Instead of pasting context into a chat, the agent's tools are declared once and available everywhere: our Postgres schema, the issue tracker, internal API docs, a sandboxed shell. The agent stops guessing what the invoices table looks like and queries it. Writing a custom MCP server is an afternoon of work:",
      },
      {
        type: "code",
        lang: "ts",
        code: "import { McpServer } from \"@modelcontextprotocol/sdk/server/mcp.js\";\nimport { z } from \"zod\";\n\nconst server = new McpServer({ name: \"schema-inspector\", version: \"1.0.0\" });\n\nserver.tool(\n  \"describe_table\",\n  \"Get columns, types, and indexes for a database table\",\n  { table: z.string() },\n  async ({ table }) => {\n    const columns = await db.introspect(table); // read-only connection\n    return { content: [{ type: \"text\", text: JSON.stringify(columns, null, 2) }] };\n  },\n);\n// Read-only by construction: the agent gets answers, not write access.",
      },
      {
        type: "p",
        text: "The design principle that matters: give agents read paths generously and write paths grudgingly. Our schema-inspector uses a read-only connection; deploy and migration tools stay human-triggered. Capability boundaries do for agents what least-privilege IAM does for services.",
      },
      { type: "h2", text: "Where it fails, and what that implies" },
      {
        type: "p",
        text: "Agents fail in patterned ways, and knowing the pattern is most of the defense. They over-satisfy vague requests — ask for 'better error handling' and you'll get try/catch wallpaper. They plausibly imitate local conventions without understanding why they exist, which is exactly the failure mode code review is worst at catching. And they're weakest at the two things senior engineers are paid for: knowing which requirement is wrong, and knowing what not to build.",
      },
      {
        type: "ul",
        items: [
          "Tests and types are the agent's feedback loop — codebases with strong CI get disproportionate value from agentic tools.",
          "Small, reviewable diffs beat one heroic PR; I ask for plan-then-execute on anything non-trivial.",
          "CLAUDE.md-style convention files pay off immediately: architectural rules stated once stop being violated repeatedly.",
          "Review agent code as you would a confident new hire's: verify the invariants they had no way to know about.",
        ],
      },
      { type: "h2", text: "The net effect after a year" },
      {
        type: "p",
        text: "Measured honestly: the mechanical middle of my work — migrations, test scaffolding, integration adapters, instrumentation — got 3-5x faster. Design work got slightly faster, mostly because exploring a rejected alternative now costs minutes. Debugging got better in a subtler way: an agent that methodically reads every log line has no ego about its hypothesis being wrong. What didn't change is accountability. I ship the code, I own the incident, and the review bar is the same as it ever was. The engineers getting the most out of agents aren't the ones who trust them most — they're the ones who've built workflows where trust isn't required.",
      },
    ],
  },
  {
    slug: "what-a-forward-deployed-engineer-actually-does",
    title: "What a Forward Deployed Engineer Actually Does",
    description:
      "The FDE role is having a moment, and most descriptions of it are wrong. Field notes on living in the customer's environment, closing the feedback loop, and building the product's argument in code.",
    date: "2026-07-20",
    readingTime: "9 min read",
    category: "Engineering",
    tags: ["Forward Deployed Engineer", "Product Engineering", "Customer Success", "Integrations", "Careers"],
    content: [
      {
        type: "p",
        text: "The demo lands. The customer nods, says the right things, and signs. Six weeks later the deployment is stalled — not because the product is wrong, but because their data lives in a shape nobody anticipated, their security team has three questions no slide answered, and the one workflow that would prove the value crosses a system your product has never heard of. Someone has to go sit inside that mess and make the value real. That someone is a forward deployed engineer.",
      },
      {
        type: "p",
        text: "The title is having a moment — Palantir coined it, OpenAI and a wave of AI startups made it fashionable, and now every job board has a dozen FDE listings that mean a dozen different things. Having done the work across enterprise SaaS deployments, most descriptions I read get it wrong. It's not a fancy solutions engineer, it's not a sales-adjacent demo builder, and it's not a support role with a better title. Here's what the job actually is.",
      },
      { type: "h2", text: "The title describes a location, not a seniority" },
      {
        type: "p",
        text: "\"Forward deployed\" is a military metaphor, and it's the right one. It means you operate at the edge, in the customer's environment, far from the comfort of your own codebase and your own assumptions. The defining constraint isn't the difficulty of the code — it's the distance from home. You're writing software against systems you didn't build, data you didn't model, and constraints you learn about the day they block you. A senior engineer who has only ever worked on their own product isn't automatically an FDE; the skill that transfers is operating with confidence where you don't control the ground.",
      },
      {
        type: "p",
        text: "This is why the role is genuinely hard and genuinely senior. You need to be strong enough as an engineer to build production systems, and comfortable enough with ambiguity to do it while the requirements are still forming in a room full of people who don't agree with each other yet. Most engineering roles remove ambiguity before you're asked to code. The FDE codes into the ambiguity.",
      },
      { type: "h2", text: "You are the product's argument, made specific" },
      {
        type: "p",
        text: "A product makes a general promise: \"we do X for companies like you.\" The customer has a specific reality that the general promise doesn't quite fit. The FDE's job is to close that gap in code — to turn \"this could work for you\" into \"this is working, look.\" Usually the first and hardest gap is data. The product wants a clean canonical shape; the customer has fifteen years of a CRM that three acquisitions passed through. You meet them where they are by building the adapter, not by asking them to change.",
      },
      {
        type: "code",
        lang: "ts",
        code: "// The product wants a canonical Account. The customer has... this.\n// An FDE writes the boundary so the product never learns how weird the source is.\ninterface CanonicalAccount {\n  id: string;\n  name: string;\n  tier: \"enterprise\" | \"mid\" | \"smb\";\n  ownerEmail: string;\n  renewalDate: string | null;\n}\n\nfunction adaptLegacyAccount(row: LegacyCrmRow): CanonicalAccount {\n  return {\n    // Their \"ACCT_ID\" is numeric in one table, prefixed in another.\n    id: String(row.ACCT_ID ?? row.acct_key).replace(/^CUST-/, \"\"),\n    name: (row.COMPANY_NM || row.dba_name || \"Unknown\").trim(),\n    // Tier lives in a free-text field three admins have filled inconsistently.\n    tier: normalizeTier(row.SEGMENT),\n    ownerEmail: row.AE_EMAIL?.toLowerCase() ?? \"unassigned@customer.example\",\n    // \"12/31/25\", \"2025-12-31\", and \"\" all appear in the same column.\n    renewalDate: parseFuzzyDate(row.RENEWAL),\n  };\n}\n// This file is the deployment. Everything downstream assumes clean input\n// because one place — here, at the edge — earned that assumption.",
      },
      {
        type: "p",
        text: "That file is unglamorous and it is the entire job in miniature. The product team gets to assume clean canonical input because an FDE stood at the boundary and absorbed the customer's reality so the core product didn't have to. Do this well and the deployment succeeds without the product accumulating a hundred customer-specific special cases. Do it badly — by pushing the mess inward — and you've traded one deployment for permanent tax on every future one.",
      },
      { type: "h2", text: "The feedback loop is the whole job" },
      {
        type: "p",
        text: "Here's the part that separates an FDE from a very good consultant: you are not just delivering a solution, you are a sensor. You are the only person who watches a real user hit the real product on real data, and that observation is worth more than any amount of internal roadmap speculation. The consultant ships the deliverable and leaves. The FDE ships the deliverable and then carries back the three things that would make the next ten deployments trivial.",
      },
      {
        type: "ul",
        items: [
          "The workaround you had to write twice is a missing product feature — file it with the code, not a vague anecdote.",
          "The question the security team asked that you couldn't answer is a gap in the product's story, not just this deal.",
          "The integration you hand-rolled for one customer is probably the connector three others will need next quarter.",
          "The thing that took six weeks and should have taken six days is where the product's onboarding is silently bleeding.",
          "Every custom line you wrote is a hypothesis: either it becomes product, or it becomes debt you personally maintain forever.",
        ],
      },
      {
        type: "p",
        text: "The best FDE work makes itself unnecessary. You solve a customer's problem with custom code, then you fight to move the reusable 80% of that code into the core product so the next FDE — maybe you — never writes it again. An FDE who hoards bespoke solutions builds job security and a maintenance nightmare in equal measure. An FDE who systematically converts field learnings into product is how a company goes from ten painful deployments to a hundred smooth ones.",
      },
      {
        type: "quote",
        text: "A forward deployed engineer's real deliverable isn't the customer's deployment. It's the product change that makes the next deployment easier.",
      },
      { type: "h3", text: "Which is why the reporting line matters" },
      {
        type: "p",
        text: "Put FDEs under sales and they become expensive demo engineers optimizing for the close. Put them under support and they become senior firefighters optimizing for ticket volume. The role only works when the feedback loop has teeth — when what an FDE learns in the field actually redirects the roadmap. The organizations that get real leverage out of FDEs treat them as the product team's forward observers, not the sales team's closers.",
      },
      { type: "h2", text: "What breaks forward deployed engineers" },
      {
        type: "p",
        text: "The failure modes are specific and worth naming, because they're where good engineers burn out. The first is losing the thread between custom and core: you say yes to every customer request, ship a snowflake per account, and eighteen months in you're the only human who understands any of it. The second is the opposite — being so protective of the product's purity that you can't meet a real customer where they are, and the deployment dies of principle. The job lives in the tension between those two, and staying in that tension is emotionally harder than any algorithm.",
      },
      {
        type: "p",
        text: "The third is isolation. You're physically or organizationally away from your own engineering team, absorbing customer pressure directly, often the sole technical voice in rooms full of stakeholders. Without a deliberate connection back home — regular syncs, shared context, colleagues who've seen the same patterns — you drift, and drift is how the feedback loop quietly breaks. The customer sees a responsive engineer; the product never hears a thing.",
      },
      {
        type: "quote",
        text: "Say yes to everything and you become a maintenance liability. Say no to everything and the deployment dies. The whole craft is knowing which request is really a product feature wearing a customer's clothes.",
      },
      { type: "h2", text: "Why the role is having a moment" },
      {
        type: "p",
        text: "AI made this role suddenly central, and the reason is structural. The gap between an impressive demo and a deployed system that a real enterprise trusts has never been wider — a model that dazzles in a sandbox has to be wired into messy data, governed by a nervous security team, and shaped around a workflow no product manager has ever seen. That gap is exactly the FDE's home turf. The companies winning enterprise AI aren't the ones with the best benchmark scores; they're the ones who can put an engineer in the customer's environment and make the value undeniable in six weeks instead of six quarters.",
      },
      {
        type: "p",
        text: "For engineers, it's one of the most complete roles going: you write production code, you own real customer outcomes, you see your work land in front of actual users, and you have a direct line to shaping the product. The trade is that you carry the ambiguity and the customer pressure yourself. If that sounds like a tax, this isn't your role. If it sounds like the interesting part, you might already be a forward deployed engineer — you just don't have the title yet.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export const blogCategories = [
  "Artificial Intelligence",
  "Laravel",
  "System Design",
  "Distributed Systems",
  "Cloud",
  "Architecture",
  "Engineering",
  "Developer Productivity",
] as const;
