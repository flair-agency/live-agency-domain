import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildPlan } from '../src/index.mts';
interface Input extends Record<string, unknown> { operation: string }
interface Fixture { name: string; input: Input; expected: unknown }
const cases = JSON.parse(readFileSync(new URL('./legacy-cases.json', import.meta.url), 'utf8')) as Fixture[];
function input(name: string): Input { const c = cases.find(x => x.name === name); assert.ok(c); return structuredClone(c.input); }
const object = (v: unknown) => v as Record<string, unknown>;
for (const c of cases) test(`unchanged plan/hash: ${c.name}`, () => assert.deepEqual(buildPlan(c.input.operation, c.input), c.expected));
for (const date of ['20260806', '2026-W32-4', '2026-02-30']) test(`invalid date: ${date}`, () => {
  const x = input('recognition'); object(x.invoice).issue_date = date; assert.equal(buildPlan('recognition', x).status, 'invalid');
});
test('year zero is invalid', () => { const x = input('recognition'); object(x.invoice).revenue_month = '0000-07'; assert.equal(buildPlan('recognition', x).status, 'invalid'); });
test('operation cannot be changed by input', () => {
  assert.equal(buildPlan('recognition', { operation: 'settlement' }).status, 'invalid');
  assert.equal(buildPlan('settlement', input('recognition')).status, 'invalid');
  assert.equal(buildPlan('unknown', input('recognition')).status, 'invalid');
});
test('decimal floats and unsafe integers stop', () => {
  const x = input('recognition'); object(x.invoice).amount = 1.25; assert.equal(buildPlan('recognition', x).status, 'invalid');
  x.extra = Number.MAX_SAFE_INTEGER + 1; assert.equal(buildPlan('recognition', x).status, 'invalid');
});
test('exact Decimal precision is preserved', () => {
  const x = input('recognition'); object(x.invoice).amount = '1.49999999999999999999999999999999999999'; object(x.fx_rate).value = '1';
  const r = buildPlan('recognition', x); assert.ok(r.status === 'ready'); assert.equal(r.plan.value_jpy, 1);
});
test('zero-rounded and unsafe JPY stop', () => { for (const amount of ['0.1', '9007199254740992']) {
  const x = input('recognition'); object(x.invoice).amount = amount; object(x.fx_rate).value = '1'; assert.equal(buildPlan('recognition', x).status, 'invalid');
} });
test('missing profile stops and unrelated settlement policy is not required', () => {
  const x = input('recognition'); object(x.checks).source_profile_match_count = 0; assert.equal(buildPlan('recognition', x).status, 'blocked');
  const y = input('recognition'); delete object(y.policy).settlement_window_business_days; delete object(y.policy).sender_pays_transfer_fee;
  assert.equal(buildPlan('recognition', y).status, 'ready');
});
test('malformed or oversized JSON input stops', () => {
  for (const x of [null, [], 'private']) assert.equal(buildPlan('recognition', x).status, 'invalid');
  const x = input('recognition'); x.extra = 'x'.repeat(1024 * 1024); assert.equal(buildPlan('recognition', x).status, 'invalid');
});
test('packaged public Skill emits the same plan and rejects other operations', () => {
  const cli = fileURLToPath(new URL('../../../plugins/live-agency-domain/skills/live-agency-foreign-currency-revenue-recognize/scripts/plan.mts', import.meta.url));
  const good = spawnSync(process.execPath, [cli], { input: JSON.stringify(input('recognition')), encoding: 'utf8' });
  assert.equal(good.status, 0, good.stderr); assert.deepEqual(JSON.parse(good.stdout), cases.find(x => x.name === 'recognition')!.expected);
  const bad = spawnSync(process.execPath, [cli], { input: JSON.stringify({ operation: 'settlement' }), encoding: 'utf8' }); assert.equal(bad.status, 2);
});
test('normalized strings cannot carry surrounding whitespace into the plan/hash', () => {
  for (const field of ['invoice_number', 'input_sha256', 'issue_date', 'revenue_month', 'source_profile_id', 'source_profile_version']) {
    const x = input('recognition'); object(x.invoice)[field] = ' ' + String(object(x.invoice)[field]) + ' ';
    assert.equal(buildPlan('recognition', x).status, 'invalid');
  }
});
test('rate provenance requires a syntactically valid HTTPS host', () => {
  for (const url of ['https://', 'https://?x', 'https:// evil', 'https://example.invalid:99999', 'https://user:secret@example.invalid', 'https://@example.invalid', 'https://\\example.invalid']) {
    const x = input('recognition'); object(x.fx_rate).source_url = url;
    assert.equal(buildPlan('recognition', x).status, 'invalid');
  }
});

