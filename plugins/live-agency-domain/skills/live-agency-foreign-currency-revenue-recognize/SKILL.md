---
name: live-agency-foreign-currency-revenue-recognize
description: Calculate a semantic month-end receivable/revenue plan from a final normalized invoice and supplied verified rate evidence. Use for planning, not invoice collection, private service mapping, registration or settlement.
---

# Recognize foreign revenue

Read [the normalized contract](references/normalized-contracts.md). Source observations, verification flags and lookup counts must come from the caller's selected private sources; flags alone are not evidence. Missing, ambiguous or conflicting input stops planning. The shared calculation fixes `recognition`, uses exact Decimal half-up JPY rounding, and dates the receivable/revenue plan at revenue month end.

For a synthetic normalized input, run the bundled `scripts/plan.mts` with UTF-8 JSON on stdin. Only Node 22.22+ is required. The caller owns input/output custody; real data must stay in owner-only private storage. The public component never fetches a source, selects a rate policy or source profile, binds a service field, or calls an accounting tool.

Report `ready`, `blocked` or `invalid`; for ready include the semantic plan, amount, date and plan hash. A ready plan is neither approval nor registration. Company account/tax/partner mappings and actual actor/account/resource selection belong to the private consumer and selected environment. Do not infer these from account names or an installed tool. Any later service operation requires its owning contract, exact effect approval where required, fresh evidence and proportionate readback/recovery. This increment performs no such operation or monitor action.

The normalized contract is derived from the existing public recognition Skill; the calculator is the shared public `foreign-revenue-core` distribution copy. No private mapping or service IDs are included.
