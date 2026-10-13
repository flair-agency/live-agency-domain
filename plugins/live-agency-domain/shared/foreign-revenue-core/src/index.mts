import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export interface RecognitionPlan {
  operation: 'recognition';
  destination_profile: { id: string; version: string };
  value_jpy: number; transaction_date: string; memo: string;
  [key: string]: unknown;
}
export interface PlanningFailure { status: 'blocked' | 'invalid'; issues: string[]; operation?: string }
export interface ReadyRecognition {
  status: 'ready'; operation: 'recognition'; plan_sha256: string; plan: RecognitionPlan;
}
export interface ReadyPlan {
  status: 'ready'; operation: string; plan_sha256: string; plan: Record<string, unknown>;
}
export type PlanResult = ReadyPlan | PlanningFailure;
const planner = fileURLToPath(new URL('../python/plan_foreign_revenue.py', import.meta.url));
const invalid = (message: string): PlanningFailure => ({ status: 'invalid', issues: [message] });
function validateNumbers(value: unknown): void {
  if (typeof value === 'number' && !Number.isSafeInteger(value)) {
    throw new TypeError('JSON numbers must be safe integers; decimal amounts and rates must be strings');
  }
  if (value && typeof value === 'object') for (const item of Object.values(value)) validateNumbers(item);
}
export function buildPlan(operation: 'recognition', payload: unknown): ReadyRecognition | PlanningFailure;
export function buildPlan(operation: string, payload: unknown): PlanResult;
/** Existing Decimal engine, fixed operation and bounded JSON stdin. No service access. */
export function buildPlan(operation: string, payload: unknown): PlanResult {
  if (!['recognition', 'settlement'].includes(operation)) return invalid('unsupported operation');
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') return invalid('root must be an object');
  if ((payload as Record<string, unknown>).operation !== operation) return invalid('input operation does not match the selected Skill');
  let input: string;
  try { validateNumbers(payload); input = JSON.stringify(payload); }
  catch { return invalid('input must be JSON with safe integers and decimal strings'); }
  if (Buffer.byteLength(input) > 1024 * 1024) return invalid('normalized input exceeds 1 MiB');
  const child = spawnSync('python3', ['-B', planner, operation], {
    input, encoding: 'utf8', timeout: 10000, maxBuffer: 2 * 1024 * 1024,
  });
  if (child.error || ![0, 2, 3].includes(child.status ?? -1)) {
    return invalid('planner runtime failed; Python 3.10 or later is required');
  }
  try {
    // The bundled, unchanged producer owns this result contract.
    const result = JSON.parse(child.stdout) as PlanResult;
    if ({ ready: 0, invalid: 2, blocked: 3 }[result.status] !== child.status) throw new Error();
    validateNumbers(result);
    return result;
  } catch { return invalid('planner returned an invalid result'); }
}
