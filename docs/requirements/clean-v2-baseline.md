---
type: requirements
status: commit
date: 2026-10-13
author: "Naoki KIMURA (owner adoption); Codex (prepared text)"
context: "Owner-approved wording; normal integration and review-input verification are separate acceptance steps"
---

# Clean v2 reconstruction and acceptance baseline

The proposed canonical location is `flair-agency/live-agency-domain`, branch `main`, path `docs/requirements/clean-v2-baseline.md`. Work-branch versions remain proposals; they take effect only through owner adoption of the exact content and normal integration under the predecessor's review conditions. The authorized publication of the preceding Draft is not adoption of this package. Work-branch text and the proposed authority registration cannot supply authority for their own review. The [architecture index](../architecture/overview.md) locates responsibility boundaries; [contexts](../domain/contexts.md), [ownership](../architecture/ownership.md) and [contributor guidance](../governance/contributing.md) retain their own scopes.

# Clean reconstruction

Discard the old implementation as the construction basis. Reconstruct the selected use case from adopted current business requirements, responsibility boundaries and acceptance conditions. Preserve verified current knowledge and necessary business data; code existence, historical deployment and old test success are evidence to examine, not requirements to reproduce.

Do not automatically retain old API/CLI compatibility, adapters, fallback routes, dual-running machinery, old/new output comparison, internal data shapes, exact golden hashes, package graphs or old deployment rollback. A current business, data, audit, retention or explicitly adopted recovery requirement must justify any retained obligation. Such an obligation does not make the old implementation the new design.

Before a destructive transition, protect required business data and verify that retained exports and evidence can actually be read. Check necessary non-row content such as attachments, links, option meanings and history. Do not turn this protection into a requirement to transform or migrate every legacy row before reconstruction.

Classify sources and rights before publication. Abstraction, renamed labels, synthetic values, an MIT license, or prior public availability do not alone establish permission to publish organization-owned or protected knowledge. Exact source content and history require their own review. Keep private originals, mappings, identifiers, credentials and operational evidence with their authorized owners.

# Selection and protected effects

Bind each protected operation to an explicitly selected actor, environment, target, resource scope, operation and compatible component/configuration identities. Missing, ambiguous, changed, unauthorized or incompatible selection stops before the effect. An installed package, ambient credential, browser state or nearby environment is not a selection.

Treat reads, writes, deletion, scheduling and activation as distinct authority. Source integration, package publication, installation, a successful read, synthetic execution or an equal calculation do not grant an adjacent operation.

Validate the inputs, identities, period, coverage, freshness, limits and completeness required by the owning contract. Preserve unavailable and unknown facts instead of manufacturing defaults. Concrete monetary policy, rounding, matching, accounting representation and organization correspondence belong to the applicable owning contracts; this architecture baseline selects none of them.

Where the workflow requires approval, present concrete effects and bind the approval to the exact actor, target, operations, plan and evidence identities. Relevant drift invalidates or requires rebinding of that approval. Honor unchanged valid prior authorization within its original scope.

Distinguish completed, partial and unknown effects using service-level results as well as transport outcomes. An API error returned as ordinary tool text is still an error. Reconcile uncertain writes through bounded readback under the same authority; do not blindly replay a write or restart a completed part of a multi-step sequence.

Verification and recovery follow the risk and the owning capability. Idempotency, concurrency, retries, monetary effects, attachment handling and detailed readback are contract-specific. Do not impose a universal prepared intent, dual hashes, replay journal or strongest guarantee solely because a different capability needs it.

# Acceptance evidence

| Level | Evidence required within the selected scope |
| --- | --- |
| Business contract | Intended user/outcome, terms, exclusions, neutral inputs/results, decision rationale, representative examples, approval, stop and completion conditions. A qualified human can explain or take over the work. |
| Component conformance | Skill tests use neutral synthetic inputs and selected test implementations; Provider conformance does not install Skill implementation. Success and relevant ambiguity, unavailable, incomplete, stale, unauthorized and uncertain cases follow the current contract. Distributed instructions/resources are present. |
| Selected-environment integration | Fixed compatible versions and an explicitly selected actor/resource/operation composition work together. Missing or mismatched selection stops. Actual normalization, scope/completeness and safe failure are verified within authorized bounds. |
| Production acceptance | The selected installation/configuration, authority and required approval are recorded. The workflow achieves its intended bounded outcome, readback and human recovery requirements without unresolved partial or unknown effects. |

Evidence at one level does not prove another. A merged PR, published package, passing CI, successful model review or installed Skill does not establish production business completion. A workflow may remain explicitly unselected without being called accepted or retired.

For host qualification, record the actual host/version/build, evidence time, selected immutable artifact, resolved installation identity, discovery, loading, invocation, required resource reading, result/readback and relevant removal/recovery. Command-line or filesystem tests do not prove that ChatGPT Work loaded or invoked the same artifact. Historical host evidence applies only to its observed version, content and scope.

Source merge, package publication, environment installation, production activation and business end-to-end acceptance are separate states. Development in Codex, local Work and Cloud Work evidence must be distinguished.

# Human takeover and scope

Keep purpose, inputs, reasoning, procedure, correct-result recognition, stop conditions, evidence custody and recovery readable without hidden chat history or one model. Keep references to canonical owners instead of maintaining competing copies. Automated checks or an AI's own assertion do not prove human comprehension.

Missing evidence stops only the affected decision or operation. Retain a truthful checkpoint and permit independent authorized preparation. Neither an unresolved detail nor a historical queue makes all old components, workflows or strongest quality mechanisms prerequisites for the selected clean-v2 slice.
