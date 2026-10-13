import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
function object(value, name) {
    if (!value || Array.isArray(value) || typeof value !== 'object')
        throw new Error(`${name} must be an object`);
    return value;
}
function string(value, name) {
    if (typeof value !== 'string' || !value.trim())
        throw new Error(`${name} must be a non-empty string`);
    if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(value))
        throw new Error(`${name} must contain valid Unicode`);
    if (value !== value.trim() || /^\p{White_Space}|\p{White_Space}$/u.test(value))
        throw new Error(`${name} must not have surrounding whitespace`);
    return value;
}
function integer(value, name, min = 0) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min)
        throw new Error(`${name} must be a safe integer >= ${min}`);
    return value;
}
function boolean(value, name) {
    if (typeof value !== 'boolean')
        throw new Error(`${name} must be a boolean`);
    return value;
}
function date(value, name) {
    const text = string(value, name);
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(text) || text.startsWith('0000'))
        throw new Error(`${name} must be YYYY-MM-DD`);
    const parsed = new Date(text + 'T00:00:00.000Z');
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text)
        throw new Error(`${name} must be YYYY-MM-DD`);
    return parsed;
}
function monthEnd(value) {
    if (!/^[0-9]{4}-[0-9]{2}$/.test(value))
        throw new Error('invoice.revenue_month must be YYYY-MM');
    const year = Number(value.slice(0, 4)), month = Number(value.slice(5));
    if (year < 1 || year > 9999 || month < 1 || month > 12)
        throw new Error('invoice.revenue_month is invalid');
    const d = new Date(0);
    d.setUTCFullYear(year, month, 0);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}
