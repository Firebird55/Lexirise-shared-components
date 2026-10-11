import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { normalizeWordPopupSettings, orderWordPopupTabs, orderWordPopupDefinitionSections, resolveInitialWordPopupTab, validateWordPopupPatch, popupPreferences, WordPopupControls, settingsPatch, createLexiriseClient } from '../dist/index.js';

test('popup uses account ordering, disabled tabs, defaults and locked definition', () => {
 const layout=normalizeWordPopupSettings({tabs:[{id:'grammar',enabled:true},{id:'notes',enabled:false},{id:'definition',enabled:false}],openOn:'last'});
 assert.deepEqual(orderWordPopupTabs(layout,['definition','grammar','context','notes']),['grammar','definition','context']);
 assert.equal(resolveInitialWordPopupTab(['grammar','definition'],layout,'definition'),'definition');
 assert.equal(resolveInitialWordPopupTab(['grammar','definition'],layout,'notes'),'grammar');
 assert.equal(resolveInitialWordPopupTab(['grammar','definition'],{...layout,openOn:'first'},'definition'),'grammar');
 assert.equal(resolveInitialWordPopupTab([],layout,null),null);
});
test('definition sections keep website order and ensure a readable fallback', () => {
 const layout=normalizeWordPopupSettings({definition:[{id:'frequency',enabled:true},{id:'dictionaries',enabled:false},{id:'breakdown',enabled:false},{id:'senses',enabled:true}]});
 assert.deepEqual(orderWordPopupDefinitionSections(layout,['senses','breakdown','dictionaries','frequency']),['frequency','senses']);
 const unreadable=normalizeWordPopupSettings({definition:layout.definition.map(v=>({...v,enabled:v.id==='frequency'}))});
 assert.deepEqual(orderWordPopupDefinitionSections(unreadable,['senses','dictionaries','frequency']),['frequency','dictionaries','senses']);
 const none=normalizeWordPopupSettings({definition:layout.definition.map(v=>({...v,enabled:false}))});
 assert.deepEqual(orderWordPopupDefinitionSections(none,['senses','dictionaries','frequency']),['frequency','dictionaries','senses']);
});
test('unknown popup ids and malformed writes fail before account transport', () => {
 for(const value of [{tabs:[{id:'invalid',enabled:true}]},{definition:[{id:'grammar',enabled:true}]},{openOn:'latest'},{tabs:[{id:'grammar',enabled:'yes'}]},{tabs:[{id:'grammar',enabled:true},{id:'grammar',enabled:false}]}])assert.throws(()=>validateWordPopupPatch(value));
 validateWordPopupPatch(null);validateWordPopupPatch({tabs:[{id:'grammar',enabled:true}],openOn:'last'});
 const before={languages:['zh','ja'],global:{},languageSettings:{zh:{wordPopup:null},ja:{fontSize:'md'}}};
 const after=structuredClone(before);after.languageSettings.zh.wordPopup={tabs:[{id:'grammar',enabled:false}],openOn:'last'};
 assert.deepEqual(settingsPatch(before,after),{languageSettings:{zh:{wordPopup:after.languageSettings.zh.wordPopup}}});
 after.languageSettings.zh.wordPopup.tabs[0].id='unknown';assert.throws(()=>settingsPatch(before,after),/Accepted ids/);
});
test('popup reads only its own language and global hover/disable settings', () => {
 const account={global:{wordPopupOpenMode:'hover',disableWordPopups:true},languageSettings:{zh:{wordPopup:{openOn:'last'}},ja:{wordPopup:{openOn:'first'}}}};
 assert.equal(popupPreferences(account,'zh').layout.openOn,'last');assert.equal(popupPreferences(account,'ja').layout.openOn,'first');
 assert.equal(popupPreferences(account,'zh').hover,true);assert.equal(popupPreferences(account,'zh').disabled,true);
 assert.equal(popupPreferences(null,'zh').layout.openOn,'first');
});
test('popup editor renders labeled reorder and enable controls without account writes', () => {
 const html=renderToStaticMarkup(React.createElement(WordPopupControls,{value:null,onChange:()=>{throw new Error('Rendering must not save');}}));
 assert.match(html,/Move grammar tabs up/);assert.match(html,/Definition sections/);assert.match(html,/Last used tab/);assert.match(html,/Definition tab[^>]+disabled/);
});
test('Words and saved Notes use dictionary metadata and read-only vocabulary transport', async()=>{
 const calls=[];
 const client=createLexiriseClient({cacheScope:'popup-test',configured:()=>true,getValue:async(k,f)=>f,setValue:async()=>{},deleteValue:async()=>{},request:async(path,method)=>{
  calls.push([path,method]);return {status:200,response:path==='/v1/settings'?{languages:['zh'],global:{},languageSettings:{zh:{wordPopup:{openOn:'last'}}}}:path==='/v1/vocabulary/88'?{notes:'Remember this'}:{occurrences:[{word:'的',charStart:0,charEnd:1,isWordLike:true,entryId:1}],entryMetaById:{1:{gloss:'of'}},stateByEntryId:{1:{proficiency:4,saved_expression_id:88}}}};
 }});
 await client.initializeClient();assert.equal(client.getSettings().languageSettings.zh.wordPopup.openOn,'last');
 assert.deepEqual(await(await client.requestReading('的','notes',{start:0})).json(),{notes:'Remember this'});
 assert(calls.some(([path,method])=>path==='/v1/vocabulary/88'&&method==='GET'));assert(!calls.some(([,method])=>method==='PATCH'));
 assert.deepEqual(client.normalizeLookup({characterInfo:{statistics:{topWords:[{word:'我的',gloss:'my',share:.4},null]}}}).topWords,[{word:'我的',trad:'',gloss:'my',share:.4}]);
});
