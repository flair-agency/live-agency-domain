import { buildPlan } from '../../../shared/foreign-revenue-core/src/index.mts';
const chunks: Buffer[] = [];
let bytes = 0;
let result;
try {
  for await (const part of process.stdin) {
    const chunk = Buffer.isBuffer(part) ? part : Buffer.from(part as string);
    bytes += chunk.length;
    if (bytes > 1024 * 1024) throw new Error('bounded input');
    chunks.push(chunk);
  }
  const input: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  result = buildPlan('recognition', input);
} catch {
  process.stdin.destroy();
  result = { status: 'invalid' as const, issues: ['stdin must contain bounded normalized JSON'] };
}
process.stdout.write(JSON.stringify(result) + '\n');
process.exitCode = { ready: 0, blocked: 3, invalid: 2 }[result.status];
