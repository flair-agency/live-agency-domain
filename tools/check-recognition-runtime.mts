import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
/** Scoped distribution check, not monitoring of local commands or unrelated legacy components. */
export function checkRecognitionRuntime(root: string): void {
  for (const folder of ['packages/foreign-revenue-core', 'plugins/live-agency-domain']) {
    function visit(dir: string): void {
      for (const item of readdirSync(dir, { withFileTypes: true })) {
        if (item.name === 'node_modules') continue;
        const path = join(dir, item.name);
        if (item.isDirectory()) visit(path);
        else {
          assert(!/\.(?:py|pyc|pyo|sh)$/.test(item.name), `Additional runtime file: ${path}`);
          assert(/\.(?:mts|cts|ts|tsx|mjs|cjs|js|jsx|json|md)$/.test(item.name) || ['LICENSE','NOTICE'].includes(item.name), `Unsupported scoped artifact file: ${path}`);
          if (/\.(?:mts|cts|ts|tsx|mjs|cjs|js|jsx|json)$/.test(item.name)) {
            const source=readFileSync(path, 'utf8');
            assert(!/\bpython(?:3)?\b|plan_foreign_revenue\.py/.test(source), `Additional runtime invocation/dependency: ${path}`);
            const implementation = !relative(join(root,folder),path).split(/[\\/]/).includes('test') && /\.(?:mts|cts|ts|tsx|mjs|cjs|js|jsx)$/.test(item.name);
            if (implementation) assert(!/\bchild_process\b|\b(?:Deno|Bun)\b/.test(source), `Scoped calculation and Plugin entries cannot add subprocess/runtime access: ${path}`);
          }
        }
      }
    }
    visit(join(root, folder));
  }
}
if (process.argv[1] === import.meta.filename) { checkRecognitionRuntime(process.cwd()); console.log('Recognition source and payload use Node only.'); }
