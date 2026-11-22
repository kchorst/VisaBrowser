import test from 'node:test';
import assert from 'node:assert/strict';
import { selectBorderRestrictions } from '../site/restrictions-bridge.js';

function item(overrides={}) {
  return { destination:'RW', id:'test', status:'verified', visabrowser_alert:true,
    rule:'Restricted import', scope:'national', checkedAt:'2026-11-22',
    relevance:['customs'], sources:[{authority:'Official',url:'https://example.gov'}], ...overrides };
}
test('no source or wrong schema returns no warnings', () => {
  assert.deepEqual(selectBorderRestrictions(null,'RW'),[]);
  assert.deepEqual(selectBorderRestrictions({schemaVersion:9,records:[item()]},'RW'),[]);
});
test('border-only scoped data passes', () => {
  const data={schemaVersion:1,records:[item(),item({destination:'GB'}),item({relevance:['driving']})]};
  assert.equal(selectBorderRestrictions(data,'RW').length,1);
});
test('unverified, unsafe and unsourced claims are excluded', () => {
  const records=[item({status:'unverified'}),item({status:'conflicting'}),
    item({sources:[]}),item({sources:[{authority:'x',url:'http://insecure.example'}]}),
    item({checkedAt:null}),item({visabrowser_alert:false})];
  assert.deepEqual(selectBorderRestrictions({schemaVersion:1,records},'RW'),[]);
});
test('territory codes require exact match; no parent-country inheritance',()=>{
  assert.deepEqual(selectBorderRestrictions({schemaVersion:1,records:[item({destination:'X-GAL'})]},'EC'),[]);
});
