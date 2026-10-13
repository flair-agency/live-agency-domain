import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import test from 'node:test';
import assert from 'node:assert/strict';
test('clean indexed core installs offline with scripts disabled and exposes the preserved plans',()=>{
 const root=process.cwd(),temp=mkdtempSync(join(tmpdir(),'recognition-package-'));
 try {
  const base='packages/foreign-revenue-core/';
  const files=execFileSync('git',['ls-files','--',base],{cwd:root,encoding:'utf8'}).trim().split('\n');
  for(const file of ['dist/index.mjs','dist/index.d.mts']) assert.ok(files.includes(base+file),'Compiled exports must be tracked');
  const core=join(temp,'core');
  for(const file of files){const target=join(core,file.slice(base.length));mkdirSync(dirname(target),{recursive:true});writeFileSync(target,execFileSync('git',['show',':'+file],{cwd:root}));}
  const npm=process.platform==='win32'?'npm.cmd':'npm';
  const cache=join(temp,'cache');
  const packed=JSON.parse(execFileSync(npm,['pack','--dry-run','--json','--ignore-scripts','--offline','--cache',cache],{cwd:core,encoding:'utf8'})) as Array<{files:Array<{path:string}>}>;
  assert.deepEqual(packed[0]!.files.map(file=>file.path).sort(),['LICENSE','PROVENANCE.md','README.md','dist/index.d.mts','dist/index.mjs','package.json']);
  const client=join(temp,'client');mkdirSync(client);
  writeFileSync(join(client,'package.json'),JSON.stringify({name:'synthetic-core-client',private:true,type:'module',dependencies:{'@flair-agency/foreign-revenue-core':'file:../core'}}));
  for(const args of [['install','--package-lock-only'],['ci']]) execFileSync(npm,[...args,'--ignore-scripts','--offline','--cache',cache],{cwd:client,stdio:'pipe'});
  const entry=join(client,'consumer.mts');
  writeFileSync(entry,"import {buildPlan} from '@flair-agency/foreign-revenue-core';\nconst input:unknown=JSON.parse(process.argv[2]!);\nprocess.stdout.write(JSON.stringify(buildPlan('recognition',input)));\n");
  const cases=JSON.parse(readFileSync(join(root,base,'test/legacy-cases.json'),'utf8')) as Array<{input:unknown;expected:unknown}>;
  for(const item of cases) assert.deepEqual(JSON.parse(execFileSync(process.execPath,[entry,JSON.stringify(item.input)],{cwd:client,encoding:'utf8'})),item.expected);
 } finally {rmSync(temp,{recursive:true,force:true});}
});
