---
type: architecture
status: pending
date: 2026-10-13
author: "Codex (local reconciliation draft)"
context: "Public wording candidate derived from adopted responsibilities; not adopted or approved for publication"
---

# Clean v2 architecture overview

This local candidate is an index and bounded responsibility statement. It is not canonical authority, a selected execution composition, or publication permission. The companion [clean-v2 baseline](../requirements/clean-v2-baseline.md) is also a candidate. Source and disclosure reconciliation are retained outside the public candidate.

# Meaning and execution

LIVE Agency distinguishes [Creator Scouting, Creator Management, and Expense and Accounting](https://github.com/flair-agency/live-agency-domain/blob/de01aac5f82260ed1c7436ba0ed5ab9c21388950/docs/domain/contexts.md). Each context retains its business facts and authority. Observations, agency judgments, operational estimates, and accounting records are different kinds of information.

Start a Skill from an agency use case: its intended outcome, neutral facts, decisions, completion conditions, safe stops, and human takeover. Then identify the capabilities needed to realize that use case. An available API, screen, tool, or existing implementation does not define the business workflow.

| Responsibility | Owner and boundary |
| --- | --- |
| Agency domain and use cases | Reviewed, publishable cross-platform meanings and invariants. |
| Skill | Business workflow, neutral inputs/results, decisions, applicable approval, completion, verification, safe stop and human takeover. |
| Platform knowledge | Concrete platform meaning and its correspondence to agency concepts. Protected or publication-uncertain knowledge stays with its private owner. |
| Organization knowledge | Company-specific choices and durable service mappings. A company's choice is not a universal agency invariant. |
| Capability contract | Observable operation-specific input, result, absence, failure and conformance semantics. Quality requirements follow the capability and business effect. |
| Provider | Service operations, acquisition, representation normalization, authentication checks and versioned operating knowledge. It implements the consumer's requirements without inventing competing business definitions. |
| Selected environment and execution composition | Compatible versions, actor, credential references, resources, operations, invocation and execution handoff. The actual owner and mechanism must be explicitly selected. |
| Host and optional MCP adapter | Verified discovery, installation, schema and invocation mechanisms. These mechanisms do not choose business meaning, authority, or whether an effect completed. |

These are semantic responsibilities. They do not require one repository, package, process, or service per row. Skills and Providers use compatible neutral contracts; a Provider must not depend on Skill implementation to acquire a contract. Shared code has only the responsibility genuinely common to its consumers.

Three descriptions remain distinct: a logical business schema describes facts and invariants; a service mapping describes their representation in a service; a selected resource binding identifies the actual resources and credential references. Reading service metadata does not establish business meaning or select an execution binding.

The adopted public [ownership boundary](https://github.com/flair-agency/live-agency-domain/blob/de01aac5f82260ed1c7436ba0ed5ab9c21388950/docs/architecture/ownership.md) owns disclosure and private-owner separation. This index does not create another private mapping or publish private companion sources.

# Execution and distribution

Available capabilities are different from an installed and explicitly selected composition. Install only what the selected use case needs, with fixed compatible identities and the instructions/resources needed by the operator. Source ownership, package boundaries, installation, and production activation are separate decisions.

Public source checkout and basic checks must not require private Gitlinks or private sibling source. Authorized private artifacts and knowledge are selected through the consuming environment's reviewed contracts and versions. A development link or source checkout is not proof of an independently installed production artifact.

Module operations and instruction handoffs are different execution forms. A human or AI follows instruction resources with the selected host's tools; instruction text is not code to evaluate. Results must correspond to the original selected request and scope. This principle does not specify a new loader, invocation envelope, journal, or generic workflow engine.

Development evidence from Codex and production evidence from the selected local ChatGPT Work host have distinct scopes. A project association or product mode is not a credential or sandbox boundary. Cloud Work is a separate target whose support must be established independently.

Plugin/MCP is a candidate host boundary. Transfer a discovery, installation, invocation, authentication or execution-state responsibility only when evidence for the selected host/version and a reviewed contract identifies what replaces, retains or defers it. Do not copy an old Runtime or implement a second resolver/catalog merely because either is available.

The existing [artifact-specific distribution guide](https://github.com/flair-agency/live-agency-domain/blob/de01aac5f82260ed1c7436ba0ed5ab9c21388950/docs/architecture/plugin-distribution.md) records its own procedure and limits. It is not the general execution design or proof that a business Skill has completed.

# Release and acceptance boundary

Clean v2 reconstructs from adopted current requirements and verified knowledge. Legacy code, APIs, internal shapes, package graphs, fixtures, golden hashes and deployment history do not define the target. The [candidate baseline](../requirements/clean-v2-baseline.md) separates business contract, component conformance, selected-environment integration and production acceptance.

The release goal is justified ownership and source/package placement, an operable selected composition, and at least one owner-selected Skill completing its bounded production outcome through that architecture. Complete migration of all old workflows or repositories is not a prerequisite.

# Architecture review

Architecture review is read-only semantic assessment: responsibility, authority, capability surface, dependency direction, minimality, scope and replaceability. Its temporary clean-v2 overlay checks the reconstruction baseline and legacy contamination. Explicit local review and protected PR review serve different checkpoints; automatic prompt hooks are not part of the adopted control.

The consumer owns its selected authority, review policy and decision contract. A shared reviewer mechanism does not own the consumer's architecture. A successful review is architecture evidence; it does not grant disclosure, publication, installation, credentials, activation or business-operation authority. Follow the adopted [contributor and adoption guidance](https://github.com/flair-agency/live-agency-domain/blob/de01aac5f82260ed1c7436ba0ed5ab9c21388950/docs/governance/contributing.md).

This candidate is not a selected AGK member. References from an index do not themselves prove that a required document was materialized and applied by the reviewer.

# Decisions that remain open

| Question | Required decision or evidence |
| --- | --- |
| Exact Work execution/composition owner and mechanism | Identify retained, replaced and deferred responsibilities under a separately reviewed selected route. |
| Concrete package names, count and graph for that route | Derive them from the selected responsibilities and dependencies, not old layout or semantic arrows. |
| Business pilot and operational binding | Select its current business contract, versions, actor, resources, permitted operations and acceptance scope. |
| Additional source and history publication | Review exact content and rights; a previously approved initial artifact does not clear later Skills or history. |
| Selection of these candidate documents into AGK | Complete ordinary content/adoption and explicit predecessor-governed authority selection; do not self-select from the candidate. |

Open questions stop their affected selection or effect. They do not restore legacy implementation as the specification or imply that the entire project must wait for every historical migration task.
