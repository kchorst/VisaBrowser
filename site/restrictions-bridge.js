// Nonproduction: pure filter for a future Travel-Prep published restrictions subset.
// Do NOT import into app.js before Phase 1 and UI approval.
const ALLOWED_STATUS = new Set(['verified', 'conditional']);
const BORDER = new Set(['entry', 'transit', 'customs', 'departure']);

export function selectBorderRestrictions(dataset, destination) {
  if (!dataset || dataset.schemaVersion !== 1 || !Array.isArray(dataset.records)) return [];
  if (typeof destination !== 'string' || !destination.trim()) return [];
  return dataset.records.filter((r) =>
    r && r.destination === destination &&
    r.visabrowser_alert === true &&
    ALLOWED_STATUS.has(r.status) &&
    typeof r.rule === 'string' && r.rule.trim() &&
    typeof r.scope === 'string' && r.scope.trim() &&
    typeof r.checkedAt === 'string' &&
    /^\\d{4}-\\d{2}-\\d{2}$/.test(r.checkedAt) &&
    Number.isFinite(Date.parse(r.checkedAt)) &&
    Array.isArray(r.relevance) && r.relevance.some((v) => BORDER.has(v)) &&
    Array.isArray(r.sources) && r.sources.length > 0 &&
    r.sources.every((s) => {
      if (!s || typeof s.authority !== 'string' || !s.authority.trim()) return false;
      try { return new URL(s.url).protocol === 'https:'; } catch { return false; }
    })
  );
}
