import assert from 'node:assert/strict';
import { lstatSync, readdirSync, realpathSync, type Stats } from 'node:fs';
import path from 'node:path';

export function isWithin(root: string, target: string, paths: typeof path = path): boolean {
  const relative = paths.relative(root, target);
  return relative !== '..' && !relative.startsWith('..' + paths.sep) && !paths.isAbsolute(relative);
}

// Inspect each existing component, including dangling links. Missing destinations
// are allowed, but no directory creation or file copy happens during preflight.
type SafePathOptions = { allowMissing?: boolean; directory?: boolean; singleLink?: boolean };

export function assertSafePath(root: string, target: string, { allowMissing = false, directory = false, singleLink = false }: SafePathOptions = {}): void {
  assert(isWithin(root, target), `Path escapes source root: ${target}`);
  const parts = path.relative(root, target).split(path.sep).filter(Boolean);
  let current = root;
  for (const [index, part] of parts.entries()) {
    current = path.join(current, part);
    let stat: Stats;
    try {
      stat = lstatSync(current);
    } catch (error) {
      if (allowMissing && error instanceof Error && 'code' in error && error.code === 'ENOENT') return;
      throw error;
    }
    assert(!stat.isSymbolicLink(), `Symlink in sync path: ${current}`);
    assert(isWithin(root, realpathSync(current)), `Resolved path escapes source root: ${current}`);
    const needsDirectory = index < parts.length - 1 || directory;
    assert(needsDirectory ? stat.isDirectory() : stat.isFile(), `Invalid sync path type: ${current}`);
    if (!needsDirectory && singleLink) {
      assert.equal(stat.nlink, 1, `Hard-linked sync destination: ${current}`);
    }
  }
}

export function assertTreeWithoutSymlinks(directory: string): void {
  let stat: Stats;
  try {
    stat = lstatSync(directory);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return;
    throw error;
  }
  assert(!stat.isSymbolicLink(), `Symlink in plugin: ${directory}`);
  if (stat.isDirectory()) {
    for (const name of readdirSync(directory)) assertTreeWithoutSymlinks(path.join(directory, name));
  } else {
    assert(stat.isFile(), `Invalid plugin file type: ${directory}`);
  }
}
