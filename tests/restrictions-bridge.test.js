import test from 'node:test';
import assert from 'node:assert/strict';
import {selectBorderRestrictions,selectVerifiedBorderRestrictions} from '../site/restrictions-bridge.js';
import {createHash} from 'node:crypto';

const item = (overrides={})=>({
  destination:'RW',id:'rule-1',title:'Prohibited item',rule:'Do not bring a restricted item',
  jurisdiction:'Rwanda',scope:'national',checkedAt:'2026-11-22',status:'verified',noticeKind:'legal_requirement',
  publicationStatus:'approved',visabrowser_alert:true,relevance:['customs'],
  sources:[{authority:'Government',url:'https://example.gov/rule'}],...overrides
});
const pack=(records,overrides={})=>({
  schemaVersion:1,datasetVersion:'release-2026-11-22',publicationStatus:'approved',records,...overrides
});
const run=(p,d='RW',version='release-2026-11-22')=>selectBorderRestrictions(p,d,version);

test('fail closed with no or mismatched approved immutable release',()=>{
 assert.deepEqual(run(null),[]);
 assert.deepEqual(run(pack([item()],{publicationStatus:'research_only'})),[]);
 assert.deepEqual(run(pack([item()],{schemaVersion:2})),[]);
 assert.deepEqual(run(pack([item()]),'RW','different-version'),[]);
 assert.deepEqual(selectBorderRestrictions(pack([item()]),'RW'),[]);
});
test('only border-specific high-confidence records for exact destination appear',()=>{
 const result=run(pack([
  item(),item({id:'driving',relevance:['driving']}),
  item({id:'other-place',destination:'GB'}),
  item({id:'not-reviewed',status:'unverified'}),
  item({id:'incomplete',publicationStatus:'research_only'})]));
 assert.deepEqual(result.map(x=>x.id),['rule-1']);
});
test('unsourced, unscoped and dangerous URL claims stay hidden',()=>{
 const candidates=[
  item({id:'no-source',sources:[]}),item({id:'not-https',sources:[{authority:'x',url:'http://example.com'}]}),
  item({id:'credentials',sources:[{authority:'x',url:'https://a:b@example.com/'}]}),
  item({id:'no-date',checkedAt:null}),item({id:'bad-date',checkedAt:'2026-02-30'}),
  item({id:'no-scope',scope:''}),item({id:'no-title',title:''})];
 assert.deepEqual(run(pack(candidates)),[]);
});
test('territory cannot inherit parent-country restriction',()=>{
 assert.deepEqual(run(pack([item({destination:'X-GAL'})]),'EC'),[]);
});
test('duplicate restriction identifiers cannot generate duplicate alerts',()=>{
 assert.equal(run(pack([item(),item()])).length,1);
});

test('cryptographic release snapshot gate rejects content tampering and stale pins',async()=>{
  const canonical={
    schemaVersion:1,publicationStatus:'approved',approvalId:'SYNTHETIC-TEST',
    approvedAt:'2026-11-22',destinations:['RW'],records:[item()]
  };
  const digest=createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
  const snapshot={...canonical,datasetVersion:'sha256-'+digest,integrity:{algorithm:'SHA-256',hex:digest}};
  const approvedVersion=snapshot.datasetVersion;
  assert.deepEqual((await selectVerifiedBorderRestrictions(snapshot,'RW',approvedVersion)).map(x=>x.id),['rule-1']);
  const altered={...snapshot,records:[{...item(),rule:'Tampered rule'}]};
  assert.deepEqual(await selectVerifiedBorderRestrictions(altered,'RW',approvedVersion),[]);
  assert.deepEqual(await selectVerifiedBorderRestrictions(snapshot,'RW','sha256-'+'0'.repeat(64)),[]);
});

test('date windows include legal endpoints and suppress notices on the review deadline', () => {
  const dataset = pack([
    item({ id: 'legal-window', effectiveFrom: '2026-11-24', effectiveUntil: '2026-11-25' }),
    item({ id: 'review-due', effectiveFrom: '2026-11-24', reviewBy: '2026-11-25' }),
    item({ id: 'invalid-window', effectiveFrom: '2026-02-30' }),
  ]);
  const ids = (asOf) => selectBorderRestrictions(dataset, 'RW', dataset.datasetVersion, { asOf })
    .map(({ id }) => id);
  assert.deepEqual(ids('2026-11-23'), []);
  assert.deepEqual(ids('2026-11-24'), ['legal-window', 'review-due']);
  assert.deepEqual(ids('2026-11-25'), ['legal-window']);
  assert.deepEqual(ids('2026-11-26'), []);
  assert.deepEqual(ids('2026-02-30'), []);
});

test('border notices preserve the advisory distinction and exclude airline policy', () => {
  const output = run(pack([
    item(),
    item({ id: 'advisory', noticeKind: 'official_advisory' }),
    item({ id: 'carrier', noticeKind: 'carrier_policy' }),
    item({ id: 'guidance', noticeKind: 'official_guidance' }),
    item({ id: 'untyped', noticeKind: undefined }),
  ]));
  assert.deepEqual(output.map(({ noticeKind }) => noticeKind),
    ['legal_requirement', 'official_advisory']);
});
