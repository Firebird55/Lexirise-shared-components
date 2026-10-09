
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {settingsPatch, studyLanguages, capabilities, restoreLocalSettings, createLexiriseClient, countUnknownWords, toneStyle, MIGAKU_TONE_PALETTE} from '../dist/index.js';

test('lookup uses requested translation language and falls back honestly to the API target',()=>{
 const c=createLexiriseClient({sourceLanguage:'nl',translationLanguage:'fr',cacheScope:'translation-test',getValue:async(k,f)=>f,setValue:async()=>{},deleteValue:async()=>{},request:async()=>({status:200,response:{}})});
 const raw={translations:[{target_lang:'en',translation:'hello'},{target_lang:'fr',translation:'bonjour'}],translation_target:'fr'};
 assert.equal(c.normalizeLookup(raw).translations[0].meaning,'bonjour');
 const fallback=c.normalizeLookup({translations:[{target_lang:'de',translation:'hallo'}],translation_target:'de'});
 assert.equal(fallback.translations[0].meaning,'hallo');assert.equal(fallback.translationLanguage,'de');assert.equal(fallback.sourceLanguage,'nl');
});
const account=()=>({languages:['zh'],native_lang:'en',global:{translationLanguage:null, effectiveTranslationLanguage:'en',customProficiencyColors:{unknown:'amber',known:'green'}},languageSettings:{zh:{readingAid:'pinyin',toneColors:{1:'derived'}},nl:{fontSize:'md'}}});
test('all 31 exact study languages have applicable language controls',()=>{
 assert.deepEqual(studyLanguages,'zh yue nan ja ko en es fr de it pt ru id ar hi ta th vi tr nl pl cs ro hu sv no da fi la grc lzh'.split(' '));
 for(const code of studyLanguages){assert.ok(capabilities[code].name);const before=account(),after=structuredClone(before);after.languageSettings[code]={...after.languageSettings[code],fontSize:'lg'};assert.deepEqual(settingsPatch(before,after),{languageSettings:{[code]:{fontSize:'lg'}}});}
 assert.equal(capabilities.yue.tones,6);assert.equal(capabilities.ar.direction,'rtl');assert.ok(capabilities.nan.readings.includes('poj'));assert.ok(capabilities.lzh.readings.includes('han_viet'));assert.ok(capabilities.ja.readings.includes('furigana'));assert.deepEqual(capabilities.es.readings,[]);
});
test('minimal writable PATCH, preservation of other languages and derived exclusion',()=>{
 const before=account(),after=structuredClone(before);
 after.native_lang='fr';after.global.effectiveTranslationLanguage='de';after.languageSettings.zh.toneColors={1:'changed'};
 assert.deepEqual(settingsPatch(before,after),{});
 after.languageSettings.zh.readingAid='zhuyin';after.global.customProficiencyColors.known='purple';
 assert.deepEqual(settingsPatch(before,after),{global:{customProficiencyColors:{known:'purple'}},languageSettings:{zh:{readingAid:'zhuyin'}}});
 assert.deepEqual(before.languageSettings.nl,{fontSize:'md'});
 after.languages=[];assert.throws(()=>settingsPatch(before,after),/at least one/);
});
test('local migrations preserve scopes, palettes and thresholds without account writes',()=>{
 const local=restoreLocalSettings({pinyin:'all',toneColors:'off',hideEnglishAt:2,palette:['#123456','#234567','#345678','#456789','#567890'],fontSize:35});
 assert.equal(local.pinyin,'all');assert.equal(local.hideEnglishAt,2);assert.equal(local.fontSize,35);assert.equal(local.palette[0],'#123456');
 assert.equal(restoreLocalSettings({fontSize:100}).fontSize,27);
 assert.equal(countUnknownWords('Hello', [{start:0,end:5,proficiency:4}]),0);
 assert.equal(countUnknownWords('مرحبا', [{start:0,end:5,proficiency:1}]),1);
 assert.equal(countUnknownWords('uncovered', []),null);
 assert.equal(toneStyle([6],'字',[...MIGAKU_TONE_PALETTE,'#123456']).color,'#123456');
});
test('language, translation and account cache isolation; UTF-16 ranges',async()=>{
 const storage=new Map([['lexirise:key','fixture-account-A']]),calls=[];
 const make=(sourceLanguage,translationLanguage)=>createLexiriseClient({sourceLanguage,translationLanguage,cacheScope:'tests',
 getValue:async(k,f)=>storage.has(k)?storage.get(k):f,setValue:async(k,v)=>storage.set(k,v),deleteValue:async k=>storage.delete(k),
 request:async(path,method,body)=>{calls.push({path,method,body});return {status:200,response: path==='/v1/settings'?account():{occurrences:[{word:'hello',charStart:2,charEnd:7,isWordLike:true,entryId:1}],entryMetaById:{1:{gloss:'word'}},stateByEntryId:{1:{proficiency:0}}}};}});
 for(const [source,translation] of [['en','fr'],['nl','en']]){const c=make(source,translation);await c.initializeClient();assert.equal((await c.analyze('😀hello')).tokens[0].start,2);await c.analyze('😀hello');}
 assert.equal(calls.filter(c=>c.path==='/v1/analyze/text').length,2);assert.equal(calls[0].body.language,'en');
 const c=make('en','fr');await c.initializeClient();await c.loadSettings();assert.equal(calls.some(c=>c.method==='PATCH'),false);
 await c.patchSettings({global:{translationLanguage:'fr'}});assert.deepEqual(calls.at(-1).body,{global:{translationLanguage:'fr'}});
 await c.configureKey('fixture-account-B');await c.analyze('😀hello');assert.equal(calls.filter(c=>c.path==='/v1/analyze/text').length,3);
});
test('settings failures surface safely without claiming success or leaking response',async()=>{
 const c=createLexiriseClient({cacheScope:'error',configured:()=>true,getValue:async(k,f)=>f,setValue:async()=>{},deleteValue:async()=>{},request:async()=>({status:400,responseText:'private account detail'})});
 await assert.rejects(c.patchSettings({}),/HTTP 400/);
});
