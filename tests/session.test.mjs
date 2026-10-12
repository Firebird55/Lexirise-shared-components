import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createReadingSession} from '../dist/session.js';
test('session initialization only reads; dispose aborts pending and queued account writes',async()=>{
 const calls=[];let block=false;
 const session=createReadingSession({request:async(path,method,payload,signal)=>{
  calls.push({path,method});if(block)await new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('locked')),{once:true}));
  return {status:200,response:{languages:['zh'],global:{},languageSettings:{zh:{}}}};
 }});
 await session.initializeClient();assert.deepEqual(calls,[{path:'/v1/settings',method:'GET'}]);block=true;
 const requests=Array.from({length:8},()=>session.patchSettings({global:{translationLanguage:'en'}}));
 await new Promise(resolve=>setTimeout(resolve,10));session.dispose();
 const results=await Promise.allSettled(requests);assert.ok(results.every(r=>r.status==='rejected'));assert.equal(calls.length,5);assert.equal(session.getSettings(),null);
 await assert.rejects(session.analyze('你好'));assert.equal(calls.length,5);
});
