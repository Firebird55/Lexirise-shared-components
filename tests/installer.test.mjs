import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
test('developer installer includes agent instructions without doing setup in instructions-only mode',()=>{
 const output=execFileSync(process.execPath,['scripts/install.mjs','--instructions-only'],{encoding:'utf8'});
 for(const expected of ['AGENTS.md','CONTRIBUTING.md','RELEASE.md','No game files','Never edit consumer'])assert(output.includes(expected));
 for(const file of ['INSTALL.md','INSTALL.html','CONTRIBUTING.md'])assert(readFileSync(file,'utf8').includes('AGENTS.md'));
});
