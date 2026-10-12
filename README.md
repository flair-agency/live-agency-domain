# LIVE Agency Domain

This repository is the public central source for publishable LIVE agency concepts, use cases, and domain-derived public contracts. It may also contain public Skills, architecture, governance, and selected composition source when each item has its own reviewed owner and disclosure basis. Its name does not make every package a single DDD Domain layer.

Creator Scouting, Creator Management, and Expense/Accounting have separate business authority. [Business contexts](docs/domain/contexts.md) introduces their shared vocabulary. [Ownership](docs/architecture/ownership.md) explains where concrete platform meaning, company mappings, and selected resources belong.

The public checkout is designed to work without private sibling source repositories or Gitlinks. A repository file or installed tool does not select an operational environment, credentials, target, or permission to act. Such choices belong to a separately reviewed composition and workflow.

Read [contributor guidance](docs/governance/contributing.md) and [agent instructions](AGENTS.md) before changing this source. New content requires its own ownership and disclosure review.

The [public knowledge plugin](docs/architecture/plugin-distribution.md) packages the existing concepts and ownership references for host discovery. Run `node tools/check-plugin.mjs` and `node tools/check-public-tree.mjs` to verify its source. Installation and host verification remain distinct from business execution authority.
