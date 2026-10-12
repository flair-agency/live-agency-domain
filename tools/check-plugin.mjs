import assert from 'node:assert/strict';
import { copyFileSync, existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const plugin = join(root, 'plugins/live-agency-domain');
const skill = join(plugin, 'skills/domain-guide');
const copies = [
  ['docs/domain/contexts.md', 'skills/domain-guide/references/contexts.md'],
  ['docs/architecture/ownership.md', 'skills/domain-guide/references/ownership.md'],
  ['LICENSE', 'LICENSE'],
];
assert(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === '--sync'), 'Use check-plugin.mjs [--sync]');
if (process.argv[2] === '--sync') {
  const { mkdirSync } = await import('node:fs');
  for (const [source, target] of copies) {
    mkdirSync(dirname(join(plugin, target)), { recursive: true });
    copyFileSync(join(root, source), join(plugin, target));
  }
}
const manifest = JSON.parse(readFileSync(join(plugin, 'plugin.json'), 'utf8'));
assert.equal(manifest.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
assert.equal(manifest.name, 'live-agency-domain');
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
assert.equal(manifest.license, 'MIT');
assert.deepEqual(Object.keys(manifest.extensions), ['com.openai']);
assert.deepEqual(Object.keys(manifest.extensions['com.openai']), ['interface']);
assert.deepEqual(manifest.extensions['com.openai'].interface.capabilities, ['Read']);
assert(!('skills' in manifest), 'Portable skills use the fixed skills/ directory');
const marketplace = JSON.parse(readFileSync(join(root, '.agents/plugins/marketplace.json'), 'utf8'));
assert.equal(marketplace.name, 'live-agency-public');
assert.equal(marketplace.plugins.length, 1);
const entry = marketplace.plugins[0];
assert.equal(entry.name, manifest.name);
assert.deepEqual(entry.source, { source: 'local', path: './plugins/live-agency-domain' });
assert.equal(resolve(root, entry.source.path), plugin);
assert.deepEqual(entry.policy, { installation: 'AVAILABLE', authentication: 'ON_INSTALL' });
assert.equal(entry.category, 'Productivity');
assert.deepEqual(readdirSync(join(plugin, 'skills')), ['domain-guide']);
const instructions = readFileSync(join(skill, 'SKILL.md'), 'utf8');
assert.match(instructions, /^---\nname: domain-guide\ndescription: [^\n]+\n---\n/);
for (const [source, target] of copies) {
  assert(readFileSync(join(plugin, target)).equals(readFileSync(join(root, source))), `Distribution copy drift: ${target}`);
}
const allowed = new Set(['plugin.json', 'LICENSE', 'skills/domain-guide/SKILL.md', ...copies.map(([, target]) => target)]);
function inspect(directory, prefix = '') {
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
          if (/^https?:/.test(target)) continue;
          const resolved = resolve(dirname(file), target);
          assert(resolved.startsWith(plugin + '/'), `Reference escapes plugin: ${target}`);
          assert(existsSync(resolved), `Missing packaged reference: ${target}`);
        }
      }
    }
  }
}
inspect(plugin);
assert.equal(allowed.size, 0, `Missing payload files: ${[...allowed].join(', ')}`);
console.log(`Plugin ${manifest.name}@${manifest.version}: marketplace, bounded payload and canonical copies passed.`);
