import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {InterfaceLanguageProvider,ReadingOptionsDialog,restoreLocalSettings,interfaceTranslation} from '../dist/index.js';
test('interface localization is isolated from study language and credentials',()=>{
 for(const [locale,label] of [['nl','Leesopties'],['zh-Hans','阅读选项'],['zh-Hant','閱讀選項']]){
  const html=renderToStaticMarkup(React.createElement(InterfaceLanguageProvider,{locale},
   React.createElement(ReadingOptionsDialog,{initial:restoreLocalSettings(null),sourceLanguage:'ja',onChange(){throw Error('No writes');},onClose(){}})));
  assert.ok(html.includes(label));assert.ok(!html.includes('pinyin'));
 }
 assert.equal(interfaceTranslation('Unknown future message','nl'),'Unknown future message');
});
