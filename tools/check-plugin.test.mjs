import assert from 'node:assert/strict';
import { cpSync, existsSync, linkSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { isWithin } from './plugin-paths.mjs';

const source = fileURLToPath(new URL('../', import.meta.url));
const relativePlugin = 'plugins/live-agency-domain';
const contexts = relativePlugin + '/skills/domain-guide/references/contexts.md';
const ownership = relativePlugin + '/skills/domain-guide/references/ownership.md';

function fixture(t) {
  const temporary = realpathSync(mkdtempSync(path.join(tmpdir(), 'live-agency-plugin-test-')));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  const root = path.join(temporary, 'repo');
  mkdirSync(root);
  for (const name of ['tools', 'docs', 'plugins', '.agents', 'LICENSE']) {
    cpSync(path.join(source, name), path.join(root, name), { recursive: true });
  }
  const run = (sync = false) => spawnSync(process.execPath, ['tools/check-plugin.mjs', ...(sync ? ['--sync'] : [])], { cwd: root, encoding: 'utf8' });
  return { root, temporary, run };
}

test('clean payload passes; sync restores canonical copies', (t) => {
  const { root, run } = fixture(t);
  assert.equal(run().status, 0);
  writeFileSync(path.join(root, contexts), 'stale copy\n');
  assert.notEqual(run().status, 0);
  const result = run(true);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readFileSync(path.join(root, contexts)), readFileSync(path.join(root, 'docs/domain/contexts.md')));
});

test('later symlink target stops sync before creating an earlier missing file', (t) => {
  const { root, temporary, run } = fixture(t);
  unlinkSync(path.join(root, contexts));
  const sentinel = path.join(temporary, 'sentinel.md');
  writeFileSync(sentinel, 'outside content\n');
  unlinkSync(path.join(root, ownership));
  symlinkSync(sentinel, path.join(root, ownership), 'file');
  const result = run(true);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Symlink/);
  assert.equal(readFileSync(sentinel, 'utf8'), 'outside content\n');
  assert.equal(existsSync(path.join(root, contexts)), false);
});

test('hard-linked later destination stops sync before mutating any file', (t) => {
  const { root, temporary, run } = fixture(t);
  const sentinel = path.join(temporary, 'sentinel');
  const target = path.join(root, relativePlugin, 'LICENSE');
  writeFileSync(sentinel, 'outside content\n');
  unlinkSync(target);
  linkSync(sentinel, target);
  writeFileSync(path.join(root, contexts), 'stale copy\n');
  const result = run(true);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Hard-linked sync destination/);
  assert.equal(readFileSync(sentinel, 'utf8'), 'outside content\n');
  assert.equal(readFileSync(target, 'utf8'), 'outside content\n');
  assert.equal(readFileSync(path.join(root, contexts), 'utf8'), 'stale copy\n');
});

for (const relative of ['plugins', relativePlugin + '/skills/domain-guide/references']) {
  test(`symlink ancestor ${relative} is rejected before any copy`, (t) => {
    const { root, temporary, run } = fixture(t);
    const outside = path.join(temporary, 'outside');
    renameSync(path.join(root, relative), outside);
    symlinkSync(outside, path.join(root, relative), 'junction');
    const protectedFile = path.join(outside, relative === 'plugins' ? 'live-agency-domain/skills/domain-guide/references/contexts.md' : 'contexts.md');
    writeFileSync(protectedFile, 'outside stale copy\n');
    const result = run(true);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Symlink/);
    assert.equal(readFileSync(protectedFile, 'utf8'), 'outside stale copy\n');
  });
}

test('dangling symlink target does not create its external destination', (t) => {
  const { root, temporary, run } = fixture(t);
  const missing = path.join(temporary, 'absent.md');
  unlinkSync(path.join(root, ownership));
  symlinkSync(missing, path.join(root, ownership), 'file');
  writeFileSync(path.join(root, contexts), 'stale copy\n');
  const result = run(true);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Symlink/);
  assert.equal(existsSync(missing), false);
  assert.equal(readFileSync(path.join(root, contexts), 'utf8'), 'stale copy\n');
});

test('symlinked later source prevents earlier destination mutation', (t) => {
  const { root, temporary, run } = fixture(t);
  const outside = path.join(temporary, 'license');
  writeFileSync(outside, 'external source\n');
  unlinkSync(path.join(root, 'LICENSE'));
  symlinkSync(outside, path.join(root, 'LICENSE'), 'file');
  writeFileSync(path.join(root, contexts), 'stale copy\n');
  assert.notEqual(run(true).status, 0);
  assert.equal(readFileSync(path.join(root, contexts), 'utf8'), 'stale copy\n');
});

test('unrelated plugin symlink is rejected before sync writes', (t) => {
  const { root, temporary, run } = fixture(t);
  symlinkSync(temporary, path.join(root, relativePlugin, 'unexpected-link'), 'junction');
  writeFileSync(path.join(root, contexts), 'stale copy\n');
  assert.notEqual(run(true).status, 0);
  assert.equal(readFileSync(path.join(root, contexts), 'utf8'), 'stale copy\n');
});

test('unexpected payload and escaping references are rejected', (t) => {
  const { root, run } = fixture(t);
  const extra = path.join(root, relativePlugin, 'unexpected.txt');
  writeFileSync(extra, 'extra\n');
  assert.notEqual(run().status, 0);
  unlinkSync(extra);
  const entry = path.join(root, relativePlugin, 'skills/domain-guide/SKILL.md');
  writeFileSync(entry, readFileSync(entry, 'utf8') + '\n[Escape](../../../outside.md)\n');
  const result = run();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Reference escapes plugin/);
});

for (const [name, paths, root] of [
  ['POSIX', path.posix, '/repo/plugin'],
  ['Windows drive', path.win32, 'C:\\repo\\plugin'],
  ['Windows UNC', path.win32, '\\\\server\\share\\repo\\plugin'],
]) {
  test(`${name} containment accepts children and rejects parent/sibling escapes`, () => {
    assert(isWithin(root, paths.resolve(root, 'skills/domain-guide/references/contexts.md'), paths));
    assert(!isWithin(root, paths.resolve(root, '../outside.md'), paths));
    assert(!isWithin(root, paths.resolve(root + '-sibling', 'file.md'), paths));
    if (paths === path.win32) assert(!isWithin(root, 'D:\\outside.md', paths));
  });
}