test('public entry rejects malformed UTF-8 before invoice planning and hashing', () => {
  const cli = fileURLToPath(new URL('../../../plugins/live-agency-domain/skills/live-agency-foreign-currency-revenue-recognize/scripts/plan.mts', import.meta.url));
  const bytes = Buffer.from(JSON.stringify(input('recognition')));
  const offset = bytes.indexOf(Buffer.from('SYNTH-2026-07')); assert.ok(offset >= 0); bytes[offset] = 0xff;
  const result = spawnSync(process.execPath, [cli], { input: bytes, encoding: 'utf8' });
  assert.equal(result.status, 2); assert.equal(JSON.parse(result.stdout).status, 'invalid');
  assert.equal(JSON.parse(result.stdout).plan, undefined);
});

test('Unicode White_Space boundaries cannot produce distinct ready identities', () => {
  const whitespace = ['\u0009', '\u000a', '\u000b', '\u000c', '\u000d', '\u0020', '\u0085', '\u00a0', '\u1680', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200a', '\u2028', '\u2029', '\u202f', '\u205f', '\u3000', '\ufeff'];
  for (const padding of whitespace) for (const side of ['start', 'end']) {
    for (const [section, field] of [['invoice', 'invoice_number'], ['invoice', 'source_profile_id'], ['destination', 'profile_id'], ['fx_rate', 'source_url']]) {
      const x = input('recognition'), target = object(x[section!]), value = String(target[field!]);
      target[field!] = side === 'start' ? padding + value : value + padding;
      assert.equal(buildPlan('recognition', x).status, 'invalid', section + '.' + field + ':' + padding.codePointAt(0));
    }
  }
});
test('Unicode whitespace inside rate provenance is invalid', () => {
  const x = input('recognition'); object(x.fx_rate).source_url = 'https://example.invalid/a\u0085b';
  assert.equal(buildPlan('recognition', x).status, 'invalid');
});

test('verified previous-business-day assertions do not inherit an undocumented seven-day cap', () => {
  const x = input('recognition'); object(x.fx_rate).rate_date = '2026-07-22';
  assert.equal(buildPlan('recognition', x).status, 'ready');
  object(x.fx_rate).policy_date_verified = false;
  assert.equal(buildPlan('recognition', x).status, 'blocked');
  object(x.fx_rate).rate_date = '2026-08-01';
  assert.equal(buildPlan('recognition', x).status, 'invalid');
});

test('provenance host requires a valid IP literal or well-formed DNS labels', () => {
 for (const host of ['.', '..', '-', '-bank.example', 'bank-.example', 'a..example', '_bank.example', 'a'.repeat(64)+'.example']) {
  const x=input('recognition'); object(x.fx_rate).source_url='https://'+host+'/';
  assert.equal(buildPlan('recognition',x).status,'invalid',host);
 }
 for (const host of ['example.invalid', 'example.invalid.', '127.0.0.1', '[::1]', '例え.example']) {
  const x=input('recognition'); object(x.fx_rate).source_url='https://'+host+'/';
  assert.equal(buildPlan('recognition',x).status,'ready',host);
 }
});
test('raw URL controls cannot silently become a different provenance URL', () => {
 const x=input('recognition'); object(x.fx_rate).source_url='https://example.invalid/a\u0000b';
 assert.equal(buildPlan('recognition',x).status,'invalid');
});
