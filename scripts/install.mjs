import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
console.log('Lexirise shared components: developer library, not a standalone app. No game files or API key required.');
console.log('AI agents: read AGENTS.md, CONTRIBUTING.md and RELEASE.md. Preserve unrelated work; commit logical changes and check before pushing.');
console.log('Edit shared source here only, publish a checked release, then shared:update --version <version> --all in this repository. Never edit consumer vendor copies.');
console.log('Release using npm run release -- --version <semver>; verify hosted workflows and downloaded checksums.');
if(!process.argv.includes('--instructions-only')) {
 if(Number(process.versions.node.split('.')[0])<24)throw new Error('Install Node.js 24 or newer first.');
 for(const args of [['ci'],['run','check']])execFileSync('npm',args,{cwd:root,stdio:'inherit',shell:process.platform==='win32'});
 console.log('Library installed and checked. Use its release tarball or documented pinned vendor import in an application; see INSTALL.md.');
}
