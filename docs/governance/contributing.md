# Contributor guidance

Write owner-review proposals in Japanese and adopted canonical documents in English. Identify the canonical owner of each rule and link to it instead of maintaining competing copies. Preserve the reason for a decision, the evidence used, its limits, and a route for a qualified human to understand and take over the work.

Before editing, check the source status and the affected contract. Keep unrelated work intact. For each change, state its owner, intended effect, authority, focused verification, remaining decisions, and recovery or no-mutation result. Do not present an old test or a synthetic fixture as current operational proof.

Public proposals and checks must use publishable inputs. Do not add private documents, credentials, real data, selected resource identifiers, or publication-uncertain source interpretations. A public contribution does not select a production environment or authorize service access. Protected effects require an explicitly selected actor, target, operation, and applicable approval through the owning workflow.

# Technical review assignments

Owner-approved decision, 2026-10-12: use the existing organization maintainer teams below for this repository's technical review routing. This resolves the missing team-to-review-role decision identified by the CODEOWNERS review; it does not replace the semantic or disclosure owners described in the ownership authority.

| Review scope | Reviewer teams |
| --- | --- |
| Default implementation and files without a more specific assignment | `@flair-agency/engineering` |
| Public concepts, ownership/contributor guidance, agent instructions, README, Contributing, Code of Conduct and Support | `@flair-agency/architecture`, `@flair-agency/engineering` |
| Gatekeeper policy and selected review configuration under `.codex/gatekeeper/` | `@flair-agency/architecture` |
| Security policy, repository automation under `.github/`, and CODEOWNERS itself | `@flair-agency/security`, `@flair-agency/architecture` |

CODEOWNERS implements this routing with a default rule followed by more specific path rules; the last matching rule selects reviewers. Referenced teams must remain non-secret and have write access to this repository. Eligibility and membership are checked separately from the adopted responsibility; this decision grants no access or membership.

These review assignments confer no business, platform, disclosure, credential, selected-environment or production authority. They introduce no mandatory approval requirement. Required approval counts and Code Owner approval enforcement remain separate repository protections, unchanged by this decision. A proposed authority record is not canonical until adopted on the repository baseline; an implementation cannot resolve its protected-base review solely by adding authority to its own head.
