import { officialFor, reviewedRule } from './reviewed.js';

export const labels = {
  free: 'Visa-free',
  evisa: 'E-visa',
  arrival: 'Visa on arrival',
  advance: 'Visa required before travel',
  denied: 'Entry not permitted',
  existing: 'Existing document covers this trip',
  permit: 'Prior permission required',
  residentArrival: 'Resident visa on arrival',
  transit: 'Visa-free transit',
  pending: 'Pending verification'
};

export const actions = {
  evisa: 'Apply for e-visa before travel',
  arrival: 'Obtain a visa on arrival',
  advance: 'Obtain a visa before travel',
  permit: 'Obtain visitor permission before travel'
};

const easy = status => ['evisa', 'arrival', 'residentArrival'].includes(status);
export const noAdvanceVisa = result => result.rows.length > 0 && result.rows.every(row =>
  row.options.every(option => option === 'free' || option === 'existing' || easy(option)));
const pending = (reason, details = {}) => ({ options: ['pending'], reason, ...details });

export function sixMonthsFrom(date) {
  const end = new Date(date.getFullYear(), date.getMonth() + 7, 0);
  return new Date(end.getFullYear(), end.getMonth(), Math.min(date.getDate(), end.getDate()));
}

export function sourceDelayed(source, now = new Date(), days = 14) {
  if (!source?.lastSuccess && !source?.error && !source?.url) return false;
  const successful = Date.parse(source.lastSuccess);
  return Boolean(source.error) || !Number.isFinite(successful) || now - successful > days * 86400000;
}

function evaluate(passenger, place, data) {
  const source = data[passenger.passport];
  if (source?.homeCountry && source.homeCountry === place) return { options: ['free'], home: true, source: undefined };
  if (source?.unavailable) return pending('The rules could not be loaded. Reopen the comparison when connected.');
  const baseline = source?.rules?.[place];
  const rule = reviewedRule(passenger, place, baseline, data);
  const fromDocuments = rule?.viaDocument ?? Boolean(passenger.documents?.length &&
    !baseline?.options?.includes('free') && rule?.options?.includes('free'));
  if (rule && (!Array.isArray(rule.options) || !rule.options.length)) {
    const { options, reason, ...details } = rule;
    return pending(reason || 'The source supplied no usable entry classification. Verify the applicable visa or admission rule.',
      { ...details, search: rule.search ?? rule.sourceText });
  }
  if (rule?.options?.some(option => ['free', 'existing', 'transit'].includes(option) || easy(option)) &&
      !rule.official && source?.lastSuccess && Date.now() - Date.parse(source.lastSuccess) > 14 * 86400000) {
    return pending('The source snapshot is overdue. Confirm the current conditions before using this route.',
      { notes: rule.notes, search: rule.sourceText, controls: rule.controls });
  }
  if (rule && rule !== baseline && (rule.official || rule.reason)) return fromDocuments ? { ...rule, viaDocument: true } : rule;
  if (!source?.lastSuccess) return pending('No usable Wikipedia entry rules have been verified for this passport.');
  if (!rule) return pending('The source has no verified rule for this destination.');
  if (rule.reason) return pending(rule.reason, { notes: rule.notes, search: rule.sourceText, controls: rule.controls });
  if (rule.options.includes('free') &&
      /^(?:eta(?:-il| uk)?|k-eta|nzeta|etias|evisitor|evisa waiver|electronic(?:al)? (?:system for )?travel authori[sz](?:ation|ations|ed)|electronic travel authority)$/i
        .test(rule.sourceText ?? '')) {
    return pending('The source indicates a visa-waiver or electronic-authorization route, but official eligibility for this passport is not yet verified. This does not mean a conventional tourist visa is necessarily required.',
      { notes: rule.notes, search: 'official electronic travel authorization eligibility ordinary passport visa requirement', controls: rule.controls });
  }
  const questions = [];
  for (const exception of rule.exceptions ?? []) {
    for (const document of passenger.documents ?? []) {
      if (!exception.issuers.includes(document.issuer)) continue;
      if (!document.type && exception.types?.length) {
        questions.push({ id: document.id, issuer: document.issuer, field: 'type' });
        continue;
      }
      if (exception.types?.length && !exception.types.includes(document.type)) continue;
      if (exception.valid && document.valid !== true) {
        if (document.valid !== false) questions.push({ id: document.id, issuer: document.issuer, field: 'valid' });
        continue;
      }
      if (exception.confirm && document.qualifications?.[place] !== true) {
        if (document.qualifications?.[place] !== false) questions.push({
          id: document.id, issuer: document.issuer, field: 'qualify', detail: exception.confirm
        });
        continue;
      }
      return {
        ...exception.result,
        viaDocument: true,
        flags: exception.result.flags ?? rule.flags,
        notes: exception.result.notes ?? rule.notes
      };
    }
  }
  if (questions.length) return pending('Confirm whether the reported document qualifies for the visa exception.', {
    questions: [...new Map(questions.map(q => [q.id + q.field, q])).values()], notes: rule.notes
  });
  const unreviewed = rule.unreviewedExceptions?.find(exception =>
    passenger.documents?.some(document => exception.issuers.includes(document.issuer) || exception.issuers.includes('*')));
  if (unreviewed) return pending('The source lists a document exception that needs individual review.',
    { notes: rule.notes, search: unreviewed.note, controls: rule.controls });
  return fromDocuments ? { ...rule, viaDocument: true } : rule;
}

