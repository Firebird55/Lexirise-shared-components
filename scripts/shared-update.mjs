
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,existsSync,cpSync,rmSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {resolve,dirname,join} from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const version=process.argv[process.argv.indexOf('--version')+1];
if(!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version??''))throw new Error('Provide --version <released-version>.');
if(!process.argv.includes('--all'))throw new Error('Use --all to update both consumers together.');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),siblings=dirname(root),temp=mkdtempSync(join(tmpdir(),'lexirise-release-'));
const run=(cmd,args,cwd=temp)=>execFileSync(cmd,args,{cwd,encoding:'utf8',stdio:'pipe',shell:process.platform==='win32'&&cmd==='npm',maxBuffer:32*1024*1024});
const repo='Firebird55/Lexirise-shared-components',archive='firebird55-lexirise-components-'+version+'.tgz';
run('gh',['release','download','v'+version,'--repo',repo,'--dir',temp,'--pattern',archive,'--pattern','SHA256SUMS','--pattern','PROVENANCE.json']);
const expected=readFileSync(join(temp,'SHA256SUMS'),'utf8').split('\n').find(l=>l.endsWith('  '+archive))?.split(' ')[0];
if(createHash('sha256').update(readFileSync(join(temp,archive))).digest('hex')!==expected)throw new Error('Shared package checksum mismatch.');
const provenance=JSON.parse(readFileSync(join(temp,'PROVENANCE.json'),'utf8'));
const releasedCommit=run('gh',['api','repos/'+repo+'/commits/v'+version,'--jq','.sha']).trim();
if(provenance.sourceCommit!==releasedCommit||provenance.version!==version||provenance.repository!==repo)throw new Error('Release source revision mismatch.');
const listing=run('tar',['-tf',archive]).trim().split('\n');
if(listing.some(p=>!p.startsWith('package/')||p.includes('..')||p.includes('\\')))throw new Error('Unsafe package archive path.');
run('tar',['-xf',archive]);
const packed=JSON.parse(readFileSync(join(temp,'package/package.json'),'utf8'));
if(packed.name!=='@firebird55/lexirise-components'||packed.version!==version)throw new Error('Wrong package.');
if(JSON.parse(readFileSync(join(temp,'package/PROVENANCE.json'),'utf8')).sourceCommit!==releasedCommit)throw new Error('Package source revision mismatch.');
for(const project of ['emulingo','gamesenteneminer']){
 const dir=join(siblings,project),vendor=join(dir,'vendor/lexirise-components');if(!existsSync(join(dir,'package.json')))throw new Error('Consumer missing: '+dir);
 if(run('git',['status','--porcelain','--','vendor/lexirise-components'],dir).trim())throw new Error('Commit consumer vendor changes before updating.');
 mkdirSync(dirname(vendor),{recursive:true});if(existsSync(vendor))rmSync(vendor,{recursive:true});cpSync(join(temp,'package'),vendor,{recursive:true});
 const path=join(dir,'package.json'),pkg=JSON.parse(readFileSync(path,'utf8'));pkg.dependencies['@firebird55/lexirise-components']='file:vendor/lexirise-components';writeFileSync(path,JSON.stringify(pkg,null,2)+'\n');
 console.log(project+': '+version+' @ '+releasedCommit);console.log(run('npm',['install','--ignore-scripts'],dir));
 console.log(run('npm',['run','check'],dir));
 run('git',['add','package.json','package-lock.json','vendor/lexirise-components'],dir);
 if(run('git',['diff','--cached','--name-only'],dir).trim())console.log(run('git',['commit','-m','Update shared Lexirise components to '+version],dir));
}
console.log('Both consumer integrations checked and committed.');
