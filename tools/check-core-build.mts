import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';
const root=process.cwd();
const output=mkdtempSync(join(tmpdir(),'recognition-build-'));
try {
 execFileSync(process.execPath,[join(root,'node_modules/typescript/bin/tsc'),'--project',join(root,'packages/foreign-revenue-core/tsconfig.build.json'),'--outDir',output],{stdio:'inherit'});
 const expected=['index.d.mts','index.mjs'];
 assert.deepEqual(readdirSync(output).sort(),expected);
 assert.deepEqual(readdirSync(join(root,'packages/foreign-revenue-core/dist')).sort(),expected);
 for(const file of expected) {
  const committed=execFileSync('git',['show',':packages/foreign-revenue-core/dist/'+file],{cwd:root});
  assert.ok(readFileSync(join(output,file)).equals(committed),`Indexed build differs from typed source: ${file}`);
 }
 console.log('Committed core JavaScript/declarations match the locked compiler output.');
} finally {rmSync(output,{recursive:true,force:true});}
