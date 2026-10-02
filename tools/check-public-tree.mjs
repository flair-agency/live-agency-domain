import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const root = process.cwd();
const failures = [];

function visit(directory) {
  for (const name of readdirSync(directory)) {
    if (name === '.git') continue;
    const file = join(directory, name);
    const stat = lstatSync(file);
    if (stat.isSymbolicLink()) {
      failures.push(`Symlink in public source: ${file}`);
    } else if (stat.isDirectory()) {
      visit(file);
    } else if (file.endsWith('.md')) {
      for (const match of readFileSync(file, 'utf8').matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
        const target = match[1];
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
  const index = execFileSync('git', ['ls-files', '--stage', '--', '.'], {
    cwd: root,
    encoding: 'utf8',
  });
  if (index.split('\n').some((line) => line.startsWith('160000 '))) {
    failures.push('Public source contains a Gitlink');
  }
} catch {
  failures.push('Unable to inspect the Git index for Gitlinks');
}

if (failures.length) {
  for (const failure of failures) console.error(failure);
  process.exitCode = 1;
} else {
  console.log('Public source structure and relative links passed.');
}
