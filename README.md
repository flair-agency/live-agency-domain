# LIVE Agency Domain

This repository is the public central source for publishable LIVE agency concepts, use cases, and domain-derived public contracts. It may also contain public Skills, architecture, governance, and selected composition source when each item has its own reviewed owner and disclosure basis. Its name does not make every package a single DDD Domain layer.

Creator Scouting, Creator Management, and Expense/Accounting have separate business authority. [Business contexts](docs/domain/contexts.md) introduces their shared vocabulary. [Ownership](docs/architecture/ownership.md) explains where concrete platform meaning, company mappings, and selected resources belong.

The public checkout is designed to work without private sibling source repositories or Gitlinks. A repository file or installed tool does not select an operational environment, credentials, target, or permission to act. Such choices belong to a separately reviewed composition and workflow.

Start with the [architecture overview](docs/architecture/overview.md) for responsibility and execution/distribution boundaries, then the [clean-v2 baseline](docs/requirements/clean-v2-baseline.md) for reconstruction and acceptance conditions. Work-branch text and registration changes remain proposals until owner-approved normal integration; candidate documents do not govern their own predecessor review.

Read [contributor guidance](docs/governance/contributing.md) and [agent instructions](AGENTS.md) before changing this source. New content requires its own ownership and disclosure review.

The [public knowledge plugin](docs/architecture/plugin-distribution.md) packages the existing concepts and ownership references for host discovery. The repository tools run natively as `.mts` on the selected Node.js 22.22.x LTS runtime, without a loader or transpiled output. Install locked development tools with `npm ci --ignore-scripts`, then run `npm run typecheck`, `npm test` and `npm run check`. Installation and host verification remain distinct from business execution authority.
