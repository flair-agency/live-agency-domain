import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const failures: string[] = [];

function visit(directory: string): void {
  for (const name of readdirSync(directory)) {
    if (name === '.git') continue;
    if (directory === root && name === 'node_modules') continue;
    const file = join(directory, name);
    const stat = lstatSync(file);
    if (stat.isSymbolicLink()) {
      failures.push(`Symlink in public source: ${file}`);
    } else if (stat.isDirectory()) {
      visit(file);
    } else if (file.endsWith('.md')) {
      for (const match of readFileSync(file, 'utf8').matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
        const target = match[1];
        if (!target) continue;
        if (/^(?:https?:|mailto:)/.test(target)) continue;
        if (!existsSync(resolve(dirname(file), target))) {
          failures.push(`Broken relative link: ${file} -> ${target}`);
        }
      }
    }
  }
}

if (existsSync(join(root, '.gitmodules'))) failures.push('Public source contains .gitmodules');
visit(root);

try {
  const index = execFileSync('git', ['ls-files', '--stage', '-z', '--', '.'], {
    cwd: root,
    encoding: 'utf8',
  });
  const entries = index.split('\0').filter(Boolean);
  if (entries.some((line) => line.startsWith('160000 '))) {
    failures.push('Public source contains a Gitlink');
  }
  if (entries.some((line) => {
    const file = line.slice(line.indexOf('\t') + 1);
    return file === 'node_modules' || file.startsWith('node_modules/');
  })) failures.push('Public source tracks development node_modules');
} catch {
  failures.push('Unable to inspect the Git index for Gitlinks');
}

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exitCode = 1;
} else {
  console.log('Public source structure and relative links passed.');
}
