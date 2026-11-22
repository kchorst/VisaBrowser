// Nonproduction: fail-closed adapter for an independently approved Travel-Prep snapshot.
// This module is NOT imported by app.js. It does not alter visa/ETA classification.
const ALLOWED_STATUS = new Set(['verified', 'conditional']);
const BORDER = new Set(['entry', 'transit', 'customs', 'departure']);

const isIsoDate = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().startsWith(value);

function safeSource(source) {
  if (!source || typeof source.authority !== 'string' || !source.authority.trim()) return false;
  try {
    const url = new URL(source.url);
    return url.protocol === 'https:' && !!url.hostname && !url.username && !url.password;
  } catch { return false; }
}

export function selectBorderRestrictions(dataset, destination, approvedVersion = null) {
  // Never publish a research register, unapproved snapshot, or arbitrarily newer dataset.
  if (!dataset || dataset.schemaVersion !== 1 || dataset.publicationStatus !== 'approved' ||
      !Array.isArray(dataset.records) || typeof dataset.datasetVersion !== 'string' ||
      !dataset.datasetVersion.trim()) return [];
  if (typeof approvedVersion !== 'string' || !approvedVersion.trim() ||
      dataset.datasetVersion !== approvedVersion) return [];
  if (typeof destination !== 'string' || !destination.trim()) return [];

  const seen = new Set();
  return dataset.records.filter((r) => {
    if (!r || typeof r.id !== 'string' || !r.id.trim() || seen.has(r.id)) return false;
    seen.add(r.id);
    return r.destination === destination &&
      r.publicationStatus === 'approved' &&
      r.visabrowser_alert === true &&
      ALLOWED_STATUS.has(r.status) &&
      typeof r.title === 'string' && r.title.trim() &&
      typeof r.rule === 'string' && r.rule.trim() &&
      typeof r.jurisdiction === 'string' && r.jurisdiction.trim() &&
      typeof r.scope === 'string' && r.scope.trim() &&
      isIsoDate(r.checkedAt) &&
      Array.isArray(r.relevance) && r.relevance.some(v => BORDER.has(v)) &&
      Array.isArray(r.sources) && r.sources.length > 0 && r.sources.every(safeSource);
  });
}
