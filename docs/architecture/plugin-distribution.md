# Public knowledge plugin distribution

This package exposes public [business contexts](../domain/contexts.md) and [ownership](ownership.md), plus normalized foreign-revenue recognition planning. It adds no service operation or production composition. The repository's canonical authority remains `main`; an unmerged candidate is a proposal.

## Package choice and contents

The candidate `live-agency-domain@0.2.0` retains `domain-guide` and adds the existing recognition Skill's normalized contract and a bounded planning entry. One plugin avoids creating another catalog for this increment. `packages/foreign-revenue-core` owns the typed public calculation source; its exact engine/source copies are bundled under the plugin's `shared/` folder. Node 22.22+ and existing Python 3.10+ are required. The native Skill script uses relative bundled sources; a standard npm archive uses compiler-emitted JavaScript/declarations because Node does not strip TypeScript inside `node_modules`. No custom loader or registry publication is used. Private correspondence and service bindings remain outside this public artifact.

The [current official interface](https://developers.openai.com/plugins/build/plugins) selects root `plugin.json`, portable skill discovery under `skills/`, and OpenAI presentation under `extensions.com.openai`. The marketplace is `.agents/plugins/marketplace.json`; its local path is relative to the repository root. No compatibility `.codex-plugin` manifest is maintained. The catalog authentication policy is required metadata; this package has no authenticated service to connect.

The two Skill reference files and bundled MIT license are exact distribution copies of their public canonical files. Refresh them with `node tools/check-plugin.mts --sync`, then run `node tools/check-plugin.mts`, `node --test tools/check-plugin.test.mts` and `node tools/check-public-tree.mts`. Sync preflights all copy sources, destinations, their existing ancestors and the existing plugin tree before creating directories or copying files; symlinks, including dangling links, and destinations with multiple hard links are rejected. This protects against links already present at preflight, not concurrent filesystem replacement by another process. Public checks require no private source or credentials. Linux runs all regressions; Windows runs the actual checker and clean-sync/hard-link/path-containment cases without requiring symlink-creation privileges. Containment cases cover POSIX, Windows drive and UNC path semantics. These checks are scoped package checks, not a general plugin schema validator or proof of host behavior.

Repository scripts use typed `.mts` source and [Node's native type stripping](https://nodejs.org/docs/latest-v22.x/api/typescript.html). The selected supported runtime is Node.js 22.22.x LTS, pinned to 22.22.0 in Linux/Windows CI; no TypeScript execution loader is used. Native scripts run directly; the separate npm archive emits JavaScript and declarations through its scoped build config. `npm ci --ignore-scripts` installs only the locked public TypeScript compiler, Node types and their type-only dependency; `npm run typecheck` applies strict, no-emit, erasable-syntax checks to every tool. Native execution does not type-check by itself. Installed root `node_modules` is excluded from source traversal, but tracking that directory is rejected from the Git index. These development dependencies are not part of the plugin artifact; npm `private: true` prevents registry publication and does not change repository visibility.

## Fixed revision and supported installation

Record the full candidate Git commit, manifest version and SHA-256 of every plugin file before installation. Install from that immutable commit, rather than a moving branch:

```text
codex plugin marketplace add flair-agency/live-agency-domain --ref <full-commit-sha>
codex plugin marketplace list --json
codex plugin list --marketplace live-agency-public --available --json
```

CLI marketplace setup and CLI installation are separate from actual ChatGPT Work loading. In the ChatGPT desktop app's Plugins Directory, select **LIVE Agency Public**, install **LIVE Agency Domain**, and open a fresh local Work chat. Where a client offers CLI installation, `codex plugin add live-agency-domain@live-agency-public --json` can test that interface; it does not prove Work discovery.

Local/repository marketplaces are authoring, testing and team-distribution sources; their availability can vary by host surface. They are separate from publication to the universal public Plugins Directory. If the configured marketplace is absent in Work, record the exact surface and stop that acceptance step. The [official repo-scoped procedure](https://developers.openai.com/plugins/build/plugins) uses this repository's `.agents/plugins/marketplace.json` and a desktop-app restart. Do not overwrite a personal catalog, change trust or permissions, or publish to a workspace to work around an unavailable interface.

Use the cache path returned by the tested host rather than assuming a generation named `local`. The CLI observation below returned the semantic-version generation `0.1.0`; neither a directory name nor the manifest version identifies its bytes. Verify the resolved marketplace commit and installed cache hashes against the selected commit. A reinstall can replace that cache generation. Preserve existing marketplace configuration and unrelated plugin state. If a host needs restart or permission, record that exact gate before proceeding.

### Historical 0.1.0 checkpoint and observed limits

The next manual Work test selects public main commit `0387aad6da7c824a08a8a79664f2e549e58a6cad`, `live-agency-domain@0.1.0`, and marketplace `live-agency-public`. This is a test selection, not a new release. At this checkpoint all five plugin files are byte-identical to the earlier CLI-tested commit `0802ee2181280e205c10ff5aa273bb1d67f22774`.

| Plugin-relative path | SHA-256 |
| --- | --- |
| `LICENSE` | `7c49d59dc268bcc5fbe64321a8beda7006a76fa3ce63480e0a20c2f3b050324e` |
| `plugin.json` | `01f6f161b3ef181391436567a9a6027a88e267559abe9b5df3611d79c177d532` |
| `skills/domain-guide/SKILL.md` | `f625c6755cbd71e7216b21e4927af1556eacf6a0ac93640ba66f620e61da6a50` |
| `skills/domain-guide/references/contexts.md` | `949912e815cf931acb83b023887d09d2ed07f318544cfa075e92eda1a94aedbc` |
| `skills/domain-guide/references/ownership.md` | `b6058597ecb46ea8ee7138f2970cecf2d8ca5044531078911ab36c6662792333` |

On 2026-10-12, Codex CLI `0.162.0` installed the earlier fixed commit through its supported marketplace/plugin commands. Its returned cache was `~/.codex/plugins/cache/live-agency-public/live-agency-domain/0.1.0`; all five hashes matched and both reference files were readable. Supported removal restored the saved user configuration and marketplace bytes, and the test cache was absent. These are historical CLI installation and filesystem observations. The current commit's bytes were checked again without installing it. Actual ChatGPT Work discovery, Skill invocation, model reference reading, answer/readback and host removal remain unrun. A historical desktop-app bundle version does not establish the running host version; capture that version during the manual test.

## Host acceptance and recovery

In a fresh Work chat, explicitly invoke `@domain-guide` with: “Explain the three LIVE agency business contexts, why missing eligibility is not ineligibility, and where service field mappings belong. Cite the packaged references.” Verify discovery, loading of both references and an answer consistent with them. Then ask which concrete field implements eligibility; verify that the guide identifies the absent private binding instead of inventing it.

Record host name/version/build, evidence date, fixed commit, manifest/cache identity, discovery, invocation, reference paths, returned answer and follow-up readback. File hashing establishes bytes; it does not establish model loading. A failed or unavailable host step remains incomplete. CLI, protocol fixtures and direct file reads cannot substitute for Work acceptance.

Uninstall the test plugin through the host's supported interface and remove only the marketplace registration created for this test. For CLI-created state, use `codex plugin remove live-agency-domain@live-agency-public` and `codex plugin marketplace remove live-agency-public`. Verify that the test plugin is absent and unrelated settings are preserved. Retain the fixed commit and file hashes for recovery. No real business operation is part of this test.

## Boundary for future private inputs

The [ownership authority](ownership.md) remains the boundary: public meaning is packaged here; platform correspondence, organization mappings and selected physical resource/identity/permission bindings stay with their respective independent owners. A private consumer may select this exact public commit and its own fixed private artifacts. Those selections and their evidence belong in the private consumer's record, outside this public marketplace and plugin payload.

Before a later operational Skill can act, its owning contract must select compatible public/private versions, actor, environment, resources and allowed operations. Missing, ambiguous, incompatible or changed selection stops the affected operation. Installation does not supply that selection. This reading guide reports a missing private binding and cannot execute a business workflow. No private package is fabricated here, no private sibling checkout is required, and no current operational responsibility transfers to a new loader or resolver.

## Recognition planning acceptance

For the candidate 0.2.0 artifact, run the recognition Skill with the synthetic normalized input from its contract. Expect JPY `16112` for USD `100.25` at `160.72`, the month-end semantic receivable/revenue plan and the same deterministic hash. The entry fixes recognition and rejects settlement. Missing or conflicting evidence returns blocked/invalid, never registration. Public basic checks and calculations need no private checkout. The private consumer supplies its own mappings and invokes the fixed standard archive; its owner-only custody, setup and Work test instructions belong to that private owner. Local script/archive tests do not establish actual Work invocation or service behavior. The historical knowledge-only host evidence above retains its original scope.