function decimal(value, name) {
    if (typeof value !== 'string' || !/^[0-9]+(?:\.[0-9]+)?$/.test(value))
        throw new Error(`${name} must be a positive decimal JSON string`);
    const coefficient = BigInt(value.replace('.', ''));
    if (coefficient <= 0n)
        throw new Error(`${name} must be greater than zero`);
    return { coefficient, scale: value.includes('.') ? value.length - value.indexOf('.') - 1 : 0 };
}
function safeNumbers(value) {
    if (typeof value === 'number' && !Number.isSafeInteger(value))
        throw new Error('JSON numbers must be safe integers; decimal amounts and rates must be strings');
    if (value && typeof value === 'object')
        for (const item of Object.values(value))
            safeNumbers(item);
}
function sorted(value) {
    if (Array.isArray(value))
        return value.map(sorted);
    if (value && typeof value === 'object')
        return Object.fromEntries(Object.keys(value).sort().map(k => [k, sorted(value[k])]));
    return value;
}
export function buildPlan(operation, payload) {
    try {
        if (operation !== 'recognition')
            throw new Error('unsupported operation');
        const p = object(payload, 'root');
        if (p.operation !== operation)
            throw new Error('input operation does not match the selected Skill');
        safeNumbers(p);
        if (Buffer.byteLength(JSON.stringify(p)) > 1024 * 1024)
            throw new Error('normalized input exceeds 1 MiB');
        const inv = object(p.invoice, 'invoice');
        const number = string(inv.invoice_number, 'invoice.invoice_number');
        if ([...number].length > 200)
            throw new Error('invoice.invoice_number is too long');
        const month = string(inv.revenue_month, 'invoice.revenue_month'), closing = monthEnd(month);
        const issued = date(inv.issue_date, 'invoice.issue_date');
        if (issued < closing)
            throw new Error('invoice.issue_date must not precede the revenue month end');
        const currency = string(inv.currency, 'invoice.currency');
        if (!/^[A-Z]{3}$/.test(currency))
            throw new Error('invoice.currency must be a three-letter uppercase code');
        const amount = decimal(inv.amount, 'invoice.amount');
        if (!boolean(inv.final, 'invoice.final'))
            throw new Error('invoice.final must be true');
        const digest = string(inv.input_sha256, 'invoice.input_sha256');
        if (!/^[0-9a-fA-F]{64}$/.test(digest))
            throw new Error('invoice.input_sha256 must be 64 hexadecimal characters');
        const source = { id: string(inv.source_profile_id, 'invoice.source_profile_id'), version: string(inv.source_profile_version, 'invoice.source_profile_version') };
        const dest = object(p.destination, 'destination');
        const destination = { id: string(dest.profile_id, 'destination.profile_id'), version: string(dest.profile_version, 'destination.profile_version') };
        const policy = object(p.policy, 'policy');
        if (policy.non_business_month_end !== 'previous_business_day')
            throw new Error('policy.non_business_month_end must be previous_business_day');
        if (policy.jpy_rounding !== 'half_up')
            throw new Error('policy.jpy_rounding must be half_up');
        if (!boolean(policy.approval_required, 'policy.approval_required'))
            throw new Error('policy.approval_required must be true');
        const checks = object(p.checks, 'checks'), issues = [];
        for (const [field, expected, message] of [
            ['source_profile_match_count', 1, 'source profile did not match exactly once'],
            ['destination_profile_match_count', 1, 'destination profile did not match exactly once'],
            ['duplicate_invoice_count', 0, 'invoice number or source hash is already present'],
            ['month_conflict_count', 0, 'another invoice conflicts with the configured monthly scope'],
        ])
            if (integer(checks[field], `checks.${field}`) !== expected)
                issues.push(message);
        const fx = object(p.fx_rate, 'fx_rate'), pair = `${currency}/JPY`;
        if (string(fx.currency_pair, 'fx_rate.currency_pair') !== pair)
            throw new Error(`fx_rate.currency_pair must be ${pair}`);
        const rate = decimal(fx.value, 'fx_rate.value'), rateDate = date(fx.rate_date, 'fx_rate.rate_date');
        const lag = (closing.getTime() - rateDate.getTime()) / 86400000;
        if (lag < 0)
            throw new Error('fx_rate.rate_date must not follow the revenue month end');
        if (fx.rate_type !== 'first_published_midpoint')
            throw new Error('fx_rate.rate_type must be first_published_midpoint');
        const sourceUrl = string(fx.source_url, 'fx_rate.source_url');
        try {
            const url = new URL(sourceUrl);
            const host = url.hostname;
            const literal = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
            const dns = host.endsWith('.') ? host.slice(0, -1) : host;
            const validHost = isIP(literal) !== 0 || (dns.length <= 253 && dns.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)));
            if (!validHost)
                throw new Error();
            if (!/^https:\/\/[^/?#@\\]+(?:[/?#]|$)/i.test(sourceUrl) || url.protocol !== 'https:' || !url.hostname || url.username || url.password || /[\u0000-\u0020\u007f\p{White_Space}\uFEFF]/u.test(sourceUrl))
                throw new Error();
        }
        catch {
            throw new Error('fx_rate.source_url must be a valid HTTPS URL with a host');
        }
        if (!boolean(fx.source_verified, 'fx_rate.source_verified'))
            issues.push('official rate source was not verified');
        if (!boolean(fx.policy_date_verified, 'fx_rate.policy_date_verified'))
            issues.push('rate date was not verified against the month-end policy');
        if (issues.length)
            return { status: 'blocked', operation: 'recognition', issues };
        const product = amount.coefficient * rate.coefficient, divisor = 10n ** BigInt(amount.scale + rate.scale);
        const jpy = (product + divisor / 2n) / divisor;
        if (jpy < 1n || jpy > BigInt(Number.MAX_SAFE_INTEGER))
            throw new Error('computed value_jpy must be a safe integer >= 1');
        const value_jpy = Number(jpy);
        const plan = {
            operation: 'recognition', invoice_number: number, input_sha256: digest.toLowerCase(), source_profile: source,
            destination_profile: destination, revenue_month: month, transaction_date: closing.toISOString().slice(0, 10),
            issue_date: inv.issue_date, currency, foreign_amount: inv.amount,
            rate: { value: fx.value, date: rateDate.toISOString().slice(0, 10), type: fx.rate_type, source_url: sourceUrl },
            value_jpy, memo: `Invoice #${number} / ${month} / ${currency} ${String(inv.amount)}`,
            debits: [{ role: 'accounts_receivable', value_jpy }], credits: [{ role: 'revenue', value_jpy }], approval_required: true,
        };
        return { status: 'ready', operation: 'recognition', plan_sha256: createHash('sha256').update(JSON.stringify(sorted(plan))).digest('hex'), plan };
    }
    catch (e) {
        return { status: 'invalid', issues: [e instanceof Error ? e.message : 'invalid input'] };
    }
}
