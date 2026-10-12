# Contributing

Read the canonical [contributor guidance](docs/governance/contributing.md), [ownership boundaries](docs/architecture/ownership.md), and [agent instructions](AGENTS.md) before proposing a change. These documents govern this public development monorepo.

Use an [issue](https://github.com/flair-agency/live-agency-domain/issues) to describe the problem, scope, observable outcome, and verification criteria. Keep each pull request focused and use its template to record actual verification, remaining work, and authority. Work branches and unmerged pull requests remain proposals.

Use the selected Node.js 22.22.x LTS runtime and install locked development tools with `npm ci --ignore-scripts`. Run `npm run typecheck`, `npm test` and `npm run check` from the repository root. The public-tree checker can also run directly with `node tools/check-public-tree.mts`; it checks public source structure and relative Markdown links without establishing disclosure clearance, business correctness, or production readiness. Report any additional checks required by the affected contract and distinguish skipped or unavailable checks from passing checks.

Use synthetic, publishable examples. See [security guidance](SECURITY.md), [support](SUPPORT.md), and the [Code of Conduct](CODE_OF_CONDUCT.md).
