
import {readFileSync,statSync} from 'node:fs';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';
const sums=readFileSync('release/SHA256SUMS','utf8').trim().split('\n'),pkg=JSON.parse(readFileSync('package.json','utf8'));
for(const line of sums){const [hash,file]=line.split('  ');if(!file||file.includes('/')||file.includes('..'))throw new Error('Unsafe checksum name');const data=readFileSync('release/'+file);if(createHash('sha256').update(data).digest('hex')!==hash)throw new Error('Checksum mismatch');
 if(/\.(?:js|json|md|txt)$/.test(file)&&/lx_[A-Za-z0-9]{40,}|gh[pousr]_[A-Za-z0-9]{30,}/.test(data.toString()))throw new Error('Secret in artifact');
 if(file.endsWith('.user.js')){if(!data.toString().includes('@version      '+pkg.version)&&!new RegExp('@version\\s+'+pkg.version.replaceAll('.','\\.')).test(data.toString()))throw new Error('Userscript version mismatch');if(/@(?:updateURL|downloadURL)/.test(data.toString()))throw new Error('Private userscript must not embed automatic download credentials');}
 if(file.endsWith('.zip')){const entries=execFileSync('tar',['-tf','release/'+file],{encoding:'utf8'}).split('\n');if(entries.some(p=>/node_modules\/|\/data\/|\.dpapi$|\.db$|\.mp3$|\.wav$|^\.git\//.test(p)))throw new Error('Private/generated asset in ZIP');if(pkg.name==='game-immersion-toolkit'&&!entries.some(p=>p.includes('/dist/client/')))throw new Error('Built frontend missing');}
}
const provenance=JSON.parse(readFileSync('release/PROVENANCE.json','utf8'));
if(provenance.version!==pkg.version||provenance.sourceCommit!==execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim())throw new Error('Artifact provenance mismatch');
console.log('Checksums, metadata and private-artifact boundaries verified.');
