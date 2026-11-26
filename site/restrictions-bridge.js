// Nonproduction: fail-closed adapter for an independently approved Travel-Prep snapshot.
// This module is NOT imported by app.js. It does not alter visa/ETA classification.
import { isCurrentRestriction, isIsoDate, matchesApplicability } from './restrictions-applicability.js';

const ALLOWED_STATUS = new Set(['verified', 'conditional']);
const BORDER_KINDS = new Set(['legal_requirement', 'official_advisory']);
const BORDER = new Set(['entry', 'transit', 'customs', 'departure']);

function safeSource(source) {
  if (!source || typeof source.authority !== 'string' || !source.authority.trim()) return false;
  try {
    const url = new URL(source.url);
    return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password;
  } catch { return false; }
}

function isApprovedBorderRecord(record) {
  return record?.publicationStatus === 'approved' &&
    record.visabrowser_alert === true &&
    BORDER_KINDS.has(record.noticeKind) &&
    ALLOWED_STATUS.has(record.status) &&
    ['id', 'title', 'rule', 'jurisdiction', 'scope'].every(key =>
      typeof record[key] === 'string' && record[key].trim()) &&
    isIsoDate(record.checkedAt) &&
    Array.isArray(record.relevance) && record.relevance.some(value => BORDER.has(value)) &&
    Array.isArray(record.sources) && record.sources.length > 0 && record.sources.every(safeSource);
}

export function selectBorderRestrictions(dataset, destination, approvedVersion = null, context) {
  // Never publish a research register, unapproved snapshot, or arbitrarily newer dataset.
  if (!dataset || dataset.schemaVersion !== 1 || dataset.publicationStatus !== 'approved' ||
      !Array.isArray(dataset.records) || typeof dataset.datasetVersion !== 'string' ||
      !dataset.datasetVersion.trim()) return [];
  if (typeof approvedVersion !== 'string' || !approvedVersion.trim() ||
      dataset.datasetVersion !== approvedVersion) return [];
  if (typeof destination !== 'string' || !destination.trim()) return [];

  const asOf = context?.asOf ?? new Date().toISOString().slice(0, 10);
  const seen = new Set();
  return dataset.records.filter((r) => {
    if (!r || typeof r.id !== 'string' || !r.id.trim() || seen.has(r.id)) return false;
    seen.add(r.id);
    return r.destination === destination &&
      isApprovedBorderRecord(r) &&
      matchesApplicability(r.applicability, context) &&
      isCurrentRestriction(r, asOf);
  });
}

// Production integration must call this asynchronous integrity gate, NOT the
// raw synchronous filter above. An attacker cannot make altered records match
// a previously pinned, independently approved content digest.
export async function verifyApprovedRestrictions(dataset, approvedVersion) {
  if (!dataset || typeof approvedVersion !== 'string' ||
      !/^sha256-[a-f0-9]{64}$/.test(approvedVersion) ||
      dataset.datasetVersion !== approvedVersion ||
      dataset.schemaVersion !== 1 ||
      dataset.publicationStatus !== 'approved' ||
      dataset.audience !== 'visa-browser' ||
      typeof dataset.approvalId !== 'string' || !dataset.approvalId.trim() ||
      !isIsoDate(dataset.approvedAt) ||
      dataset.integrity?.algorithm !== 'SHA-256' ||
      dataset.integrity?.hex !== approvedVersion.slice(7) ||
      !Array.isArray(dataset.destinations) || !Array.isArray(dataset.records))
    return false;
  if (typeof globalThis.crypto?.subtle?.digest !== 'function') return false;
  const destinations = new Set(dataset.destinations);
  if (!destinations.size || destinations.size !== dataset.destinations.length ||
      dataset.destinations.some(code => typeof code !== 'string' || !code.trim())) return false;
  if (dataset.records.some(record => !isApprovedBorderRecord(record) ||
      !destinations.has(record.destination) || record.checkedAt > dataset.approvedAt) ||
      new Set(dataset.records.map(record => record.id)).size !== dataset.records.length) return false;
  try {
    // The canonical key order must match Travel-Prep's build-approved-restrictions.mjs.
    const canonical = {
      schemaVersion:dataset.schemaVersion,
      publicationStatus:dataset.publicationStatus,
      audience:dataset.audience,
      approvalId:dataset.approvalId,
      approvedAt:dataset.approvedAt,
      destinations:dataset.destinations,
      records:dataset.records
    };
    const bytes = new TextEncoder().encode(JSON.stringify(canonical));
    const digest = await globalThis.crypto.subtle.digest('SHA-256',bytes);
    const actual = Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    return actual === dataset.integrity.hex;
  } catch { return false; }
}

export async function selectVerifiedBorderRestrictions(dataset, destination, approvedVersion, context) {
  if (!await verifyApprovedRestrictions(dataset, approvedVersion) ||
      !dataset.destinations.includes(destination)) return [];
  return selectBorderRestrictions(dataset, destination, approvedVersion, context);
}
