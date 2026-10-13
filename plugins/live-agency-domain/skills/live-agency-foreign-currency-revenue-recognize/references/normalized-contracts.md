# Normalized contracts

Use UTF-8 JSON. Foreign amounts and rates are positive decimal strings; JPY amounts and counts are safe integers (at most 9007199254740991). Dates must use YYYY-MM-DD with years 0001–9999. A computed JPY value below one or above the safe integer limit is invalid. Input limit: 1 MiB. All examples are synthetic.

## Recognition input

```json
{
  "operation": "recognition",
  "invoice": {
    "invoice_number": "SYNTH-2026-07",
    "revenue_month": "2026-07",
    "issue_date": "2026-08-06",
    "currency": "USD",
    "amount": "100.25",
    "final": true,
    "input_sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "source_profile_id": "synthetic-invoice",
    "source_profile_version": "1"
  },
  "destination": {
    "profile_id": "synthetic-accounting",
    "profile_version": "1"
  },
  "fx_rate": {
    "currency_pair": "USD/JPY",
    "value": "160.72",
    "rate_date": "2026-07-31",
    "rate_type": "first_published_midpoint",
    "source_url": "https://example.invalid/official-rate",
    "source_verified": true,
    "policy_date_verified": true
  },
  "policy": {
    "non_business_month_end": "previous_business_day",
    "jpy_rounding": "half_up",
    "settlement_window_business_days": 10,
    "sender_pays_transfer_fee": true,
    "approval_required": true
  },
  "checks": {
    "source_profile_match_count": 1,
    "destination_profile_match_count": 1,
    "duplicate_invoice_count": 0,
    "month_conflict_count": 0
  }
}
```

The planner derives the final calendar day from `revenue_month`. `rate_date`
must be that date or an earlier date selected by the verified previous-business-
day rule. `duplicate_invoice_count` covers the full destination lookup for the
invoice number and source hash. A different invoice in a one-invoice-per-month
profile is reported through `month_conflict_count`.

## Planner output

The planner emits one JSON object:

- `ready` contains the semantic journal plan and `plan_sha256`;
- `blocked` contains explicit issues and never authorizes a write; or
- `invalid` means the normalized contract itself is malformed.

Account roles such as `accounts_receivable`, `revenue`, `bank`, `fx_loss`, and
`fx_gain` are resolved to stable destination IDs only after approval. The plan
hash covers normalized input identity, destination profile version, dates,
amounts, memo, and semantic debit/credit lines.
