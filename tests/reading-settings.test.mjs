import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ReadingOptionsControls, ReadingOptionsDialog, DEFAULT_TONE_PALETTE, MIGAKU_TONE_PALETTE, restoreLocalSettings, settingsPatch} from '../dist/index.js';
test('reading controls are independent of account transport and preserve custom colors',()=>{
 const value=restoreLocalSettings({palette:['#123456','#234567','#345678','#456789','#567890'],pinyin:'all'});
 const html=renderToStaticMarkup(React.createElement(ReadingOptionsControls,{value,onChange:()=>{throw new Error('Rendering must not save');}}));
 assert.match(html,/1 · level/);assert.match(html,/5 · neutral/);assert.match(html,/#123456/);assert.match(html,/Tone colors/);
 assert.doesNotMatch(html,/Migaku|account settings|Save to Lexirise/);
 assert.deepEqual(DEFAULT_TONE_PALETTE,MIGAKU_TONE_PALETTE);
});
test('reading dialog renders without credentials or account preferences',()=>{
 const html=renderToStaticMarkup(React.createElement(ReadingOptionsDialog,{initial:restoreLocalSettings(null),onChange:()=>{},onClose:()=>{}}));
 assert.match(html,/role="dialog"/);assert.match(html,/Text size/);assert.match(html,/Hide English translation/);
 assert.doesNotMatch(html,/API key|Reload from Lexirise/);
});
test('current account palettes produce only the explicit per-language change',()=>{
 const before={languages:['zh','ja'],global:{},languageSettings:{zh:{toneColorPreset:'lexirise'},ja:{fontSize:'md'}}};
 for(const preset of ['mdbg','colorblind','custom',null]) {
  const after=structuredClone(before);after.languageSettings.zh.toneColorPreset=preset;
  assert.deepEqual(settingsPatch(before,after),{languageSettings:{zh:{toneColorPreset:preset}}});
 }
 const invalid=structuredClone(before);invalid.languageSettings.zh.toneColorPreset='migaku';
 assert.throws(()=>settingsPatch(before,invalid),/supported Lexirise account tone palette/);
});
test('unchanged legacy account palette is preserved when editing another setting',()=>{
 const before={languages:['zh'],global:{},languageSettings:{zh:{toneColorPreset:'legacy',fontSize:'md'}}};
 const after=structuredClone(before);after.languageSettings.zh.fontSize='lg';
 assert.deepEqual(settingsPatch(before,after),{languageSettings:{zh:{fontSize:'lg'}}});
 assert.deepEqual(restoreLocalSettings({palette:[...MIGAKU_TONE_PALETTE]}).palette,MIGAKU_TONE_PALETTE);
});
