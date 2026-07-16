import type { Experiment } from "@/lib/types";

export const experiments: Experiment[] = [
  // -------------------------------------------------------------------------
  // 1. Multi-agent customer support triage
  // -------------------------------------------------------------------------
  {
    slug: "multi-agent-support-triage",
    title: "Multi-Agent Customer Support Triage",
    summary:
      "A LangGraph supervisor routes inbound support tickets to specialist worker agents, cutting first-response triage time from hours to seconds.",
    category: "AI Agents",
    status: "production",
    stack: [
      "LangGraph",
      "Python",
      "Claude Sonnet",
      "PostgreSQL",
      "Redis",
      "FastAPI",
      "LangSmith",
    ],
    overview: [
      "Support teams at a B2B SaaS client were manually triaging ~1,200 tickets a day across billing, technical, and account-management queues. Misrouted tickets bounced between teams for an average of 4.5 hours before landing with the right owner. The goal was not to auto-resolve tickets — it was to classify, enrich, and route them with enough context that the receiving agent could act immediately.",
      "I built a supervisor/worker topology in LangGraph: a lightweight supervisor classifies intent and dispatches to one of four specialist agents (billing, technical, account, escalation). Each worker has its own tool belt — billing can query Stripe and the invoicing DB, technical can search the error-log index, and so on. Workers return a structured triage packet (priority, owner queue, suggested first reply, extracted entities) that gets written back to Zendesk. Humans stay in the loop for anything the supervisor flags below a confidence threshold.",
    ],
    architecture: [
      "Zendesk webhook pushes new tickets onto a Redis stream; a FastAPI consumer batches them into the LangGraph runtime.",
      "Supervisor node performs intent classification with a constrained JSON schema output, then routes via conditional edges to one of four worker subgraphs.",
      "Each worker agent has 3-5 scoped tools (Stripe lookup, log search, CRM fetch) and a hard budget of 6 tool-call iterations before forced handoff.",
      "Shared state is a typed TicketState object checkpointed to Postgres via LangGraph's checkpointer, so any run can be replayed or resumed.",
      "Low-confidence classifications (< 0.8) short-circuit to a human-review queue instead of guessing — the escalation path is a first-class graph node, not an error handler.",
      "Every run is traced in LangSmith with ticket ID as metadata; a nightly job diffs agent-assigned queues against final human-assigned queues to measure routing accuracy.",
    ],
    code: [
      {
        title: "Supervisor routing with conditional edges",
        lang: "python",
        snippet: `class TicketState(TypedDict):
    ticket_id: str
    messages: Annotated[list[AnyMessage], add_messages]
    intent: str | None
    confidence: float
    triage: TriagePacket | None

def route_ticket(state: TicketState) -> str:
    if state["confidence"] < 0.8:
        return "human_review"
    return state["intent"]  # "billing" | "technical" | "account"

graph = StateGraph(TicketState)
graph.add_node("supervisor", classify_intent)
graph.add_node("billing", billing_agent)
graph.add_node("technical", technical_agent)
graph.add_node("account", account_agent)
graph.add_node("human_review", enqueue_for_human)
graph.add_conditional_edges("supervisor", route_ticket)
graph.set_entry_point("supervisor")
app = graph.compile(checkpointer=PostgresSaver(pool))`,
      },
      {
        title: "Worker with a hard tool-iteration budget",
        lang: "python",
        snippet: `MAX_TOOL_ITERATIONS = 6

def billing_agent(state: TicketState) -> dict:
    agent = create_react_agent(
        model=sonnet,
        tools=[lookup_stripe_customer, fetch_invoices, get_refund_policy],
        response_format=TriagePacket,
    )
    result = agent.invoke(
        {"messages": state["messages"]},
        config={"recursion_limit": MAX_TOOL_ITERATIONS * 2},
    )
    packet = result["structured_response"]
    if packet.priority == "urgent" and not packet.evidence:
        # Never let an agent mark urgent without citing a source.
        packet.priority = "high"
        packet.notes.append("Downgraded: urgent claim lacked evidence.")
    return {"triage": packet}`,
      },
    ],
    lessons: [
      "Routing accuracy came from the classification schema, not the model. Forcing the supervisor to emit one of four enum values with a confidence score beat free-text classification by 11 points on our golden set.",
      "The human-review path must be a designed node, not a fallback. Once we treated 'I don't know' as a legitimate output, hallucinated routes nearly disappeared.",
      "Tool-call budgets are non-negotiable in production. One runaway billing agent burned 40k tokens re-querying Stripe pagination before we capped iterations.",
      "Measuring against final human-assigned queues (not agent self-reports) was the only honest accuracy metric. Self-graded evals overstated performance by ~8%.",
      "Checkpointing to Postgres paid for itself the first week — replaying a bad run with a fixed prompt is infinitely better than reconstructing it from logs.",
    ],
  },

  // -------------------------------------------------------------------------
  // 2. Hybrid RAG with pgvector + BM25 reranking
  // -------------------------------------------------------------------------
  {
    slug: "hybrid-rag-pgvector-bm25",
    title: "Hybrid RAG: pgvector + BM25 with Reciprocal Rank Fusion",
    summary:
      "Combined dense vector search and BM25 keyword retrieval inside Postgres, fused with RRF, to fix the exact-match blindness that pure embeddings suffer from.",
    category: "RAG",
    status: "production",
    stack: [
      "PostgreSQL",
      "pgvector",
      "ParadeDB pg_search",
      "OpenAI text-embedding-3-large",
      "Python",
      "Cohere Rerank",
    ],
    overview: [
      "A knowledge-base assistant for an enterprise client kept failing on queries containing SKUs, error codes, and policy numbers — 'What does error E-4412 mean?' returned semantically similar but wrong documents, because embeddings smear exact identifiers into fuzzy neighborhoods. Users lost trust fast: a support tool that confidently retrieves the wrong policy is worse than no tool.",
      "Rather than bolt on a separate search engine, I kept everything in Postgres: pgvector for dense retrieval, a BM25 index for lexical matching, and Reciprocal Rank Fusion to merge the two candidate lists before a final cross-encoder rerank. One database, one transaction boundary, one backup story — which mattered a lot to an ops team of three. Retrieval hit rate on the identifier-heavy eval slice went from 61% to 94%.",
    ],
    architecture: [
      "Documents are chunked at ~500 tokens with heading-path prefixes ('Billing > Refunds > EU customers: ...') so chunks carry their own context.",
      "Each chunk row stores both an HNSW-indexed embedding column and a BM25-indexed text column — same table, no sync problem.",
      "Query time: dense top-40 and BM25 top-40 run as two CTEs in a single SQL statement, fused with RRF (k=60) in the same query.",
      "Fused top-20 candidates go through Cohere Rerank; top-5 survivors are packed into the prompt with source URLs.",
      "An eval harness with 300 labeled query/chunk pairs runs on every retrieval-config change; hit@5 and MRR are tracked per query category (identifier, conceptual, multi-hop).",
      "Embedding writes happen in the same transaction as document upserts, so retrieval never sees a half-indexed document.",
    ],
    code: [
      {
        title: "RRF fusion in a single SQL query",
        lang: "sql",
        snippet: `WITH dense AS (
  SELECT id, ROW_NUMBER() OVER (
    ORDER BY embedding <=> $1::vector
  ) AS rank
  FROM chunks
  ORDER BY embedding <=> $1::vector
  LIMIT 40
),
sparse AS (
  SELECT id, ROW_NUMBER() OVER (
    ORDER BY paradedb.score(id) DESC
  ) AS rank
  FROM chunks
  WHERE content @@@ $2
  LIMIT 40
)
SELECT c.id, c.content, c.source_url,
       COALESCE(1.0 / (60 + dense.rank), 0.0)
     + COALESCE(1.0 / (60 + sparse.rank), 0.0) AS rrf_score
FROM chunks c
LEFT JOIN dense  ON dense.id  = c.id
LEFT JOIN sparse ON sparse.id = c.id
WHERE dense.id IS NOT NULL OR sparse.id IS NOT NULL
ORDER BY rrf_score DESC
LIMIT 20;`,
      },
    ],
    lessons: [
      "Retrieval quality dominated model choice by a wide margin. Swapping GPT-4o for a cheaper model changed answer quality less than fixing one bad chunking rule.",
      "Pure vector search is blind to exact tokens. Any corpus with SKUs, error codes, or legal references needs a lexical channel — this is not optional.",
      "RRF is embarrassingly effective for how simple it is. We tried learned fusion weights and got less than a point of MRR over rank-based fusion with k=60.",
      "Prefixing chunks with their heading path was the single highest-ROI change — it cost nothing and lifted conceptual-query hit@5 by 9 points.",
      "Slice your evals by query type. Our aggregate hit rate looked fine at 82% while the identifier slice was silently failing at 61%.",
    ],
  },

  // -------------------------------------------------------------------------
  // 3. Structured prompt evaluation harness
  // -------------------------------------------------------------------------
  {
    slug: "prompt-eval-harness",
    title: "Structured Prompt Evaluation Harness",
    summary:
      "A golden-dataset eval harness with rubric-based LLM-as-judge scoring, so prompt changes ship on evidence instead of vibes.",
    category: "Prompt Engineering",
    status: "prototype",
    stack: [
      "Python",
      "pytest",
      "Claude Sonnet",
      "Pydantic",
      "DuckDB",
      "GitHub Actions",
    ],
    overview: [
      "Every prompt tweak on our extraction pipeline was being validated by eyeballing three examples in a playground. Regressions shipped constantly: a wording change that fixed one customer's invoices broke date parsing for another. The team needed the equivalent of a test suite for prompts — deterministic where possible, judged where necessary.",
      "The harness treats prompts as versioned artifacts with attached golden datasets. Deterministic assertions (JSON validity, required fields, enum membership) run first and are free. Semantic quality — is this summary faithful, is this tone right — goes to an LLM judge scoring against an explicit rubric, one criterion per call, with the judge forced to quote evidence before scoring. Results land in DuckDB so we can diff any two prompt versions across the full dataset in CI.",
    ],
    architecture: [
      "Golden datasets are YAML files colocated with each prompt: input, expected output (for deterministic checks), and rubric criteria (for judged checks).",
      "Stage 1 runs cheap deterministic assertions — schema validity, field presence, regex checks — and fails fast before any judge tokens are spent.",
      "Stage 2 runs an LLM judge per rubric criterion (faithfulness, completeness, tone) with a 1-5 scale, forced to cite verbatim evidence before emitting a score.",
      "Judge outputs are Pydantic-validated; an unparseable judgment is a harness error, never a silent pass.",
      "Every run writes scores to DuckDB keyed by (prompt_version, case_id, criterion); CI comments a score diff table on the PR.",
      "A small human-labeled calibration set measures judge/human agreement (Cohen's kappa) so we know when the judge itself has drifted.",
    ],
    code: [
      {
        title: "Rubric-based judge with forced evidence",
        lang: "python",
        snippet: `class Judgment(BaseModel):
    evidence: str = Field(description="Verbatim quote from the output")
    reasoning: str
    score: int = Field(ge=1, le=5)

JUDGE_PROMPT = """You are grading one criterion only: {criterion}.
Rubric: {rubric}
First quote the exact evidence from the output, then reason,
then score 1-5. Do not grade anything outside this criterion.

<input>{case_input}</input>
<output>{model_output}</output>"""

def judge_criterion(case: EvalCase, output: str, criterion: Rubric) -> Judgment:
    resp = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=500,
        messages=[{"role": "user", "content": JUDGE_PROMPT.format(
            criterion=criterion.name, rubric=criterion.rubric,
            case_input=case.input, model_output=output)}],
    )
    return Judgment.model_validate_json(extract_json(resp))`,
      },
      {
        title: "Version diff query over eval history",
        lang: "sql",
        snippet: `SELECT
  criterion,
  AVG(CASE WHEN prompt_version = 'v14' THEN score END) AS v14,
  AVG(CASE WHEN prompt_version = 'v15' THEN score END) AS v15,
  COUNT(*) FILTER (
    WHERE prompt_version = 'v15' AND score < 3
  ) AS v15_failures
FROM eval_runs
WHERE prompt_version IN ('v14', 'v15')
GROUP BY criterion
ORDER BY (v15 - v14) ASC;`,
      },
    ],
    lessons: [
      "One criterion per judge call. A single 'rate this 1-10 overall' judge compressed every failure mode into a meaningless average; per-criterion scores made regressions legible.",
      "Forcing the judge to quote evidence before scoring cut judge hallucination dramatically — it can't invent a failure it can't quote.",
      "Deterministic checks first, always. Roughly 60% of regressions were caught by free schema/regex assertions before a single judge token was spent.",
      "The golden dataset is the real asset, not the harness. Twenty minutes labeling hard cases beat hours of harness engineering every time.",
      "Calibrate the judge against humans periodically. Ours agreed with human graders at kappa 0.74 initially, then drifted after a model upgrade — without the calibration set we'd never have noticed.",
    ],
  },

  // -------------------------------------------------------------------------
  // 4. MCP server exposing CRM tools
  // -------------------------------------------------------------------------
  {
    slug: "mcp-crm-server",
    title: "MCP Server: CRM Tools for LLM Clients",
    summary:
      "A Model Context Protocol server that exposes a CRM's contacts, deals, and activity timeline as typed tools any MCP client can call safely.",
    category: "MCP",
    status: "prototype",
    stack: [
      "TypeScript",
      "MCP SDK",
      "Node.js",
      "Zod",
      "HubSpot API",
      "OAuth 2.0",
    ],
    overview: [
      "Sales engineers wanted to ask Claude questions like 'what's the state of the Acme renewal?' without copy-pasting CRM screenshots into chat. The obvious anti-pattern is a monster 'query_crm' tool that accepts arbitrary filters — it demos great and fails in practice because the model can't discover what's actually queryable. MCP's typed tool contract is the right shape for this: small, well-described tools with Zod-validated inputs.",
      "The server exposes six read tools and one carefully-gated write tool (log_activity). Read tools return compact, LLM-shaped summaries rather than raw API payloads — a HubSpot deal object is ~4KB of JSON, of which the model needs maybe 200 bytes. The write tool requires an explicit confirmation token generated by a prior read, which turned out to be a simple and effective guard against the model logging activities to the wrong contact.",
    ],
    architecture: [
      "Node.js MCP server over stdio for local clients, with a streamable HTTP transport behind OAuth for the hosted variant.",
      "Six read tools (search_contacts, get_deal, get_pipeline_summary, get_activity_timeline, search_companies, get_contact_context) plus one write tool (log_activity).",
      "Every tool input is a Zod schema; descriptions are written for the model, with concrete examples of good and bad arguments.",
      "Responses are transformed from raw HubSpot payloads into ~10-line text summaries with stable entity IDs the model can pass to follow-up calls.",
      "The write path is two-phase: get_contact_context returns a short-lived confirm_token; log_activity rejects any call without a matching token.",
      "Per-session rate limiting and an audit log of every tool invocation, keyed by the OAuth principal, not the client name.",
    ],
    code: [
      {
        title: "Typed tool registration with Zod",
        lang: "typescript",
        snippet: `server.registerTool(
  "get_deal",
  {
    description:
      "Fetch one deal by ID. Returns stage, amount, close date, " +
      "and the last 3 activities. Use search_contacts first if " +
      "you only have a company or person name.",
    inputSchema: {
      dealId: z.string().regex(/^\\d+$/, "numeric HubSpot deal ID"),
    },
  },
  async ({ dealId }) => {
    const deal = await hubspot.deals.get(dealId);
    const activities = await hubspot.activities.forDeal(dealId, { limit: 3 });
    return {
      content: [
        {
          type: "text",
          text: summarizeDeal(deal, activities), // ~10 lines, not raw JSON
        },
      ],
    };
  }
);`,
      },
      {
        title: "Two-phase write guard",
        lang: "typescript",
        snippet: `const confirmTokens = new Map<string, { contactId: string; exp: number }>();

async function logActivity(args: {
  contactId: string;
  note: string;
  confirmToken: string;
}) {
  const token = confirmTokens.get(args.confirmToken);
  if (!token || token.exp < Date.now()) {
    return errorResult(
      "Invalid or expired confirm token. Call get_contact_context " +
        "first to verify the contact, then retry with its token."
    );
  }
  if (token.contactId !== args.contactId) {
    return errorResult(
      "Token was issued for contact " + token.contactId +
        ", not " + args.contactId + ". Re-verify the contact."
    );
  }
  await hubspot.notes.create(args.contactId, args.note);
  confirmTokens.delete(args.confirmToken);
  return textResult("Activity logged on contact " + args.contactId);
}`,
      },
    ],
    lessons: [
      "Tool descriptions are prompts. Rewriting descriptions with concrete argument examples improved correct tool selection more than any code change.",
      "Return summaries, not payloads. Raw API JSON blew through context budgets and made the model quote irrelevant fields; shaped 10-line summaries fixed both.",
      "Fewer, sharper tools beat one flexible tool. The 'universal query' design failed because the model couldn't discover valid filter combinations.",
      "Error messages must teach. Returning 'call get_contact_context first, then retry' let the model self-correct; a bare 403 produced retry loops.",
      "Gate writes with something the model must earn from a read. The confirm-token handshake eliminated an entire class of wrong-entity writes at near-zero cost.",
    ],
  },

  // -------------------------------------------------------------------------
  // 5. OpenAI Agents SDK order-operations agent
  // -------------------------------------------------------------------------
  {
    slug: "openai-agents-order-ops",
    title: "Order-Operations Agent with Tool Calling and Guardrails",
    summary:
      "An OpenAI Agents SDK agent that handles order lookups, cancellations, and refunds behind layered guardrails — because a refund tool with no ceiling is a career-limiting deploy.",
    category: "AI Agents",
    status: "prototype",
    stack: [
      "OpenAI Agents SDK",
      "Python",
      "GPT-4.1",
      "Pydantic",
      "PostgreSQL",
      "Stripe API",
    ],
    overview: [
      "An e-commerce client wanted to pilot an agent that could resolve the 'where is my order / cancel it / refund it' class of tickets end-to-end. The interesting engineering problem wasn't the happy path — tool calling has been easy for a year — it was making the failure modes boring. What happens when a user social-engineers a refund? When the model misreads an order ID? When Stripe times out mid-refund?",
      "I built it on the OpenAI Agents SDK with three layers of defense: an input guardrail that runs a cheap classifier for prompt-injection and off-topic requests in parallel with the main agent, tool-level invariants enforced in code (refund ceiling, order ownership check, idempotency keys), and an output guardrail that blocks responses promising anything a tool didn't actually do. The prototype resolved 71% of eval scenarios fully autonomously and — more importantly — escalated the rest cleanly instead of improvising.",
    ],
    architecture: [
      "Single agent with five function tools: get_order, get_shipping_status, cancel_order, issue_refund, escalate_to_human.",
      "Input guardrail runs a small classifier model concurrently with the agent; injection or off-topic trips a tripwire that halts the run before any tool executes.",
      "Every mutating tool enforces invariants in code: refunds capped at order total, orders must belong to the authenticated customer, all Stripe calls carry idempotency keys.",
      "Output guardrail cross-checks the final message against the tool-call log — the agent cannot claim 'your refund is processed' unless issue_refund actually returned success.",
      "escalate_to_human is deliberately the easiest tool to call, with the loosest schema, so the agent never has a reason to bluff.",
      "Full run traces (messages, tool calls, guardrail verdicts) persist to Postgres for the eval harness to replay.",
    ],
    code: [
      {
        title: "Agent with input guardrail tripwire",
        lang: "python",
        snippet: `class TriageCheck(BaseModel):
    is_order_related: bool
    injection_detected: bool
    reasoning: str

@input_guardrail
async def order_topic_guardrail(
    ctx: RunContextWrapper[OrderContext], agent: Agent, user_input: str
) -> GuardrailFunctionOutput:
    result = await Runner.run(triage_agent, user_input)
    check = result.final_output_as(TriageCheck)
    return GuardrailFunctionOutput(
        output_info=check,
        tripwire_triggered=check.injection_detected or not check.is_order_related,
    )

order_agent = Agent[OrderContext](
    name="order_ops",
    instructions=ORDER_OPS_PROMPT,
    tools=[get_order, get_shipping_status, cancel_order,
           issue_refund, escalate_to_human],
    input_guardrails=[order_topic_guardrail],
    model="gpt-4.1",
)`,
      },
      {
        title: "Refund tool with code-enforced invariants",
        lang: "python",
        snippet: `@function_tool
async def issue_refund(
    ctx: RunContextWrapper[OrderContext], order_id: str, amount_cents: int, reason: str
) -> str:
    order = await db.get_order(order_id)
    if order is None or order.customer_id != ctx.context.customer_id:
        return "REFUSED: order not found for this customer."
    if amount_cents > order.total_cents:
        return (f"REFUSED: {amount_cents} exceeds order total "
                f"{order.total_cents}. Refund the order total or less.")
    if order.refunded_cents + amount_cents > order.total_cents:
        return "REFUSED: order already partially refunded."
    refund = await stripe.refunds.create(
        payment_intent=order.payment_intent_id,
        amount=amount_cents,
        idempotency_key=f"refund-{order_id}-{amount_cents}",
    )
    await db.record_refund(order_id, amount_cents, refund.id, reason)
    return f"OK: refunded {amount_cents} cents, refund id {refund.id}"`,
      },
    ],
    lessons: [
      "Guardrails belong in code, not prompts. The prompt says 'don't over-refund'; the tool makes it impossible. Only one of these survives an adversarial user.",
      "Make escalation the path of least resistance. Once escalate_to_human had the loosest schema of any tool, bluffed answers on hard cases dropped sharply.",
      "Tool results are prompts too. Returning 'REFUSED: exceeds order total, refund the total or less' let the model recover in one turn; a bare exception string caused flailing.",
      "Idempotency keys on every mutating call are table stakes — agents retry in ways humans don't, and a double refund is not a learning experience you want.",
      "The output guardrail caught the scariest bug class: the agent claiming success for actions it never took. Cross-checking claims against the tool log is cheap insurance.",
    ],
  },

  // -------------------------------------------------------------------------
  // 6. Semantic search over 2M product SKUs with Qdrant
  // -------------------------------------------------------------------------
  {
    slug: "semantic-sku-search-qdrant",
    title: "Semantic Search Over 2M Product SKUs",
    summary:
      "Replaced a brittle Elasticsearch synonym pipeline with Qdrant-backed semantic search over two million SKUs, holding p95 under 80ms with filtered HNSW.",
    category: "Semantic Search",
    status: "production",
    stack: [
      "Qdrant",
      "Python",
      "text-embedding-3-small",
      "FastAPI",
      "Redis",
      "Kafka",
      "Kubernetes",
    ],
    overview: [
      "A marketplace client's product search was keyword-only with a hand-maintained synonym file that had grown to 14,000 lines nobody dared touch. Queries like 'warm jacket for hiking in rain' returned nothing useful because no product title contains those words. Meanwhile 2M SKUs churned at ~50k updates a day, so any solution had to handle continuous reindexing without search downtime.",
      "I built a Qdrant-backed semantic layer: SKU titles, attributes, and category paths are composed into an embedding document, indexed with HNSW, and searched with mandatory payload filters (in-stock, region, category). Semantic results are blended with the existing lexical engine — semantic recall plus keyword precision — behind a single search API. Zero-result queries dropped 38% and add-to-cart from search rose 9% in the A/B test.",
    ],
    architecture: [
      "Kafka consumer ingests product-change events; an embedding worker batches 256 SKUs per call and upserts vectors with full payloads into Qdrant.",
      "Embedding text is a structured composition — title, brand, category path, key attributes — not raw description dumps, which embedded poorly.",
      "Qdrant collection uses HNSW (m=16, ef_construct=200) with payload indexes on category, region, and in_stock for filtered search.",
      "Query path: embed query (cached in Redis at ~35% hit rate), filtered vector search top-50, blend with lexical top-50 via RRF, apply business ranking on the fused list.",
      "Blue/green collection aliases in Qdrant allow full reindexes (embedding model upgrades) with atomic cutover and instant rollback.",
      "Nightly recall job replays the top-1000 queries against a labeled relevance set and alerts if recall@10 drifts more than 2 points.",
    ],
    code: [
      {
        title: "Filtered vector search with payload conditions",
        lang: "python",
        snippet: `async def semantic_search(query: str, region: str, category: str | None, limit: int = 50):
    vector = await embed_cached(query)  # Redis-cached, ~35% hit rate
    conditions = [
        FieldCondition(key="region", match=MatchValue(value=region)),
        FieldCondition(key="in_stock", match=MatchValue(value=True)),
    ]
    if category:
        conditions.append(
            FieldCondition(key="category_path", match=MatchText(text=category))
        )
    hits = await qdrant.query_points(
        collection_name="skus_active",  # alias -> blue or green collection
        query=vector,
        query_filter=Filter(must=conditions),
        search_params=SearchParams(hnsw_ef=128),
        limit=limit,
        with_payload=["sku", "title", "price_cents"],
    )
    return [SkuHit(score=p.score, **p.payload) for p in hits.points]`,
      },
    ],
    lessons: [
      "What you embed matters more than which model embeds it. Structured 'title | brand | category | attributes' documents beat raw descriptions by 12 points of recall@10.",
      "Filter inside the vector store, never after. Post-filtering top-K in application code silently starved narrow categories of results — filtered HNSW fixed it.",
      "Semantic search complements lexical, it doesn't replace it. Users searching exact model numbers still need keyword precision; RRF blending gave us both without a reranking model.",
      "Collection aliases are the deployment primitive. Every embedding-model upgrade was a full reindex, and atomic alias cutover made those a non-event.",
      "Cache query embeddings aggressively. Search queries follow a steep Zipf curve — a 35% embedding-cache hit rate took real latency and cost off the table for free.",
    ],
  },

  // -------------------------------------------------------------------------
  // 7. LangGraph document-approval workflow with HITL interrupts
  // -------------------------------------------------------------------------
  {
    slug: "langgraph-hitl-document-approval",
    title: "Document-Approval Workflow with Human-in-the-Loop Interrupts",
    summary:
      "A LangGraph pipeline that drafts, reviews, and routes contract documents — pausing at interrupt points for human sign-off and resuming days later from a Postgres checkpoint.",
    category: "Orchestration",
    status: "production",
    stack: [
      "LangGraph",
      "Python",
      "Claude Sonnet",
      "PostgreSQL",
      "FastAPI",
      "React",
    ],
    overview: [
      "A professional-services firm generated ~200 client-facing contract amendments a month through a copy-paste-from-last-time process. They wanted LLM drafting, but with an absolute constraint: no document reaches a client without named-human approval, and legal wanted the approval step auditable. This is a workflow-orchestration problem wearing an AI costume — the drafting is the easy 20%.",
      "LangGraph's interrupt/resume model fit exactly. The graph drafts an amendment, runs an automated compliance-check node, then hits an interrupt() and parks. The full state checkpoints to Postgres; a reviewer gets a task in their queue and might not act for three days. When they approve, edit, or reject, the graph resumes from the exact node it paused at — no state reconstruction, no duplicate drafts. Rejections loop back to redrafting with the reviewer's comments injected into context.",
    ],
    architecture: [
      "Five-node graph: extract_terms -> draft_amendment -> compliance_check -> human_approval (interrupt) -> finalize_and_send.",
      "interrupt() at the approval node surfaces a payload (draft, diff vs. template, compliance flags) to a React review UI; the graph thread parks indefinitely.",
      "PostgresSaver checkpoints every node transition; a resumed run days later carries full message history and intermediate state.",
      "Reviewer actions map to Command(resume=...) values: approve proceeds, edit proceeds with the human's text replacing the draft, reject loops to draft_amendment with comments appended.",
      "compliance_check is deterministic code plus one LLM pass — regex-verified clause presence first, then a model check for tone and prohibited commitments.",
      "Every transition is written to an audit table (who, what, when, which checkpoint), which is what actually got legal to sign off on the system.",
    ],
    code: [
      {
        title: "Interrupt-based approval node",
        lang: "python",
        snippet: `def human_approval(state: AmendmentState) -> Command:
    decision = interrupt({
        "draft": state["draft"],
        "diff_vs_template": state["template_diff"],
        "compliance_flags": state["compliance_flags"],
        "client": state["client_name"],
    })
    # Execution parks here; resumes when a reviewer acts, possibly days later.
    if decision["action"] == "approve":
        return Command(goto="finalize_and_send",
                       update={"approved_by": decision["reviewer_id"]})
    if decision["action"] == "edit":
        return Command(goto="finalize_and_send",
                       update={"draft": decision["edited_text"],
                               "approved_by": decision["reviewer_id"]})
    return Command(goto="draft_amendment",
                   update={"revision_notes": decision["comments"],
                           "revision_count": state["revision_count"] + 1})

graph.add_node("human_approval", human_approval)
app = graph.compile(checkpointer=PostgresSaver(pool))`,
      },
      {
        title: "Resuming a parked thread from the API",
        lang: "python",
        snippet: `@router.post("/amendments/{thread_id}/decision")
async def submit_decision(thread_id: str, decision: ReviewerDecision):
    config = {"configurable": {"thread_id": thread_id}}
    snapshot = await app.aget_state(config)
    if not snapshot.next or "human_approval" not in snapshot.next:
        raise HTTPException(409, "Thread is not awaiting approval.")
    result = await app.ainvoke(
        Command(resume=decision.model_dump()),
        config=config,
    )
    await audit_log.record(
        thread_id=thread_id,
        reviewer=decision.reviewer_id,
        action=decision.action,
        checkpoint_id=snapshot.config["configurable"]["checkpoint_id"],
    )
    return {"status": result["status"]}`,
      },
    ],
    lessons: [
      "Human-in-the-loop is a state-management problem, not a UI problem. Durable checkpoints that survive a three-day reviewer delay were the actual hard requirement.",
      "Design the rejection loop as carefully as the happy path. Injecting reviewer comments into the redraft context made revision two dramatically better than revision one.",
      "Cap revision loops in the graph. We hit a draft-reject-draft oscillation between the model and one picky reviewer; after three cycles it now escalates to a senior human.",
      "Run deterministic compliance checks before the LLM pass. Regex-verified clause presence is free and catches the failures that would embarrass you most.",
      "The audit trail sold the system. Legal approved it because every document had a named approver and a replayable checkpoint chain — the AI quality was secondary to them.",
    ],
  },

  // -------------------------------------------------------------------------
  // 8. Token-streaming LLM gateway with fallback routing
  // -------------------------------------------------------------------------
  {
    slug: "llm-gateway-fallback-routing",
    title: "Token-Streaming LLM Gateway with Fallback Routing",
    summary:
      "A TypeScript gateway that normalizes streaming across Anthropic, OpenAI, and Bedrock, with health-scored fallback routing so one provider's bad day isn't ours.",
    category: "LLM Systems",
    status: "production",
    stack: [
      "TypeScript",
      "Node.js",
      "Hono",
      "Redis",
      "Anthropic API",
      "OpenAI API",
      "AWS Bedrock",
    ],
    overview: [
      "By the time we had six internal products calling LLMs, every team had reimplemented retries, streaming parsers, and provider fallbacks — differently and mostly wrong. A provider incident meant six emergency deploys. The gateway consolidates this: one internal API, SSE streaming normalized to a common event shape, per-model fallback chains, and centralized usage accounting per team.",
      "The design center is streaming-aware failover. Non-streaming fallback is trivial; the hard case is a stream that dies 40 tokens in. The gateway buffers the head of each stream briefly and, if a provider fails before first token (the common failure mode), silently retries the next provider in the chain. Mid-stream failures surface an explicit error event with a retry hint rather than pretending the truncated answer was complete — silent truncation was the one failure mode product teams said they could never tolerate.",
    ],
    architecture: [
      "Hono-based Node service exposing one /v1/chat endpoint; provider adapters translate a canonical request into Anthropic, OpenAI, or Bedrock wire formats.",
      "Each logical model maps to an ordered fallback chain (e.g. claude-sonnet -> bedrock-claude -> gpt-4.1) defined in config, not code.",
      "Health scores per provider live in Redis: rolling error rate and p95 first-token latency; a provider breaching thresholds is skipped for a cooldown window (circuit breaker).",
      "Pre-first-token failures fail over transparently; mid-stream failures emit a typed error event — the gateway never silently truncates.",
      "Every request logs tokens in/out, cost, latency, and fallback depth to a usage table keyed by team API key.",
      "Prompts never persist in the gateway — it logs metadata only, which kept the security review to one meeting.",
    ],
    code: [
      {
        title: "Fallback chain with pre-stream failover",
        lang: "typescript",
        snippet: `async function* streamWithFallback(
  req: ChatRequest,
  chain: ProviderTarget[]
): AsyncGenerator<GatewayEvent> {
  let lastError: Error | undefined;
  for (const target of chain) {
    if (await circuitBreaker.isOpen(target.id)) continue;
    try {
      const stream = adapters[target.provider].stream(req, target.model);
      let firstToken = false;
      for await (const event of stream) {
        firstToken = true;
        yield { ...event, provider: target.id };
      }
      return; // completed cleanly
    } catch (err) {
      lastError = err as Error;
      await circuitBreaker.recordFailure(target.id);
      if (hasYieldedTokens(err)) {
        // Mid-stream death: never silently retruncate onto another provider.
        yield { type: "error", recoverable: true, message: "stream interrupted" };
        return;
      }
      // Pre-first-token failure: fall through to next target.
    }
  }
  yield { type: "error", recoverable: false, message: String(lastError) };
}`,
      },
      {
        title: "Redis-backed circuit breaker",
        lang: "typescript",
        snippet: `const WINDOW_SEC = 60;
const ERROR_THRESHOLD = 0.25;
const COOLDOWN_SEC = 30;

async function recordFailure(providerId: string): Promise<void> {
  const key = "cb:" + providerId;
  await redis
    .multi()
    .hincrby(key, "failures", 1)
    .hincrby(key, "total", 1)
    .expire(key, WINDOW_SEC)
    .exec();
  const stats = await redis.hgetall(key);
  const rate = Number(stats.failures) / Math.max(Number(stats.total), 1);
  if (rate > ERROR_THRESHOLD && Number(stats.total) >= 10) {
    await redis.set("cb:open:" + providerId, "1", "EX", COOLDOWN_SEC);
  }
}`,
      },
    ],
    lessons: [
      "Almost all provider failures happen before the first token. Optimizing for pre-stream failover covered ~95% of incidents; mid-stream recovery wasn't worth its complexity.",
      "Never silently truncate. Product teams unanimously preferred an explicit error event over a plausible-looking half answer — trust is the actual product of a gateway.",
      "Provider 'compatible' APIs aren't. Tool-call deltas, stop reasons, and token accounting differ subtly across Anthropic, OpenAI, and Bedrock; the adapter layer is where the real work lives.",
      "Fallback chains in config, not code. Incident response became 'edit a YAML file and watch recovery' instead of an emergency deploy.",
      "Centralized token accounting changed team behavior more than any optimization — the first per-team cost dashboard triggered three prompt-efficiency refactors in a week.",
    ],
  },

  // -------------------------------------------------------------------------
  // 9. A2A task delegation protocol experiment
  // -------------------------------------------------------------------------
  {
    slug: "a2a-task-delegation",
    title: "Agent-to-Agent Task Delegation Protocol",
    summary:
      "A research spike on A2A-style delegation: opaque agents advertising capability cards, negotiating tasks, and reporting results across trust boundaries.",
    category: "AI Agents",
    status: "research",
    stack: [
      "Python",
      "A2A Protocol",
      "FastAPI",
      "LangGraph",
      "JSON-RPC",
      "OpenTelemetry",
    ],
    overview: [
      "Multi-agent frameworks assume all agents live in one process, one codebase, one trust domain. The more interesting (and realistic) enterprise question is delegation across boundaries: our procurement agent asking a supplier's quoting agent for pricing, where neither side sees the other's internals. I ran a research spike implementing A2A-style delegation between deliberately opaque agents to find out where the protocol abstraction actually holds up.",
      "The setup: a 'requester' orchestration agent and two 'contractor' agents (data-analysis, document-drafting) that publish capability cards, accept task proposals, and stream status updates over JSON-RPC. Each contractor is internally a LangGraph app, but the requester only sees the protocol surface. The core finding: lifecycle and discovery are the easy parts — the unsolved problems are semantic capability matching, calibrated trust in self-reported results, and cost/latency negotiation before committing to a delegation.",
    ],
    architecture: [
      "Each agent serves a capability card at a well-known endpoint: skills, input/output modes, auth requirements, and declared latency class.",
      "Task lifecycle is a small state machine — submitted -> working -> input-required | completed | failed — with the requester polling or subscribing to status events.",
      "Contractors are opaque: the requester sees task status and artifacts only, never internal reasoning, tools, or model choice.",
      "The requester keeps a per-contractor scorecard (result-acceptance rate, deadline adherence) and biases future routing toward higher-scoring contractors.",
      "Artifacts are typed and hashed; the requester independently validates schema and spot-checks results rather than trusting contractor self-grades.",
      "OpenTelemetry traces propagate a delegation ID across both sides, which proved essential for debugging cross-agent failures.",
    ],
    code: [
      {
        title: "Capability card and task submission",
        lang: "python",
        snippet: `AGENT_CARD = {
    "name": "quote-analysis-agent",
    "version": "0.3.0",
    "skills": [
        {
            "id": "analyze_supplier_quotes",
            "description": "Compare supplier quotes on price, lead time, "
                           "and contract-term risk. Input: quote PDFs or "
                           "structured line items. Output: ranked comparison.",
            "input_modes": ["application/pdf", "application/json"],
            "output_modes": ["application/json"],
            "latency_class": "minutes",
        }
    ],
    "auth": {"schemes": ["bearer"]},
}

async def delegate_task(contractor_url: str, skill_id: str, payload: dict) -> Task:
    resp = await rpc_client.call(contractor_url, "tasks/send", {
        "skill_id": skill_id,
        "message": {"role": "user", "parts": [{"type": "data", "data": payload}]},
        "metadata": {"delegation_id": current_trace_id(),
                     "deadline": iso_in(minutes=10)},
    })
    return Task.model_validate(resp)`,
      },
      {
        title: "Independent validation of contractor results",
        lang: "python",
        snippet: `async def accept_result(task: Task, artifact: Artifact) -> Verdict:
    # 1. Structural: does the artifact match the skill's declared schema?
    try:
        report = QuoteComparison.model_validate(artifact.data)
    except ValidationError as e:
        return Verdict.reject(f"schema violation: {e.error_count()} errors")

    # 2. Sanity invariants a wrong-but-plausible result would break.
    if report.recommended.total_cost > min(q.total_cost for q in report.quotes):
        return Verdict.reject("recommended quote is not cost-minimal "
                              "and no risk justification was provided")

    # 3. Spot-check one line item against the source document ourselves.
    sample = random.choice(report.quotes)
    extracted = await extract_line_total(task.source_docs[sample.doc_id])
    if abs(extracted - sample.total_cost) / extracted > 0.02:
        return Verdict.reject(f"spot-check mismatch on {sample.doc_id}")

    scorecard.record_acceptance(task.contractor_id)
    return Verdict.accept(report)`,
      },
    ],
    lessons: [
      "Capability discovery is the weakest link. Matching a task to a skill description is itself an LLM judgment call, and a vague capability card poisons everything downstream.",
      "Never trust a contractor's self-grade. Independent schema validation plus cheap spot-checks caught every bad result our injected-fault tests produced; self-reports caught none.",
      "Deadlines and cost must be negotiated before delegation, not discovered after. The protocol needs an estimate phase — we bolted one on and it changed routing decisions materially.",
      "Opaque agents make debugging brutal without shared trace IDs. Propagating one delegation ID through both sides' telemetry was the difference between debugging and guessing.",
      "The protocol is the easy 30%. State machines and JSON-RPC are solved; calibrated trust between organizations is the actual research frontier, and it looks more like vendor management than computer science.",
    ],
  },

  // -------------------------------------------------------------------------
  // 10. Milvus vs pgvector vs Qdrant benchmark
  // -------------------------------------------------------------------------
  {
    slug: "vector-db-benchmark-enterprise-rag",
    title: "Milvus vs pgvector vs Qdrant: An Enterprise RAG Benchmark",
    summary:
      "A reproducible benchmark of three vector stores under realistic enterprise RAG conditions — metadata filters, concurrent writes, and multi-tenancy — not just raw ANN throughput.",
    category: "Semantic Search",
    status: "research",
    stack: [
      "Milvus",
      "pgvector",
      "Qdrant",
      "Python",
      "Locust",
      "Docker Compose",
      "Grafana",
    ],
    overview: [
      "Public vector-DB benchmarks mostly measure unfiltered ANN search on static datasets — conditions that describe approximately zero enterprise RAG deployments. Real workloads have tenant-scoped filters on every query, continuous ingestion, and a p99 SLA. Before recommending a store for a client's 40M-chunk RAG platform, I benchmarked Milvus, pgvector, and Qdrant under those conditions with a fully reproducible harness.",
      "Setup: 10M chunks (1536-dim), 200 simulated tenants with skewed sizes, every query filtered by tenant, and three load profiles (read-only, 90/10 read/write, bulk-reindex-during-reads). Headline finding: the raw-speed ranking inverted under filters and write load. pgvector was slowest at pure ANN but its filtered p99 was the most stable, and its operational story (it's just Postgres) is a feature no benchmark chart captures. Qdrant gave the best filtered-recall/latency balance; Milvus won bulk ingestion and scale-out headroom but cost the most operational attention.",
    ],
    architecture: [
      "Dockerized harness pins versions and resources (8 vCPU / 32GB per store) with identical HNSW-equivalent parameters where tunable.",
      "Corpus generator produces 10M chunks across 200 tenants with a Zipf size distribution — tenant skew is where filtered indexes go to die.",
      "Locust drives three profiles: read-only search, 90/10 read/write, and reads during a bulk reindex; each run is 30 minutes after warm-up.",
      "Ground truth from exact brute-force search on a 10k query sample; recall@10 computed per run so latency numbers are never quoted without their recall.",
      "All metrics (p50/p95/p99, recall, ingest rate, RSS memory) scrape into Prometheus/Grafana with one dashboard per store.",
      "Results tables are generated from raw run data by script — no hand-transcribed numbers anywhere in the report.",
    ],
    code: [
      {
        title: "Tenant-filtered query, one adapter per store",
        lang: "python",
        snippet: `class QdrantAdapter(VectorStoreAdapter):
    async def search(self, q: BenchQuery) -> BenchResult:
        t0 = time.perf_counter()
        hits = await self.client.query_points(
            collection_name="bench",
            query=q.vector,
            query_filter=Filter(must=[FieldCondition(
                key="tenant_id", match=MatchValue(value=q.tenant_id))]),
            limit=10,
            search_params=SearchParams(hnsw_ef=self.ef_search),
        )
        latency_ms = (time.perf_counter() - t0) * 1000
        return BenchResult(
            ids=[p.id for p in hits.points],
            latency_ms=latency_ms,
            recall=recall_at_k(q.ground_truth, [p.id for p in hits.points], k=10),
        )`,
      },
      {
        title: "pgvector: partial-index-per-large-tenant strategy",
        lang: "sql",
        snippet: `-- Global HNSW index for the long tail of small tenants.
CREATE INDEX chunks_embedding_hnsw ON chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200);

-- The 5 largest tenants (> 500k chunks each) get partial indexes,
-- which kept their filtered p99 from collapsing under skew.
CREATE INDEX chunks_tenant_acme_hnsw ON chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200)
  WHERE tenant_id = 'acme';

SET hnsw.ef_search = 128;
SELECT id, content
FROM chunks
WHERE tenant_id = 'acme'
ORDER BY embedding <=> $1::vector
LIMIT 10;`,
      },
    ],
    lessons: [
      "Benchmark your workload, not the vendor's. Every headline ranking inverted once tenant filters and concurrent writes entered the picture.",
      "Never report latency without recall. Two stores at 'p95 = 40ms' were incomparable until we saw one was running at 0.99 recall and the other at 0.91.",
      "Filtered search is the great equalizer. HNSW graph traversal under selective filters degrades in store-specific ways that no unfiltered benchmark predicts.",
      "Operational cost belongs in the results table. pgvector 'lost' on speed but a three-person team already running Postgres ships it months earlier than a new distributed system.",
      "Tenant skew breaks naive strategies. The Zipf distribution mattered more than corpus size — per-large-tenant partial indexes in pgvector and per-tenant payload indexes in Qdrant were the difference between stable and pathological p99s.",
    ],
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((e) => e.slug === slug);
}
