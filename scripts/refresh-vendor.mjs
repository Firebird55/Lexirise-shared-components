import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const name='@firebird55/lexirise-components';
export function invalidateVendorLock(lock){
 if(!lock.packages||lock.lockfileVersion<2)throw new Error('A modern package-lock.json is required.');
 const next=structuredClone(lock);
 delete next.packages['node_modules/'+name];delete next.packages['vendor/lexirise-components'];
 if(next.dependencies)delete next.dependencies[name];
 return next;
}
export function refreshVendorInstallation(dir,run){
 const lockPath=join(dir,'package-lock.json'),vendor=join(dir,'vendor/lexirise-components'),installed=join(dir,'node_modules',name);
 // A file: path is stable across releases. npm install/update may otherwise
 // keep stale lock metadata and an old copied node_modules package.
 writeFileSync(lockPath,JSON.stringify(invalidateVendorLock(JSON.parse(readFileSync(lockPath,'utf8'))),null,2)+'\n');
 console.log(run('npm',['install','--package-lock-only','--ignore-scripts'],dir));
 const version=JSON.parse(readFileSync(join(vendor,'package.json'),'utf8')).version;
 const locked=JSON.parse(readFileSync(lockPath,'utf8')).packages['node_modules/'+name];
 if(locked?.version!==version)throw new Error('Shared lockfile version did not refresh.');
 console.log(run('npm',['ci'],dir));
 if(JSON.parse(readFileSync(join(installed,'package.json'),'utf8')).version!==version)throw new Error('Stale installed shared package.');
 function verify(folder=''){
  for(const entry of readdirSync(join(vendor,folder),{withFileTypes:true})){
   if(['desktop.ini','.DS_Store'].includes(entry.name))continue;
   const relative=join(folder,entry.name);
   if(entry.isDirectory())verify(relative);
   else if(entry.isFile()&&!readFileSync(join(vendor,relative)).equals(readFileSync(join(installed,relative))))throw new Error('Installed shared file differs from the verified package: '+relative);
  }
 }
 verify();console.log('Installed shared '+version+' matches the complete verified vendor payload.');
}

