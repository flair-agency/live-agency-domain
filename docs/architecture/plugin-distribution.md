# Public knowledge plugin distribution

This bounded package exposes the existing public [business contexts](../domain/contexts.md) and [ownership](ownership.md) through one reading Skill. It adds no operational capability or selected private composition. The repository's canonical authority remains `main`; an unmerged candidate is a proposal.

## Package choice and contents

`plugins/live-agency-domain/plugin.json` identifies `live-agency-domain@0.1.0`. The single `domain-guide` Skill answers conceptual questions from packaged references. One plugin and one Skill are sufficient for this knowledge-only increment; repository ownership does not imply a future package count or dependency graph. No npm package, MCP server, app mapping, hook or legacy Runtime is needed.

The [current official interface](https://developers.openai.com/plugins/build/plugins) selects root `plugin.json`, portable skill discovery under `skills/`, and OpenAI presentation under `extensions.com.openai`. The marketplace is `.agents/plugins/marketplace.json`; its local path is relative to the repository root. No compatibility `.codex-plugin` manifest is maintained. The catalog authentication policy is required metadata; this package has no authenticated service to connect.

The two Skill reference files and bundled MIT license are exact distribution copies of their public canonical files. Refresh them with `node tools/check-plugin.mjs --sync`, then run `node tools/check-plugin.mjs` and `node tools/check-public-tree.mjs`. CI checks drift, links, unexpected payload, symlinks and Gitlinks without private source, credentials or external dependencies. These checks are scoped package checks, not a general plugin schema validator or proof of host behavior.

## Fixed revision and supported installation

Record the full candidate Git commit, manifest version and SHA-256 of every plugin file before installation. Install from that immutable commit, rather than a moving branch:

```text
codex plugin marketplace add flair-agency/live-agency-domain --ref <full-commit-sha>
codex plugin marketplace list --json
codex plugin list --marketplace live-agency-public --available --json
```

CLI marketplace setup and CLI installation are separate from actual ChatGPT Work loading. In the ChatGPT desktop app's Plugins Directory, select **LIVE Agency Public**, install **LIVE Agency Domain**, and open a fresh local Work chat. Where a client offers CLI installation, `codex plugin add live-agency-domain@live-agency-public --json` can test that interface; it does not prove Work discovery.

The documented local source cache generation is `live-agency-public/live-agency-domain/local`, so the manifest's semantic version alone does not identify its bytes. Verify the resolved marketplace commit and installed cache hashes against the selected commit. A reinstall from changed local contents can replace that cache generation. Preserve existing marketplace configuration and unrelated plugin state; do not overwrite a personal marketplace catalog. If a host needs restart or permission, record that exact gate before proceeding.

## Host acceptance and recovery

In a fresh Work chat, explicitly invoke `@domain-guide` with: “Explain the three LIVE agency business contexts, why missing eligibility is not ineligibility, and where service field mappings belong. Cite the packaged references.” Verify discovery, loading of both references and an answer consistent with them. Then ask which concrete field implements eligibility; verify that the guide identifies the absent private binding instead of inventing it.

Record host name/version/build, evidence date, fixed commit, manifest/cache identity, discovery, invocation, reference paths, returned answer and follow-up readback. File hashing establishes bytes; it does not establish model loading. A failed or unavailable host step remains incomplete. CLI, protocol fixtures and direct file reads cannot substitute for Work acceptance.

Uninstall the test plugin through the host's supported interface and remove only the marketplace registration created for this test. For CLI-created state, use `codex plugin remove live-agency-domain@live-agency-public` and `codex plugin marketplace remove live-agency-public`. Verify that the test plugin is absent and unrelated settings are preserved. Retain the fixed commit and file hashes for recovery. No real business operation is part of this test.

## Boundary for future private inputs

The [ownership authority](ownership.md) remains the boundary: public meaning is packaged here; platform correspondence, organization mappings and selected physical resource/identity/permission bindings stay with their respective independent owners. A private consumer may select this exact public commit and its own fixed private artifacts. Those selections and their evidence belong in the private consumer's record, outside this public marketplace and plugin payload.

Before a later operational Skill can act, its owning contract must select compatible public/private versions, actor, environment, resources and allowed operations. Missing, ambiguous, incompatible or changed selection stops the affected operation. Installation does not supply that selection. This reading guide reports a missing private binding and cannot execute a business workflow. No private package is fabricated here, no private sibling checkout is required, and no current operational responsibility transfers to a new loader or resolver.
