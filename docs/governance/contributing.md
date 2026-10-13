# Contributor guidance

Write owner-review proposals in Japanese and adopted canonical documents in English. Identify the canonical owner of each rule and link to it instead of maintaining competing copies. Preserve the reason for a decision, the evidence used, its limits, and a route for a qualified human to understand and take over the work.

Before editing, check the source status and the affected contract. Keep unrelated work intact. For each change, state its owner, intended effect, authority, focused verification, remaining decisions, and recovery or no-mutation result. Do not present an old test or a synthetic fixture as current operational proof.

Public proposals and checks must use publishable inputs. Do not add private documents, credentials, real data, selected resource identifiers, or publication-uncertain source interpretations. A public contribution does not select a production environment or authorize service access. Protected effects require an explicitly selected actor, target, operation, and applicable approval through the owning workflow.

# Technical review assignments

The repository owner owns this public repository's technical review assignments and canonical adoption decisions as company-specific governance under the existing [organization ownership boundary](../architecture/ownership.md). The reviewer teams below provide technical assessment in their assigned scopes; a review assignment or team approval does not itself make a proposal canonical. Actual integration remains subject to existing repository permissions, required checks and applicable owner approval. Business, platform and disclosure decisions retain their existing owners.

Owner-approved decision, 2026-10-12: use the existing organization maintainer teams below for this repository's technical review routing. This resolves the missing team-to-review-role decision identified by the CODEOWNERS review; it does not replace the semantic or disclosure owners described in the ownership authority.

| Review scope | Reviewer teams |
| --- | --- |
| Default implementation and files without a more specific assignment | `@flair-agency/engineering` |
| Public concepts, ownership/contributor guidance, agent instructions, README, Contributing, Code of Conduct and Support | `@flair-agency/architecture`, `@flair-agency/engineering` |
| Gatekeeper policy and selected review configuration under `.codex/gatekeeper/` | `@flair-agency/architecture` |
| Security policy, repository automation under `.github/`, and CODEOWNERS itself | `@flair-agency/security`, `@flair-agency/architecture` |

The separate CODEOWNERS implementation must encode this routing with a default rule followed by more specific path rules; the last matching rule selects reviewers. GitHub review routing becomes available only after that implementation is adopted on the relevant base branch. This authority decision does not claim that the CODEOWNERS implementation is already present. Referenced teams must remain non-secret and have write access to this repository. Eligibility and membership are checked separately from the adopted responsibility; this decision grants no access or membership.

These review assignments confer no business, platform, disclosure, credential, selected-environment or production authority. They introduce no mandatory approval requirement. Required approval counts and Code Owner approval enforcement remain separate repository protections, unchanged by this decision. A proposed authority record is not canonical until adopted on the repository baseline; an implementation cannot resolve its protected-base review solely by adding authority to its own head.

# Canonical authority adoption

Ordinary changes require the protected review's schema-valid PASS and all applicable required checks. The repository owner may separately select the existing multi-authority OWNER_ADDITION version-2/G0 procedure in predecessor review controls for a missing technical review assignment in this document only. Selection must retain the complete public Authority Set: business contexts, ownership, contributor guidance, clean-v2 architecture and the clean-v2 baseline. The affected member must be this existing file, identified by its stable ID and exact path. An addition may not change existing rules, another authority member, policy, manifest, schema, prompt, workflow or implementation, or claim completed work. B cannot select its own procedure. A BLOCK cannot become an addition trigger.

For that selected procedure, an exact-B annotated AdditionRecord version 2 must bind the recorded predecessor policy and complete Authority Set, before/after authority bytes and the exact missing-decision ID in B's completed ordinary OWNER_DECISION. A separate complete-set eligibility review must establish every selected check. Its eligible result permits only the subsequent adoption decision; it is neither semantic PASS nor canonical placement and does not authenticate the owner or tag actor.

Normal adoption requires the repository owner's approval for exact B, all required host checks, and an ordinary merge commit with the recorded base as first parent, exact B as second parent and B's tree as its resulting tree. An applicable, separately reviewed evidence procedure must bind the successful pre-merge producer, run, attempt and job to that candidate and verify the annotated tag object, fresh target ref and ancestry, and complete canonical authority bytes. Only successful evidence verification establishes valid adoption; unknown, stale, mismatched or unavailable evidence leaves it incomplete. A ref read observes placement at that time and does not guarantee later tag or branch state. After B becomes canonical, A requires a fresh ordinary review against the adopted authority; PASS is not guaranteed.

This rule does not enable a route for its own initial adoption. Any initial authority or control selection must use a process already permitted by the predecessor governance and repository protections. An unselected procedure, candidate text, owner comment or local review cannot waive a failed required check. No initial-adoption exception, merge bypass, permission change, credential change or production effect is authorized by this definition. If no applicable initial process is available, preserve the blocked result and obtain a separately scoped owner decision before performing integration.
