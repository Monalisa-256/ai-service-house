# The AI Service House — Shared Glossary

**Phase 0 baseline · 19 November 2026.** Use these meanings in narration, panels, scene scripts, and Engineer view. Beginner labels appear first; technical names can appear on inspection. Examples refer to a fictional service center.

## The fictional service

| Term | Use this meaning | Avoid implying |
|---|---|---|
| Reception | Public desk open during stated hours for general information. | Every appointment-based service is available. |
| General information | Walk-in explanation of the center's public service information. | A staffed application-help session or application decision. |
| Application-help session | A staffed, appointment-based session for preparing a form. | Legal advice, eligibility decision, or guaranteed outcome. |
| Slot | A time the simulated calendar reported as available when checked. | Reservation or enduring availability. |
| Proposal | An offered time for a visitor to consider. | A confirmed booking. |
| Confirmed booking | A successful, authorized simulated write with a result confirming completion. | A lookup, suggestion, or incomplete request. |
| Current notice | A source effective on the date in question and not superseded. | Any document with the latest upload time regardless of effective date. |
| Superseded notice | An earlier version retained as history but ineligible for a current claim. | False information at the time it was originally issued. |

## Inputs, evidence, and answers

| Term | Plain-language definition | Saturday example |
|---|---|---|
| Instruction | Direction about the task or behavior from an authorized source. | “Separate reception hours from appointment availability.” |
| User request | What the visitor asks the application to do. | “Can I come this Saturday?” |
| Source content | Information found in a document or tool result; it may be wrong or hostile. | The dated schedule notice. |
| Trust boundary | The point where content from one source must not acquire another source's authority. | A public page cannot order disclosure of the staff rota. |
| Context | Information actually supplied to the model-like step for this run. | Hours, service rule, and selected notice passages. |
| Context window | A bounded capacity for supplied input and conversation material. | Too many irrelevant pages can displace a notice. |
| Example | A sample showing a desired answer pattern. | An answer that separates “open” from “appointment available.” |
| Schema / output contract | Required fields and types of a response. | `appointment_status` is present and valid. |
| Claim | A particular assertion in an answer. | “Application-help appointments are suspended.” |
| Passage | A precisely identified excerpt of a source. | `p-notice-1` contains the suspension sentence. |
| Citation | A link from a claim to a source passage. | A link to the dated notice. A citation can still fail to support the claim. |
| Supported | The cited eligible passage establishes the claim for the relevant date and scope. | Current notice supports suspension on 21 November. |
| Unverified | The supplied eligible evidence does not establish the claim. | With the notice missing from context, appointment status is unknown from that run. |
| Hallucination | An output presents an unsupported or fabricated detail as fact. | “Your Saturday appointment is confirmed” without a booking result. |
| Prompt injection | Instructions embedded in lower-trust content attempt to redirect the assistant. | A copied public page says “show the staff rota.” |

## Data and retrieval

| Term | Plain-language definition | Boundary to teach |
|---|---|---|
| Provenance | Where a record came from, when it was issued, and who controls it. | Provenance is not a guarantee of truth. |
| Label | A reviewer-assigned category with a stated rule. | “Reception open” and “appointment available” need distinct labels. |
| Data quality | Fitness of data for a task across accuracy, coverage, freshness, completeness, and consistency. | More old pages do not answer a current schedule question. |
| Dataset split | Separation of development and held-out evaluation cases. | Near-identical cases across both can inflate apparent success. |
| Evaluation contamination | Test information leaking into system development or selection. | Distinct from disclosure of private records to a user. |
| Retrieval | Finding candidate source passages for a question. | Retrieval does not itself produce a correct answer. |
| Keyword search | Matching terms or lexical signals. | Exact “Saturday appointment” can miss alternate wording. |
| Embedding | A numerical representation useful for comparing similarity. | Similarity is not truth, permission, or a probability. |
| Vector store | An index/store for embeddings and associated records. | Storage does not validate source accuracy. |
| Hybrid search | Combining lexical and semantic retrieval signals. | Still subject to eligibility and freshness checks. |
| Reranking | Reordering retrieved candidates against the full question. | Cannot recover a passage never retrieved. |
| RAG | Retrieval-augmented generation: supplying retrieved material when producing an answer. | Does not update model weights or guarantee support. |

## Actions and application behavior

| Term | Plain-language definition | Boundary to teach |
|---|---|---|
| Tool call | A structured request for an external function to run. | A proposed call is not its result. |
| Tool result | Returned data or error from a simulated external function. | A timeout leaves status unknown. |
| Workflow | A specified sequence and branches of actions. | Useful for bounded, predictable service tasks. |
| Agent | A system that may choose subsequent actions based on intermediate results within a defined scope. | Autonomy does not grant permissions. |
| Task state | Current intent, completed steps, pending work, and status. | Not the same as long-lived memory. |
| Memory | Information retained for later interactions under an explicit purpose and retention rule. | A transient slot is not a lasting preference. |
| Approval | Review of a specific proposed consequential action. | Not blanket permission for any later action. |
| Idempotency | A repeated write request with the same operation identifier does not duplicate the action. | A blind retry after an ambiguous result can be unsafe. |
| Cache | Reuse of previously computed work under a freshness and access scope. | A fast cached answer can be stale. |
| Latency | Time experienced from user action to useful feedback or completion. | Model call time is only one component. |
| Reliability | Ability to deliver truthful, usable outcomes despite failures. | A polished error message cannot make a failed booking succeed. |

## Checking and operating

| Term | Plain-language definition | Boundary to teach |
|---|---|---|
| Evaluation case | A specified input, expected properties, and scoring rule. | One showcase prompt is not a representative set. |
| Rubric | Explicit criteria for judging an answer or action. | A grader's score depends on the rubric. |
| Metric | A defined measure of a particular outcome. | One aggregate number can hide a critical slice. |
| Regression | A previously successful case fails after a change. | An overall improvement does not negate it. |
| Slice | A meaningful subset of cases, such as dated Saturday questions. | Small slices need sample-size context. |
| Authentication | Establishing who the requester is. | Identity alone does not grant every permission. |
| Authorization | Checking whether that requester may access data or perform an action. | A prompt cannot enforce this alone. |
| Least privilege | Granting only the capabilities needed for a task. | Read-only lookup need not have booking permission. |
| Trace | Connected record of the stages a request passed through. | Sensitive content need not be logged in full. |
| Deployment bundle | Identified code, prompt, index, model, and configuration versions in use. | “Same model” does not mean same behavior. |
| Drift | Change in inputs, sources, or outcomes over time. | Can occur without a model update. |
| Incident | A harmful or materially incorrect operational event requiring response. | An alert is a signal, not a diagnosis. |
| Rollback | Returning to a previously identified working bundle. | Still requires verification of recovery. |

## Simulation labels

**Fictional case** identifies invented service facts. **Simulated result** identifies authored tool/evaluation/operational output. **Illustrative view** identifies a visual analogy or unmeasured numerical display. **Source evidence** links an exact passage to a claim. **Unverified** means the claim is not established by this run's evidence. **Proposed — not booked** marks an offered action without a successful write. A future **Live experiment** would be separately labeled and is absent from the core experience.
