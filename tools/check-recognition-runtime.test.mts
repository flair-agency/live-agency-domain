import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkRecognitionRuntime } from './check-recognition-runtime.mts';
test('scoped distribution check rejects an extra runtime body and invocation', () => {
  const root = mkdtempSync(join(tmpdir(), 'recognition-runtime-'));
  try {
    for (const dir of ['packages/foreign-revenue-core', 'plugins/live-agency-domain']) mkdirSync(join(root, dir), { recursive: true });
    checkRecognitionRuntime(root);
    const body = join(root, 'packages/foreign-revenue-core/extra.py'); writeFileSync(body, '# fixture');
    assert.throws(() => checkRecognitionRuntime(root), /Additional runtime file/); rmSync(body);
    const entry = join(root, 'plugins/live-agency-domain/entry.mts'); writeFileSync(entry, "spawnSync('python3')");
    assert.throws(() => checkRecognitionRuntime(root), /Additional runtime invocation/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

for (const extension of ['cjs','js','cts','ts','jsx','tsx']) test(`scoped gate scans ${extension} helpers for an extra runtime invocation`, () => {
 const root=mkdtempSync(join(tmpdir(),'recognition-extension-'));
 try {
  for (const dir of ['packages/foreign-revenue-core','plugins/live-agency-domain']) mkdirSync(join(root,dir),{recursive:true});
  const helper=join(root,`packages/foreign-revenue-core/helper.${extension}`);
  writeFileSync(helper,"spawnSync('python3')");
  assert.throws(()=>checkRecognitionRuntime(root),/Additional runtime invocation/);
 } finally { rmSync(root,{recursive:true,force:true}); }
});
