import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
test('lookup has one bounded desktop sizing rule, independent of transcript text size',()=>{
 const css=readFileSync('src/styles.css','utf8');
 const rules=[...css.matchAll(/^\.word-sheet \{([^}]+)\}/gm)];
 assert.equal(rules.length,1,'Do not override away the compact desktop height cap');
 assert.match(rules[0][1],/width:min\(400px/);assert.match(rules[0][1],/max-height:min\(320px,var\(--available-height,320px\)/);
 assert.match(rules[0][1],/font:13px/);assert(!rules[0][1].includes('--lexirise-font-size'));
 assert.match(css,/\.word-sheet-body \{ flex:1 1 auto; min-height:0; overflow:auto/);
 assert.match(css,/\.word-sheet-title \{[^}]+font-size:30px/);
});
test('mobile lookup is narrower and height limited without removing touch controls',()=>{
 const css=readFileSync('src/styles.css','utf8');
 assert.match(css,/width:min\(340px,calc\(100vw - 32px\)\)/);
 assert.match(css,/max-height:min\(360px,60dvh,var\(--available-height,360px\)\)/);
 assert.match(css,/\.word-tabs button \{ min-height:44px; \}/);
 assert.match(css,/\.word-levels button \{ min-width:36px; min-height:40px; \}/);
});

