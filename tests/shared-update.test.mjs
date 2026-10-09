import {test} from 'node:test';import assert from 'node:assert/strict';import {invalidateVendorLock} from '../scripts/refresh-vendor.mjs';
test('shared updater invalidates only cached file-package metadata, preserving unrelated locks',()=>{
 const key='node_modules/@firebird55/lexirise-components';
 const lock={lockfileVersion:3,packages:{'':{dependencies:{'@firebird55/lexirise-components':'file:vendor/lexirise-components'}},[key]:{version:'1.0.0'},'vendor/lexirise-components':{version:'1.0.0'},'node_modules/react':{version:'19.2.6',integrity:'unchanged'}},dependencies:{'@firebird55/lexirise-components':{version:'old'},react:{version:'19.2.6'}}};
 const next=invalidateVendorLock(lock);assert.equal(next.packages[key],undefined);assert.equal(next.packages['vendor/lexirise-components'],undefined);
 assert.equal(next.dependencies['@firebird55/lexirise-components'],undefined);assert.deepEqual(next.packages['node_modules/react'],lock.packages['node_modules/react']);assert.deepEqual(next.packages[''],lock.packages['']);assert.deepEqual(next.dependencies.react,lock.dependencies.react);
 assert.equal(lock.packages[key].version,'1.0.0');assert.throws(()=>invalidateVendorLock({lockfileVersion:1}),/modern package-lock/);
});