export function compare(passengers, destination, data) {
  const rows = passengers.map(passenger => ({
    passenger, source: data[passenger.passport], ...evaluate(passenger, destination, data)
  }));
  const allFree = rows.length > 0 && rows.every(row =>
    row.options.length === 1 && row.options[0] === 'free');
  const allUnconditional = allFree && rows.every(row =>
    !row.viaDocument && !row.condition && !row.flags?.length &&
    !row.controls?.length && !row.questions?.length && !row.reason);
  const allEasy = rows.length > 0 && rows.every(row => row.options.some(easy));
  const hasFree = rows.some(row => row.options.includes('free'));
  for (const row of rows) {
    if (row.options.includes('pending')) row.official ??= officialFor(destination);
    row.issue = row.options.some(option => ['denied', 'advance', 'permit'].includes(option)) ||
      (hasFree && !row.options.includes('free') && row.options.some(easy));
  }
  return {
    rows, issues: rows.filter(row => row.issue).length,
    pending: rows.filter(row => row.options.includes('pending')).length,
    group: allUnconditional ? 'Visa-free for everyone' :
      allFree ? 'Visa-free with conditions' :
      allEasy && !rows.some(row => row.options.includes('residentArrival')) ? 'E-visa or visa on arrival for everyone' : ''
  };
}

export const issueLabel = count => `${count} issue${count === 1 ? '' : 's'}`;
export const statuses = row => row.home ? 'Citizen entry' :
  (row.status ?? row.options.map(option => labels[option]).join(' or ')) + (row.condition ? '*' : '');

export function groupDetail(result) {
  const counts = new Map();
  for (const row of result.rows) {
    const label = row.home ? 'citizen entry' : row.options.map(option => labels[option].toLowerCase()).join(' or ');
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts].map(([label, count]) => `${count} ${label}`).join(' · ');
}

/**
 * Keep visa-free entry with extra known steps separate from unresolved rules.
 * `free` is reserved for travel with no identified additional requirements.
 * `steps` still requires action and MUST NOT be rendered as "NO ISSUES".
 */
export function classify(result) {
  if (!result.rows.length || result.pending || result.rows.some(row =>
      row.options.includes('pending') || row.source?.unavailable || row.reason))
    return 'review';
  if (result.rows.some(row => row.options.some(option => ['denied', 'advance', 'permit'].includes(option))))
    return 'required';
  if (result.rows.some(row => row.options.some(option =>
      ['evisa', 'arrival', 'residentArrival', 'transit'].includes(option))))
    return 'authorization';
  if (result.rows.some(row => row.controls?.length || row.questions?.length ||
      row.viaDocument || row.source?.error || (row.source?.url && sourceDelayed(row.source))))
    return 'review';
  if (result.rows.every(row => row.options.length === 1 && row.options[0] === 'free')) {
    if (result.rows.some(row => row.condition || row.flags?.length)) return 'steps';
    return 'free';
  }
  return 'review';
}

export function rank(destinations, passengers, data, include = () => true) {
  const buckets = [
    { id: 'free', heading: 'Visa-Free · No additional steps identified', destinations: [] },
    { id: 'steps', heading: 'Visa-Free · Entry Steps Required', destinations: [] },
    { id: 'authorization', heading: 'Electronic Visa / Visa on Arrival', destinations: [] },
    { id: 'required', heading: 'Visa Required', destinations: [] },
    { id: 'review', heading: 'Needs Review', destinations: [] }
  ];
  for (const [id, name] of destinations) {
    const result = compare(passengers, id, data);
    if (!include(result)) continue;
    buckets.find(section => section.id === classify(result)).destinations.push({ id, name, result });
  }
  for (const section of buckets) section.destinations.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  return buckets;
}

export function resultSnapshot(result) {
  return Object.fromEntries(result.rows.map(row => [row.passenger.id, {
    status: statuses(row),
    successful: row.source?.lastSuccess,
    requirement: JSON.stringify([
      row.options, row.condition, row.stay, row.fee, row.flags, row.entry, row.reason, row.notes, row.viaDocument,
      ...(row.home ? [row.home] : [])
    ])
  }]));
}

export function requirementChange(row, saved) {
  const previous = saved.snapshot[row.passenger.id];
  const current = resultSnapshot({ rows: [row] })[row.passenger.id];
  if (!previous || row.source?.unavailable || previous.requirement === current.requirement ||
      (previous.successful && current.successful < previous.successful)) return '';
  return previous.status === current.status ? 'Requirement details changed' :
    `Requirement changed from ${previous.status} to ${current.status}`;
}
