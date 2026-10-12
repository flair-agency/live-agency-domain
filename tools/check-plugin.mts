import assert from 'node:assert/strict';
import { copyFileSync, existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { assertSafePath, assertTreeWithoutSymlinks, isWithin } from './plugin-paths.mts';

const root = realpathSync(process.cwd());
const plugin = join(root, 'plugins/live-agency-domain');
const skill = join(plugin, 'skills/domain-guide');
const copies: ReadonlyArray<readonly [source: string, target: string]> = [
  ['docs/domain/contexts.md', 'skills/domain-guide/references/contexts.md'],
  ['docs/architecture/ownership.md', 'skills/domain-guide/references/ownership.md'],
  ['LICENSE', 'LICENSE'],
];
assert(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--sync'), 'Use check-plugin.mts [--sync]');
if (process.argv[2] === '--sync') {
  const { mkdirSync } = await import('node:fs');
  assertSafePath(root, plugin, { allowMissing: true, directory: true });
  assertTreeWithoutSymlinks(plugin);
  // Validate every source and destination before the first filesystem mutation.
  for (const [source, target] of copies) {
    assertSafePath(root, join(root, source));
    assertSafePath(root, join(plugin, target), { allowMissing: true, singleLink: true });
  }
  for (const [source, target] of copies) {
    mkdirSync(dirname(join(plugin, target)), { recursive: true });
    copyFileSync(join(root, source), join(plugin, target));
  }
}
function objectValue(value: unknown, label: string): Record<string, unknown> {
  assert(typeof value === 'object' && value !== null && !Array.isArray(value), `Expected object: ${label}`);
  return value as Record<string, unknown>;
}

function readObject(file: string): Record<string, unknown> {
  const value: unknown = JSON.parse(readFileSync(file, 'utf8'));
  return objectValue(value, file);
}

const manifest = readObject(join(plugin, 'plugin.json'));
assert.equal(manifest.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
assert.equal(manifest.name, 'live-agency-domain');
assert(typeof manifest.version === 'string');
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
assert.equal(manifest.license, 'MIT');
const extensions = objectValue(manifest.extensions, 'extensions');
assert.deepEqual(Object.keys(extensions), ['com.openai']);
const openai = objectValue(extensions['com.openai'], 'com.openai');
assert.deepEqual(Object.keys(openai), ['interface']);
assert.deepEqual(objectValue(openai.interface, 'interface').capabilities, ['Read']);
assert(!('skills' in manifest), 'Portable skills use the fixed skills/ directory');
const marketplace = readObject(join(root, '.agents/plugins/marketplace.json'));
assert.equal(marketplace.name, 'live-agency-public');
assert(Array.isArray(marketplace.plugins));
const plugins: unknown[] = marketplace.plugins;
assert.equal(plugins.length, 1);
const entry = objectValue(plugins[0], 'marketplace entry');
assert.equal(entry.name, manifest.name);
assert.deepEqual(entry.source, { source: 'local', path: './plugins/live-agency-domain' });
const entrySource = objectValue(entry.source, 'entry source');
assert(typeof entrySource.path === 'string');
assert.equal(resolve(root, entrySource.path), plugin);
assert.deepEqual(entry.policy, { installation: 'AVAILABLE', authentication: 'ON_INSTALL' });
assert.equal(entry.category, 'Productivity');
assert.deepEqual(readdirSync(join(plugin, 'skills')), ['domain-guide']);
const instructions = readFileSync(join(skill, 'SKILL.md'), 'utf8');
assert.match(instructions, /^---\nname: domain-guide\ndescription: [^\n]+\n---\n/);
for (const [source, target] of copies) {
  assert(readFileSync(join(plugin, target)).equals(readFileSync(join(root, source))), `Distribution copy drift: ${target}`);
}
const allowed = new Set(['plugin.json', 'LICENSE', 'skills/domain-guide/SKILL.md', ...copies.map(([, target]) => target)]);
function inspect(directory: string, prefix = ''): void {
  for (const name of readdirSync(directory)) {
    const relative = prefix + name;
    const file = join(directory, name);
    const stat = lstatSync(file);
    assert(!stat.isSymbolicLink(), `Symlink in plugin: ${relative}`);
    if (stat.isDirectory()) inspect(file, relative + '/');
    else {
      assert(allowed.has(relative), `Unexpected plugin payload: ${relative}`);
      allowed.delete(relative);
      if (name.endsWith('.md')) {
        for (const match of readFileSync(file, 'utf8').matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
          const target = match[1];
          assert(target);
          if (/^https?:/.test(target)) continue;
          const resolved = resolve(dirname(file), target);
          assert(isWithin(plugin, resolved), `Reference escapes plugin: ${target}`);
          assert(existsSync(resolved), `Missing packaged reference: ${target}`);
        }
      }
    }
  }
}
inspect(plugin);
assert.equal(allowed.size, 0, `Missing payload files: ${[...allowed].join(', ')}`);
console.log(`Plugin ${manifest.name}@${manifest.version}: marketplace, bounded payload and canonical copies passed.`);
