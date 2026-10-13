#!/usr/bin/env python3
"""Build deterministic, provider-neutral foreign-revenue journal plans."""

from __future__ import annotations

import calendar
import hashlib
import json
import re
import sys
from datetime import date
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP, localcontext
from typing import Any


class ContractError(ValueError):
    pass


def require_object(value: Any, name: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ContractError(f"{name} must be an object")
    return value


def require_string(value: Any, name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ContractError(f"{name} must be a non-empty string")
    return value.strip()


def require_bool(value: Any, name: str) -> bool:
    if not isinstance(value, bool):
        raise ContractError(f"{name} must be a boolean")
    return value


def require_int(value: Any, name: str, minimum: int = 0) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum or value > 9007199254740991:
        raise ContractError(f"{name} must be a safe integer >= {minimum}")
    return value


def require_date(value: Any, name: str) -> date:
    text = require_string(value, name)
    if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", text):
        raise ContractError(f"{name} must be YYYY-MM-DD")
    try:
        return date.fromisoformat(text)
    except ValueError as exc:
        raise ContractError(f"{name} must be YYYY-MM-DD") from exc


def require_decimal_string(value: Any, name: str) -> Decimal:
    if not isinstance(value, str) or not re.fullmatch(r"[0-9]+(?:\.[0-9]+)?", value):
        raise ContractError(f"{name} must be a positive decimal JSON string")
    try:
        parsed = Decimal(value)
    except InvalidOperation as exc:
        raise ContractError(f"{name} is not a valid decimal") from exc
    if not parsed.is_finite() or parsed <= 0:
        raise ContractError(f"{name} must be greater than zero")
    return parsed


def month_end(month_text: str) -> date:
    if not re.fullmatch(r"\d{4}-\d{2}", month_text):
        raise ContractError("invoice.revenue_month must be YYYY-MM")
    year, month = (int(part) for part in month_text.split("-"))
    if not 1 <= year <= 9999:
        raise ContractError("invoice.revenue_month has an invalid year")
    if not 1 <= month <= 12:
        raise ContractError("invoice.revenue_month has an invalid month")
    return date(year, month, calendar.monthrange(year, month)[1])


def canonical_hash(value: Any) -> str:
    encoded = json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def validate_invoice(payload: dict[str, Any]) -> tuple[dict[str, Any], date, Decimal]:
    invoice = require_object(payload.get("invoice"), "invoice")
    number = require_string(invoice.get("invoice_number"), "invoice.invoice_number")
    if len(number) > 200:
        raise ContractError("invoice.invoice_number is too long")
    revenue_month = require_string(invoice.get("revenue_month"), "invoice.revenue_month")
    closing_date = month_end(revenue_month)
    issue_date = require_date(invoice.get("issue_date"), "invoice.issue_date")
    if issue_date < closing_date:
        raise ContractError("invoice.issue_date must not precede the revenue month end")
    currency = require_string(invoice.get("currency"), "invoice.currency")
    if not re.fullmatch(r"[A-Z]{3}", currency):
        raise ContractError("invoice.currency must be a three-letter uppercase code")
    amount = require_decimal_string(invoice.get("amount"), "invoice.amount")
    if require_bool(invoice.get("final"), "invoice.final") is not True:
        raise ContractError("invoice.final must be true")
    digest = require_string(invoice.get("input_sha256"), "invoice.input_sha256")
    if not re.fullmatch(r"[0-9a-fA-F]{64}", digest):
        raise ContractError("invoice.input_sha256 must be 64 hexadecimal characters")
    require_string(invoice.get("source_profile_id"), "invoice.source_profile_id")
    require_string(invoice.get("source_profile_version"), "invoice.source_profile_version")
    return invoice, closing_date, amount


def validate_destination(payload: dict[str, Any]) -> dict[str, Any]:
    destination = require_object(payload.get("destination"), "destination")
    require_string(destination.get("profile_id"), "destination.profile_id")
    require_string(destination.get("profile_version"), "destination.profile_version")
    return destination


def validate_policy(payload: dict[str, Any]) -> dict[str, Any]:
    policy = require_object(payload.get("policy"), "policy")
    if policy.get("non_business_month_end") != "previous_business_day":
        raise ContractError("policy.non_business_month_end must be previous_business_day")
    if policy.get("jpy_rounding") != "half_up":
        raise ContractError("policy.jpy_rounding must be half_up")
    require_int(
        policy.get("settlement_window_business_days"),
        "policy.settlement_window_business_days",
        1,
    )
    if require_bool(
        policy.get("sender_pays_transfer_fee"), "policy.sender_pays_transfer_fee"
    ) is not True:
        raise ContractError("policy.sender_pays_transfer_fee must be true")
    if require_bool(policy.get("approval_required"), "policy.approval_required") is not True:
        raise ContractError("policy.approval_required must be true")
    return policy


def validate_profile_checks(checks: dict[str, Any], issues: list[str]) -> None:
    if require_int(
        checks.get("source_profile_match_count"), "checks.source_profile_match_count"
    ) != 1:
        issues.append("source profile did not match exactly once")
    if require_int(
        checks.get("destination_profile_match_count"),
        "checks.destination_profile_match_count",
    ) != 1:
        issues.append("destination profile did not match exactly once")


def build_recognition(payload: dict[str, Any]) -> dict[str, Any]:
    invoice, closing_date, amount = validate_invoice(payload)
    destination = validate_destination(payload)
    policy = validate_policy(payload)
    checks = require_object(payload.get("checks"), "checks")
    issues: list[str] = []
    validate_profile_checks(checks, issues)
    if require_int(
        checks.get("duplicate_invoice_count"), "checks.duplicate_invoice_count"
    ) != 0:
        issues.append("invoice number or source hash is already present")
    if require_int(checks.get("month_conflict_count"), "checks.month_conflict_count") != 0:
        issues.append("another invoice conflicts with the configured monthly scope")

    fx_rate = require_object(payload.get("fx_rate"), "fx_rate")
    expected_pair = f"{invoice['currency']}/JPY"
    if require_string(fx_rate.get("currency_pair"), "fx_rate.currency_pair") != expected_pair:
        raise ContractError(f"fx_rate.currency_pair must be {expected_pair}")
    rate = require_decimal_string(fx_rate.get("value"), "fx_rate.value")
    rate_date = require_date(fx_rate.get("rate_date"), "fx_rate.rate_date")
    lag_days = (closing_date - rate_date).days
    if lag_days < 0 or lag_days > 7:
        raise ContractError("fx_rate.rate_date must be month-end or a recent prior date")
    if fx_rate.get("rate_type") != "first_published_midpoint":
        raise ContractError("fx_rate.rate_type must be first_published_midpoint")
    source_url = require_string(fx_rate.get("source_url"), "fx_rate.source_url")
    if not source_url.startswith("https://"):
        raise ContractError("fx_rate.source_url must be an HTTPS URL")
    if require_bool(fx_rate.get("source_verified"), "fx_rate.source_verified") is not True:
        issues.append("official rate source was not verified")
    if require_bool(
        fx_rate.get("policy_date_verified"), "fx_rate.policy_date_verified"
    ) is not True:
        issues.append("rate date was not verified against the month-end policy")

    if issues:
        return {"status": "blocked", "operation": "recognition", "issues": issues}

    with localcontext() as context:
        context.prec = max(28, len(amount.as_tuple().digits) + len(rate.as_tuple().digits) + 2)
        value_jpy = int((amount * rate).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
    require_int(value_jpy, "computed value_jpy", 1)
    memo = (
        f"Invoice #{invoice['invoice_number']} / {invoice['revenue_month']} / "
        f"{invoice['currency']} {invoice['amount']}"
    )
    plan = {
        "operation": "recognition",
        "invoice_number": invoice["invoice_number"],
        "input_sha256": invoice["input_sha256"].lower(),
        "source_profile": {
            "id": invoice["source_profile_id"],
            "version": invoice["source_profile_version"],
        },
        "destination_profile": {
            "id": destination["profile_id"],
            "version": destination["profile_version"],
        },
        "revenue_month": invoice["revenue_month"],
        "transaction_date": closing_date.isoformat(),
        "issue_date": invoice["issue_date"],
        "currency": invoice["currency"],
        "foreign_amount": invoice["amount"],
        "rate": {
            "value": fx_rate["value"],
            "date": rate_date.isoformat(),
            "type": fx_rate["rate_type"],
            "source_url": source_url,
        },
        "value_jpy": value_jpy,
        "memo": memo,
        "debits": [{"role": "accounts_receivable", "value_jpy": value_jpy}],
        "credits": [{"role": "revenue", "value_jpy": value_jpy}],
        "approval_required": policy["approval_required"],
    }
    return {
        "status": "ready",
        "operation": "recognition",
        "plan_sha256": canonical_hash(plan),
        "plan": plan,
    }


def build_settlement(payload: dict[str, Any]) -> dict[str, Any]:
    invoice, closing_date, _amount = validate_invoice(payload)
    destination = validate_destination(payload)
    policy = validate_policy(payload)
    checks = require_object(payload.get("checks"), "checks")
    issues: list[str] = []
    validate_profile_checks(checks, issues)
    if require_int(
        checks.get("open_receivable_count"), "checks.open_receivable_count"
    ) != 1:
        issues.append("open receivable did not match exactly once")
    if require_int(checks.get("bank_candidate_count"), "checks.bank_candidate_count") != 1:
        issues.append("bank candidate did not match exactly once")
    if require_int(checks.get("already_linked_count"), "checks.already_linked_count") != 0:
        issues.append("bank transaction is already linked")
    if require_int(
        checks.get("separate_fee_or_withholding_count"),
        "checks.separate_fee_or_withholding_count",
    ) != 0:
        issues.append("a separate fee or withholding requires manual review")

    receivable = require_object(payload.get("receivable"), "receivable")
    journal_id = require_string(receivable.get("journal_id"), "receivable.journal_id")
    if require_date(receivable.get("transaction_date"), "receivable.transaction_date") != closing_date:
        issues.append("receivable date does not equal the revenue month end")
    receivable_jpy = require_int(receivable.get("amount_jpy"), "receivable.amount_jpy", 1)
    if require_bool(receivable.get("open"), "receivable.open") is not True:
        issues.append("receivable is not open")
    if require_bool(
        receivable.get("invoice_number_match"), "receivable.invoice_number_match"
    ) is not True:
        issues.append("receivable invoice number does not match")
    if require_bool(
        receivable.get("trade_partner_match"), "receivable.trade_partner_match"
    ) is not True:
        issues.append("receivable trade partner does not match")

    bank = require_object(payload.get("bank_transaction"), "bank_transaction")
    transaction_id = require_string(
        bank.get("transaction_id"), "bank_transaction.transaction_id"
    )
    bank_date = require_date(bank.get("date"), "bank_transaction.date")
    if bank_date < require_date(invoice.get("issue_date"), "invoice.issue_date"):
        issues.append("bank transaction predates the invoice issue date")
    bank_jpy = require_int(bank.get("amount_jpy"), "bank_transaction.amount_jpy", 1)
    if bank.get("side") != "INCOME":
        issues.append("bank transaction is not income")
    if bank.get("journalizing_status") != "none":
        issues.append("bank transaction is not unjournalized")
    for key, label in (
        ("connected_account_match", "configured bank account did not match"),
        ("description_match", "configured bank description did not match"),
        ("within_window", "bank transaction is outside the configured window"),
    ):
        if require_bool(bank.get(key), f"bank_transaction.{key}") is not True:
            issues.append(label)

    if issues:
        return {"status": "blocked", "operation": "settlement", "issues": issues}

    debits: list[dict[str, Any]] = [{"role": "bank", "value_jpy": bank_jpy}]
    credits: list[dict[str, Any]] = [
        {"role": "accounts_receivable", "value_jpy": receivable_jpy}
    ]
    difference = bank_jpy - receivable_jpy
    fx_result = {"role": "none", "value_jpy": 0}
    if difference < 0:
        fx_result = {"role": "fx_loss", "value_jpy": -difference}
        debits.append(fx_result)
    elif difference > 0:
        fx_result = {"role": "fx_gain", "value_jpy": difference}
        credits.append(fx_result)

    memo = (
        f"Invoice #{invoice['invoice_number']} / {invoice['revenue_month']} / "
        f"{invoice['currency']} {invoice['amount']}"
    )
    plan = {
        "operation": "settlement",
        "invoice_number": invoice["invoice_number"],
        "input_sha256": invoice["input_sha256"].lower(),
        "source_profile": {
            "id": invoice["source_profile_id"],
            "version": invoice["source_profile_version"],
        },
        "destination_profile": {
            "id": destination["profile_id"],
            "version": destination["profile_version"],
        },
        "revenue_month": invoice["revenue_month"],
        "transaction_date": bank_date.isoformat(),
        "receivable_journal_id": journal_id,
        "bank_transaction_id": transaction_id,
        "receivable_jpy": receivable_jpy,
        "bank_jpy": bank_jpy,
        "fx_result": fx_result,
        "memo": memo,
        "debits": debits,
        "credits": credits,
        "approval_required": policy["approval_required"],
    }
    return {
        "status": "ready",
        "operation": "settlement",
        "plan_sha256": canonical_hash(plan),
        "plan": plan,
    }


def build_plan(payload: dict[str, Any]) -> dict[str, Any]:
    operation = payload.get("operation")
    if operation == "recognition":
        return build_recognition(payload)
    if operation == "settlement":
        return build_settlement(payload)
    raise ContractError("operation must be recognition or settlement")



def main() -> int:
    try:
        if len(sys.argv) != 2 or sys.argv[1] not in ("recognition", "settlement"):
            raise ContractError("select exactly one supported operation")
        payload = require_object(json.load(sys.stdin), "root")
        if payload.get("operation") != sys.argv[1]:
            raise ContractError("input operation does not match the selected Skill")
        result = build_plan(payload)
    except (json.JSONDecodeError, ContractError, InvalidOperation) as exc:
        result = {"status": "invalid", "issues": [str(exc)]}
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return 2
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 0 if result["status"] == "ready" else 3


if __name__ == "__main__":
    sys.exit(main())
