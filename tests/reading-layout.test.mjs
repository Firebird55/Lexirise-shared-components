import test from 'node:test';
import assert from 'node:assert/strict';
import {readingWordRanges,readingWrapRanges} from '../dist/index.js';

const words = text => readingWordRanges(text).map(({start,end}) => text.slice(start,end));
test('source words retain apostrophes, hyphens and closing punctuation for wrapping', () => {
  assert.deepEqual(words("Ik eet churro's. Oké? Het is café‑achtig…"), ['Ik','eet',"churro's.",'Oké?','Het','is','café‑achtig…']);
  assert.deepEqual(words('l’été, foo-bar! “woord” (ja)'), ['l’été,','foo-bar!','woord”','ja)']);
});
test('CJK closing punctuation follows its provider token without grouping the sentence', () => {
  const text='你好世界，今天一起学习。';
  const tokens=[{start:0,end:2},{start:2,end:4},{start:5,end:7},{start:7,end:9},{start:9,end:11}];
  assert.deepEqual(readingWrapRanges(text,tokens),[{start:2,end:5},{start:9,end:12}]);
  assert.deepEqual(tokens[1],{start:2,end:4});
  const phrase='We gaan naar de stad. Daarna.';
  assert.deepEqual(readingWrapRanges(phrase,[{start:3,end:19}]).map(r=>phrase.slice(r.start,r.end)),['We','gaan naar de stad.','Daarna.']);
});
test('word ranges preserve UTF-16 source offsets and mixed-script wrap opportunities', () => {
  const text = '😀你好 café\u0301, 世界。안녕하세요! مرحبًا.';
  const ranges = readingWordRanges(text);
  assert.deepEqual(ranges[0], {start:5,end:11});
  assert.deepEqual(words(text), ['café\u0301,','안녕하세요!','مرحبًا.']);
  assert.deepEqual(words('你好世界。こんにちは。สวัสดี'), []);
});
