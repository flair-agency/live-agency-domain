import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
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
          if (/\.(?:mts|mjs|json)$/.test(item.name)) {
            assert(!/\bpython(?:3)?\b|plan_foreign_revenue\.py/.test(readFileSync(path, 'utf8')), `Additional runtime invocation/dependency: ${path}`);
          }
        }
      }
    }
    visit(join(root, folder));
  }
}
if (process.argv[1] === import.meta.filename) { checkRecognitionRuntime(process.cwd()); console.log('Recognition source and payload use Node only.'); }
