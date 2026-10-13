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
  assert.equal(buildPlan('recognition', input('settlement-15750')).status, 'invalid');
  assert.equal(buildPlan('settlement', input('recognition')).status, 'invalid');
  assert.equal(buildPlan('unknown', input('recognition')).status, 'invalid');
});
test('decimal floats and unsafe integers stop', () => {
  const x = input('recognition'); object(x.invoice).amount = 1.25; assert.equal(buildPlan('recognition', x).status, 'invalid');
  const y = input('settlement-15750'); object(y.bank_transaction).amount_jpy = Number.MAX_SAFE_INTEGER + 1; assert.equal(buildPlan('settlement', y).status, 'invalid');
});
test('exact Decimal precision is preserved', () => {
  const x = input('recognition'); object(x.invoice).amount = '1.49999999999999999999999999999999999999'; object(x.fx_rate).value = '1';
  const r = buildPlan('recognition', x); assert.ok(r.status === 'ready'); assert.equal(r.plan.value_jpy, 1);
});
test('zero-rounded and unsafe JPY stop', () => { for (const amount of ['0.1', '9007199254740992']) {
  const x = input('recognition'); object(x.invoice).amount = amount; object(x.fx_rate).value = '1'; assert.equal(buildPlan('recognition', x).status, 'invalid');
} });
test('missing profile and unsupported fee evidence stop', () => {
  const x = input('recognition'); object(x.checks).source_profile_match_count = 0; assert.equal(buildPlan('recognition', x).status, 'blocked');
  const y = input('settlement-15750'); object(y.checks).separate_fee_or_withholding_count = 1; assert.equal(buildPlan('settlement', y).status, 'blocked');
});
test('malformed or oversized JSON input stops', () => {
  for (const x of [null, [], 'private']) assert.equal(buildPlan('recognition', x).status, 'invalid');
  const x = input('recognition'); x.extra = 'x'.repeat(1024 * 1024); assert.equal(buildPlan('recognition', x).status, 'invalid');
});
test('packaged public Skill emits the same plan and rejects other operations', () => {
  const cli = fileURLToPath(new URL('../../../plugins/live-agency-domain/skills/live-agency-foreign-currency-revenue-recognize/scripts/plan.mts', import.meta.url));
  const good = spawnSync(process.execPath, [cli], { input: JSON.stringify(input('recognition')), encoding: 'utf8' });
  assert.equal(good.status, 0, good.stderr); assert.deepEqual(JSON.parse(good.stdout), cases.find(x => x.name === 'recognition')!.expected);
  const bad = spawnSync(process.execPath, [cli], { input: JSON.stringify(input('settlement-15750')), encoding: 'utf8' }); assert.equal(bad.status, 2);
});
