import { touristDetails, touristEntryTerms } from './tourist.js';
import { currentHealthNotes, healthNotices } from './health.js';
import { actions, compare, groupDetail, issueLabel, noAdvanceVisa, rank, requirementChange,
  resultSnapshot, sixMonthsFrom, sourceDelayed, statuses } from './rules.js';
import { offlineStatus, onlineManifest, saveOffline } from './offline.js';
import { version } from './version.js';

const main = document.querySelector('main');
const reminder = null;
const storageKey = 'visabrowser.v1';
const uid = () => crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4))).join('-');
const travelPrep = 'https://kchorst.github.io/Travel-Prep/';
const alpha = ([, a], [, b]) => a.localeCompare(b, 'en');
const tabs = [...document.querySelectorAll('[data-route]')];
const disclaimerText = 'VisaBrowser provides general entry guidance, not a guarantee of admission. Confirm current requirements with the destination country’s immigration or consular authorities before departure. Check passport validity and blank pages, visas and supporting documents, vaccinations and health rules, prior-country visits, permitted stay, transit conditions and fees. Entry is always at the discretion of immigration authorities.';
const disclaimer = () => el('details', { class: 'panel travel-disclaimer' }, el('summary', {}, '⚠ Important Travel Requirements & Disclaimer'), el('p', {}, disclaimerText));
const checkedDate = () => new Date().toLocaleDateString();
function compactResult(result) {
  // Never persist full passport rule tables in each saved search.
  return { ...result, rows: result.rows.map(row => ({
    ...row, passenger: structuredClone(row.passenger),
    source: row.source ? {
      url: row.source.url, lastSuccess: row.source.lastSuccess,
      error: row.source.error, unavailable: row.source.unavailable
    } : undefined
  })) };
}

function reportText(placeId, summary, when = checkedDate()) {
  const destination = places[placeId] ?? placeId;
  return ['VisaBrowser · ' + destination, 'Checked: ' + when,
    ...summary.rows.map(row => [row.passenger.name + ' (' + (places[row.passenger.passport] ?? row.passenger.passport) + ')',
      statuses(row), row.condition, row.reason, row.stay ? 'Stay: ' + row.stay : '',
      ...(row.flags ?? []),
      ...Object.entries(touristEntryTerms(placeId, row) ?? {}).map(([label, value]) => label + ' · ' + value),
      ...[...healthNotices(placeId, row.passenger.passport), ...touristDetails(placeId, row)]
        .map(({ heading, text, url, more = [] }) => [heading, text, url, ...more].join(' · '))].filter(Boolean).join(' · ')),
    'Travel-Prep: ' + travelPrep + '#country=' + encodeURIComponent(placeId),
    'VisaBrowser: https://kchorst.github.io/VisaBrowser/', '',
    'Important Travel Requirements & Disclaimer', disclaimerText].join('\n');
}
async function copyOrShare(text, nativeShare = false) {
  if (nativeShare && navigator.share) {
    try { await navigator.share({ title: 'VisaBrowser travel requirements', text }); } catch (error) {
      if (error.name !== 'AbortError') prompt('Copy your report', text);
    }
    return;
  }
  try { await navigator.clipboard.writeText(text); }
  catch { prompt('Copy your report', text); }
}

// A positive badge is intentionally narrower than a "Visa-Free" category.
// Never infer passport validity, admission, or a waiver from third-country papers.
const noIssues = (result, placeId) => result.rows.length > 0 && !result.pending &&
  result.rows.every(row => row.options.length === 1 && row.options[0] === 'free' &&
    !row.condition && !row.reason && !row.issue && !row.flags?.length &&
    !healthNotices(placeId, row.passenger.passport).some(notice => notice.heading === 'Required health documents') &&
    !touristDetails(placeId, row).some(notice => notice.heading === 'Confirm entry details' || notice.heading === 'Proof of onward travel' || notice.heading === 'Arrival forms and documents') &&
    !row.questions?.length && !row.controls?.length && !row.viaDocument &&
    !row.source?.unavailable && !row.source?.error &&
    (!row.source?.url || (row.source?.lastSuccess &&
      !sourceDelayed(row.source, new Date(), catalog.overdueDays))));

function storageAlert() {
  const alert = document.querySelector('#storage-alert');
  alert.hidden = false;
  alert.textContent = 'Browser storage is unavailable. Changes may be lost when you close VisaBrowser.';
}
function readState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(stored?.passengers) && Array.isArray(stored?.saved)) {
      stored.selected ??= stored.passengers.map(person => person.id);
      return stored;
    }
  } catch {
    storageAlert();
  }
  return { passengers: [], selected: [], saved: [] };
}
const state = readState();
const activePassengers = () => state.passengers.filter(person => state.selected.includes(person.id));
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { storageAlert(); }
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) if (value !== undefined && value !== null && value !== false) node.setAttribute(key, value);
  node.append(...children.flat(Infinity).filter(child => child !== null && child !== undefined && child !== false));
  return node;
}
function button(text, click, className = '', props = {}) {
  const control = el('button', { type: 'button', class: className, ...props }, text);
  control.addEventListener('click', click);
  return control;
}
const panel = (...contents) => el('section', { class: 'panel stack' }, contents);
function countedList(name, items, initiallyOpen = items.length <= 5) {
  const content = el('div', { class: 'stack counted-list', ...(initiallyOpen ? {} : { hidden: '' }) }, items);
  const toggle = button(initiallyOpen ? `Hide ${name.toLowerCase()}` : `Show ${name.toLowerCase()}`, () => {
    const expanded = content.hidden;
    content.hidden = !expanded;
    toggle.textContent = expanded ? `Hide ${name.toLowerCase()}` : `Show ${name.toLowerCase()}`;
    toggle.setAttribute('aria-expanded', String(expanded));
  }, 'country-toggle', { 'aria-expanded': String(initiallyOpen) });
  const controlId = `items-${++fieldId}`;
  content.id = controlId;
  toggle.setAttribute('aria-controls', controlId);
  return el('section', { class: 'panel counted-section' },
    el('div', { class: 'country-header' }, el('h2', {}, `${name} (${items.length})`), toggle),
    content);
}

const title = (text, ...controls) => el('div', { class: 'section-head' }, el('h1', {}, text), controls);
const muted = text => el('p', { class: 'muted' }, text);
const chip = (text, tone = '') => el('span', { class: `chip ${tone}` }, text);
let fieldId = 0;
function label(text, control) {
  control.id = `field-${++fieldId}`;
  return el('div', { class: 'field' }, el('label', { for: control.id }, text), control);
}
const link = (text, url) => el('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, text);

let cachedCatalog = false;
async function json(path) {
  const response = await fetch(path, { cache: 'no-cache', signal: AbortSignal.timeout?.(20000) });
  if (!response.ok) throw new Error(`Could not load ${path}`);
  if (path === './data/index.json') cachedCatalog = response.headers.get('X-VisaBrowser-Cached') === 'yes';
  return response.json();
}

let catalog, places, destinations, passports, issuers;
const cache = new Map();
async function loadSource(code) {
  const homeCountry = catalog.homeCountries?.includes(code) ? code : undefined;
  const meta = { ...catalog.sources[code], homeCountry };
  if (!meta.lastSuccess) return meta;
  if (!cache.has(code)) {
    cache.set(code, json(`./data/passports/${code}.json`)
      .then(shard => shard.lastSuccess === meta.lastSuccess
        ? { ...meta, ...shard } : { ...meta, unavailable: true, error: 'Source and refresh dates differ' })
      .catch(() => {
        cache.delete(code);
        return { ...meta, unavailable: true };
      }));
  }
  return cache.get(code);
}
async function loadGroup(passengers) {
  const codes = [...new Set(passengers.map(p => p.passport))];
  return Object.fromEntries(await Promise.all(codes.map(async code => [code, await loadSource(code)])));
}

function select(name, options, value = '', placeholder = 'Select…') {
  const control = el('select', { name },
    el('option', { value: '' }, placeholder),
    options.map(([id, text]) => el('option', { value: id }, text)));
  control.value = value;
  return control;
}
function modal(form) {
  const dialog = el('dialog', { 'aria-labelledby': 'dialog-title' }, form);
  dialog.addEventListener('close', () => dialog.remove(), { once: true });
  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}
function confirmAction(heading, action, callback) {
  const form = el('form', { class: 'stack' });
  const buttons = el('div', { class: 'actions' },
    button('Cancel', () => dialog.close(), '', { autofocus: '' }),
    button(action, () => { dialog.close(); callback(); }, 'danger'));
  form.append(el('h2', { id: 'dialog-title' }, heading), buttons);
  const dialog = modal(form);
}

const documentTypes = [['visa', 'Visa'], ['permit', 'Residence permit'], ['other', 'Other document']];
const documentKey = doc => [doc.issuer, doc.type ?? '', doc.label?.trim().toLowerCase() ?? ''].join('|');

function uniqueDocuments(documents) {
  return [...new Map(documents.map(doc => [documentKey(doc), doc])).values()];
}

function passengerEditor(passenger, onSave, inline = false) {
  const draft = passenger ? structuredClone(passenger) : { id: uid(), name: '', passport: '', documents: [] };
  draft.documents = uniqueDocuments(draft.documents);
  const form = el('form', { class: 'stack traveler-form', ...(inline ? { 'aria-label': 'First traveler details' } : {}) });
  const name = el('input', { name: 'name', type: 'text', placeholder: 'Name or initials',
    value: draft.name, maxlength: '80', required: '', autocomplete: 'name', autofocus: '' });
  const passport = select('passport', passports, draft.passport, 'Select a passport');
  passport.required = true;
  const issuer = select('issuer', issuers, '', 'Select an issuing country or area');
  const type = select('type', documentTypes, '', 'Type unspecified');
  const nickname = el('input', { maxlength: '60', placeholder: 'Optional' });
  const list = el('div', { class: 'stack' });
  const message = el('p', { role: 'status' });
  const clearAnswers = doc => {
    for (const key of Object.keys(doc)) {
      if (!['id', 'issuer', 'type', 'label'].includes(key)) delete doc[key];
    }
  };
  const keepChange = (doc, candidate) => {
    if (draft.documents.some(other => other !== doc && documentKey(candidate) === documentKey(other))) {
      message.textContent = 'That document is already listed. Give a different document its own label.';
      return false;
    }
    message.textContent = '';
    return true;
  };
  const paint = () => list.replaceChildren(...draft.documents.map((doc, index) => {
    const currentIssuer = select('saved-issuer', issuers, doc.issuer);
    currentIssuer.options[0].disabled = true;
    const currentType = select('saved-type', documentTypes, doc.type, 'Type unspecified');
    const currentLabel = el('input', { maxlength: '60', value: doc.label ?? '' });
    const update = (field, control) => {
      const value = control.value.trim();
      if (!keepChange(doc, { ...doc, [field]: value })) {
        control.value = doc[field] ?? '';
        return;
      }
      if (value === (doc[field] ?? '')) return;
      if (field !== 'label') clearAnswers(doc);
      if (value) doc[field] = value;
      else delete doc[field];
    };
    for (const [field, control] of [['issuer', currentIssuer], ['type', currentType], ['label', currentLabel]])
      control.addEventListener('change', () => update(field, control));
    const number = index + 1;
    return el('fieldset', { class: 'stack document-item' }, el('legend', {}, `Document ${number}`),
      label(`Saved issuer ${number}`, currentIssuer), label(`Document type ${number}`, currentType),
      label(`Document label ${number} (optional)`, currentLabel),
      el('div', { class: 'actions' },
        doc.type || Object.keys(doc).some(key => !['id', 'issuer', 'type', 'label'].includes(key)) ?
          button('Clear answers', () => {
            clearAnswers(doc);
            delete doc.type;
            draft.documents = uniqueDocuments(draft.documents);
            paint();
          }, '', { 'aria-label': `Clear answers for ${places[doc.issuer]} document ${number}` }) : null,
        button('Remove document', () => {
          draft.documents = draft.documents.filter(item => item !== doc);
          message.textContent = '';
          paint();
        }, '', { 'aria-label': `Remove ${places[doc.issuer]} document ${number}` })));
  }));
  const addDocument = () => {
    if (!issuer.value) return true;
    const document = { id: uid(), issuer: issuer.value };
    if (type.value) document.type = type.value;
    if (nickname.value.trim()) document.label = nickname.value.trim();
    if (!keepChange(null, document)) return false;
    draft.documents.push(document);
    issuer.value = type.value = nickname.value = '';
    paint();
    return true;
  };
  const documents = el('details', { class: 'optional-documents' },
    el('summary', {}, 'Existing visas or residence permits (optional)'),
    el('div', { class: 'stack' },
      muted('Only add documents you already hold. You can do this later.'),
      list, label('Issuing country or area', issuer), label('Visa or permit type', type),
      label('Label (optional)', nickname), button('Add visa or permit', addDocument), message));
  if (draft.documents.length) documents.open = true;
  paint();
  form.append(inline ? muted('Start with your name and passport. No account or passport expiry date is needed.') :
    el('h2', { id: 'dialog-title' }, passenger ? 'Edit traveler' : 'Add traveler'),
    label('Traveler name or initials', name), label('Passport country', passport), documents);
  if (Object.keys(draft.facts ?? {}).length) form.append(button('Reset entry answers', event => {
    delete draft.facts;
    event.currentTarget.textContent = 'Entry answers reset';
    event.currentTarget.disabled = true;
  }));
  form.append(el('div', { class: 'actions' }, el('button', { type: 'submit', class: 'primary' },
    inline ? 'Save first traveler' : 'Save traveler'),
    inline ? null : button('Cancel', () => dialog.close())));
  const dialog = inline ? null : modal(form);
  name.addEventListener('input', () => name.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!name.value.trim()) {
      name.setCustomValidity('Enter a name.');
      name.reportValidity();
      return;
    }
    if (!addDocument()) return;
    draft.name = name.value.trim();
    if (draft.passport !== passport.value) delete draft.facts;
    draft.passport = passport.value;
    dialog?.close();
    onSave(draft);
  });
  if (inline) return panel(form);
}

// Compatible with Travel-Prep's public #country=XX deep-link convention.
// Unknown codes return to the country picker rather than displaying a wrong result.
function route() {
  const hash = location.hash.slice(1);
  if (/^country=/i.test(hash)) {
    const code = new URLSearchParams(hash).get('country')?.trim().toUpperCase();
    return destinations?.some(([id]) => id === code) ?
      ['destination', code, 'view'] : ['view'];
  }
  return hash.split('/');
}
let unsavedResult = null;
let lastRouteHash = location.hash;
function leaveUnsaved(nextHash) {
  const form = el('div', { class: 'stack' });
  const dialog = modal(form);
  const continueTo = () => { unsavedResult = null; dialog.close(); lastRouteHash = nextHash; location.hash = nextHash; };
  const saveAndLeave = () => {
    const draft = unsavedResult;
    if (!draft) return continueTo();
    const suggestion = draft.itinerary ?
      draft.itinerary.map(id => places[id]).join(' → ') + ' · ' + checkedDate() :
      (places[draft.placeId] ?? draft.placeId) + ' · ' + checkedDate();
    const name = prompt('Name this saved search', suggestion);
    if (name === null) return;
    const record = { id: uid(), name: name.trim() || suggestion,
      checkedAt: new Date().toISOString(), passengers: structuredClone(draft.passengers) };
    if (draft.itinerary) {
      record.itinerary = [...draft.itinerary];
      record.results = Object.fromEntries(Object.entries(draft.results).map(([id, result]) => [id, compactResult(result)]));
    } else {
      record.placeId = draft.placeId;
      record.result = compactResult(draft.result);
      record.snapshot = resultSnapshot(draft.result);
    }
    state.saved.push(record);
    persist();
    continueTo();
  };
  form.append(el('h2', { id: 'dialog-title' }, 'Save these requirements before leaving?'),
    muted('Search results are not stored automatically.'),
    el('div', { class: 'actions' },
      button('Save Search', saveAndLeave, 'primary'),
      button('Discard', continueTo),
      button('Cancel', () => dialog.close())));
}


function dashboard() {
  const people = activePassengers();
  const mixed = new Set(people.map(p => p.passport)).size > 1;
  const items = [['View Country', 'view'], ['Browse Countries', 'countries'], ['Check Group Req', 'group'], ['Search Multiple', 'multi']];
  if (mixed) items.unshift(items.splice(2, 1)[0]);
  return [title('Plan your trip'), panel(el('div', { class: 'row' }, el('strong', {}, people.map(p => `${p.name} · ${places[p.passport] ?? p.passport}`).join(' | ') || 'No travelers yet'), button('Edit travelers', () => go('passengers'))),
    el('div', { class: 'dashboard-actions stack' }, items.map(([label, path], i) => button(label, () => go(path), i === 0 ? 'primary' : ''))),
    button('Saved Searches', () => go('saved')),
    el('p', {}, link('Travel-Prep', travelPrep)))];
}
function viewCountry() {
  const picker = el('input', { type: 'search', placeholder: 'Search countries and territories',
    list: 'country-picker-suggestions', autocomplete: 'off', autofocus: '' });
  const options = el('datalist', { id: 'country-picker-suggestions' },
    destinations.map(([, name]) => el('option', { value: name })));
  const linkedCode = /^country=/i.test(location.hash.slice(1)) ?
    new URLSearchParams(location.hash.slice(1)).get('country') : null;
  const feedback = el('p', { class: 'muted', role: 'status' },
    linkedCode ? 'The linked country was not found. Choose a country below.' : 'Start typing a destination.');
  const matches = el('div', { class: 'stack' });
  const paint = () => {
    const term = normalizeName(picker.value.trim());
    const found = term ? destinations.filter(([id, name]) =>
      normalizeName(name).includes(term) || id.toLowerCase() === term).slice(0, 15) : [];
    matches.replaceChildren(...found.map(([id, name]) =>
      button(name, () => go(`destination/${id}/view`))));
    feedback.textContent = found.length ? `${found.length} matching destinations. Select a country to see requirements.` :
      term ? 'No matching destination. Try a shorter name.' : 'Start typing a destination.';
    const exact = found.find(([id, name]) => normalizeName(name) === term || id.toLowerCase() === term);
    if (exact && found.length === 1) go(`destination/${exact[0]}/view`);
  };
  picker.addEventListener('input', paint);
  picker.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      const term = normalizeName(picker.value.trim());
      const matched = destinations.filter(([id, name]) => normalizeName(name) === term || id.toLowerCase() === term);
      if (matched.length === 1) { event.preventDefault(); go(`destination/${matched[0][0]}/view`); }
    }
  });
  return [title('View Country'), panel(label('Destination', picker), options, feedback, matches)];
}

function go(path) {
  if (location.hash === `#${path}`) render(true);
  else location.hash = path;
}
// A country deep link must retain its destination through first-run setup.
function firstTravelerScreen(placeId = '') {
  const onSave = passenger => {
    state.passengers.push(passenger);
    if (!state.selected.includes(passenger.id)) state.selected.push(passenger.id);
    persist();
    // Keep the original #country=XX URL and render its traveler result;
    // without a destination, reveal the traveler list and next actions.
    render(true);
  };
  return [title('Your first traveler'),
    placeId ? panel(el('p', { class: 'linked-destination' },
      el('strong', {}, `Destination: ${places[placeId]}`)),
      muted('Enter your name and passport to see entry requirements for this destination.')) : null,
    passengerEditor(null, onSave, true)];
}
function passengerList() {
  const firstTime = state.passengers.length === 0;
  const saveNew = passenger => {
    state.passengers.push(passenger);
    if (!state.selected.includes(passenger.id)) state.selected.push(passenger.id);
    persist();
    if (pendingDestination) {
      const id = pendingDestination;
      pendingDestination = '';
      go(`destination/${id}`);
    } else {
      // Show the completed traveler before offering the next one.
      render(true);
    }
  };
  if (firstTime) return firstTravelerScreen();

  const selection = el('span', { role: 'status' });
  const clearButton = button('Clear selection', () => {
    state.selected = [];
    persist();
    render(true);
  });
  const updateSelection = () => {
    const count = activePassengers().length;
    selection.textContent = `${count} selected`;
    clearButton.disabled = count === 0;
  };
  const people = state.passengers.map(passenger => {
    const include = el('input', { type: 'checkbox', 'aria-label': `Include ${passenger.name}` });
    include.checked = state.selected.includes(passenger.id);
    include.addEventListener('change', () => {
      if (include.checked) state.selected.push(passenger.id);
      else state.selected = state.selected.filter(id => id !== passenger.id);
      persist();
      updateSelection();
    });
    return panel(el('div', { class: 'row' },
      el('div', { class: 'passenger-identity' }, include,
        el('div', {}, el('h2', {}, passenger.name), muted(`${places[passenger.passport]} passport`))),
      el('div', { class: 'actions' },
        button('Edit', () => passengerEditor(passenger, updated => {
          state.passengers = state.passengers.map(p => p.id === updated.id ? updated : p);
          persist();
          render(true);
        }), '', { 'aria-label': `Edit ${passenger.name}` }),
        button('Remove', () => confirmAction(`Remove ${passenger.name}?`, 'Remove traveler', () => {
          state.passengers = state.passengers.filter(p => p.id !== passenger.id);
          state.selected = state.selected.filter(id => id !== passenger.id);
          persist();
          render(true);
        }), 'danger', { 'aria-label': `Remove ${passenger.name}` }))),
      passenger.documents.length ? muted(`Document issuers · ${[...new Set(passenger.documents.map(d => places[d.issuer]))].join(', ')}`) : null);
  });
  updateSelection();
  return [title('Travelers'),
    el('div', { class: 'stack' }, selection,
      countedList('Travelers', people),
      button('Add Another Traveler', () => passengerEditor(null, saveNew)),
      el('div', { class: 'actions' }, clearButton, button('Continue', () => go('home'), 'primary')))];
}
let pendingDestination = '';
function invite(id = '') {
  return panel(muted('Choose your travelers to see entry requirements for your group.'),
    el('div', {}, button(state.passengers.length ? 'Select travelers' : 'Set up first traveler', () => {
      pendingDestination = id;
      go('passengers');
    }, 'primary')));
}

function refreshNotice(passengers, data) {
  const affected = [...new Set(passengers.map(p => p.passport))]
    .filter(code => sourceDelayed(data[code], new Date(), catalog.overdueDays) ||
      (data[code]?.unavailable && data[code].lastSuccess));
  if (!affected.length) return null;
  return el('aside', { class: 'notice', role: 'status' },
    el('div', {}, el('strong', {}, 'Update delayed'), affected.map(code =>
      el('p', {}, `${places[code]} · Last successful refresh ${data[code].lastSuccess?.slice(0, 10) ?? 'unavailable'}`))));
}

const normalizeName = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const destinationKey = text => normalizeName(text).replace(/&/g, ' and ').replace(/[.’']/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const destinationAliases = {
  'US': ['USA', 'United States of America'],
  'GB': ['UK', 'Great Britain'],
  'BR': ['Brasil'],
  'CD': ['DRC', 'DR Congo', 'Democratic Republic of the Congo', 'Congo - Kinshasa', 'Congo Kinshasa'],
  'CG': ['Republic of the Congo', 'Congo - Brazzaville', 'Congo Brazzaville'],
  'CI': ['Ivory Coast'],
  'CZ': ['Czech Republic'],
  'KN': ['Saint Kitts and Nevis'],
  'X-SHT': ['Saint Helena Ascension and Tristan da Cunha']
};
let destinationDraft = '';
let submittedDestinations = null;
function clearShortlist() {
  destinationDraft = '';
  submittedDestinations = null;
}

function compareShortlist(value, people, data) {
  const names = new Map();
  for (const [code, name] of destinations) {
    for (const term of [code, name, ...(destinationAliases[code] ?? [])]) {
      const key = destinationKey(term);
      if (!names.has(key)) names.set(key, new Set());
      names.get(key).add(code);
    }
  }
  const matched = new Set();
  const unresolved = new Set();
  // Quoted names can contain commas, as in the catalog entry for Saint Helena.
  for (const [, quoted, plain] of value.matchAll(/(?:^|,)\s*(?:"([^"]*)"(?=\s*(?:,|$))|([^,]*))/gu)) {
    const term = (quoted ?? plain).trim();
    if (!term) continue;
    const matches = names.get(destinationKey(term));
    if (matches?.size === 1) matched.add(matches.values().next().value);
    else unresolved.add(term);
  }
  const message = [];
  if (!matched.size && !unresolved.size) message.push('Enter at least one country or territory.');
  if (unresolved.size) {
    message.push(`Could not match ${[...unresolved].map(term => `“${term}”`).join(', ')}. Use the full destination name or its code.`);
  }
  const cards = people.length ? [...matched].map(id => {
    const summary = compare(people, id, data);
    const { rows } = summary;
    return el('details', { class: 'panel stack country-result' },
      el('summary', {}, places[id], ' · ', noIssues(summary, id) ? 'NO ISSUES' :
        summary.pending ? 'Needs Review' : summary.issues ? issueLabel(summary.issues) :
        summary.group || 'Check traveler requirements'),
      el('div', { class: 'stack' },
        el('a', { href: `#destination/${id}/multi`, 'aria-label': `View details for ${places[id]}` }, 'View full details'),
        el('p', {}, link('Open in Travel-Prep', `${travelPrep}#country=${encodeURIComponent(id)}`)),
        el('ul', { class: 'shortlist-passengers' }, rows.map(row => el('li', {},
          el('p', {}, el('strong', {}, row.passenger.name), ` · ${statuses(row)}`,
            row.flags?.length ? ` · ${row.flags.join(' · ')}` : null),
          row.condition ? muted(row.condition) : null,
          healthDetails(row, id),
          travelDetails(row, id),
          row.stay ? muted(`Stay limit · ${row.stay}`) : null,
          row.options.includes('pending') ? pendingResearch(row, id, true) : null)))));
  }) : [];
  return { message: message.join(' '), cards };
}

const browseState = { countries: { query: '', filter: 'all', expanded: [] },
  group: { query: '', filter: 'all', expanded: [] } };
function countries(data, groupMode = false) {
  const viewState = browseState[groupMode ? 'group' : 'countries'];
  const query = el('input', { type: 'search', placeholder: 'Search by country or territory',
    autocomplete: 'off', value: viewState.query });
  const results = el('div', { class: 'stack' });
  const people = activePassengers();
  const filter = select('filter', [['all', 'All Countries'], ['free', 'Visa-Free · No Additional Steps'],
    ['steps', 'Visa-Free · Entry Steps Required'],
    ['authorization', 'Electronic Visa / Visa on Arrival'], ['required', 'Visa Required'],
    ['review', 'Needs Review']], viewState.filter);
  const sections = people.length ? rank(destinations, people, data) : [{
    id: 'all', heading: 'All Countries', destinations: destinations.map(([id, name]) => ({ id, name }))
  }];
  function paint() {
    viewState.query = query.value;
    viewState.filter = filter.value;
    const term = normalizeName(query.value.trim());
    const cards = [];
    for (const section of sections) {
      if (filter.value !== 'all' && section.id !== filter.value) continue;
      const entries = section.destinations.filter(({ id, name }) =>
        normalizeName(name).includes(term) || id.toLowerCase() === term);
      const expanded = viewState.expanded.includes(section.id);
      const list = el('ul', { class: 'country-list', ...(expanded ? {} : { hidden: '' }) },
        entries.map(({ id, name, result }) => {
          const control = button(name, () => go(`destination/${id}/${groupMode ? 'group' : 'countries'}`));
          if (result?.pending) control.append(chip(`${result.pending} pending verification`, 'warn'));
          return el('li', {}, control);
        }));
      const disclosure = button(expanded ? 'Hide countries' : 'Show countries', () => {
        const nowOpen = disclosure.getAttribute('aria-expanded') !== 'true';
        disclosure.setAttribute('aria-expanded', String(nowOpen));
        disclosure.textContent = nowOpen ? 'Hide countries' : 'Show countries';
        list.hidden = !nowOpen;
        if (nowOpen) {
          if (!viewState.expanded.includes(section.id)) viewState.expanded.push(section.id);
        } else {
          viewState.expanded = viewState.expanded.filter(id => id !== section.id);
        }
      }, 'country-toggle', { 'aria-expanded': String(expanded) });
      const group = el('section', { class: 'panel country-section' },
        el('div', { class: 'country-header' },
          el('h2', {}, `${section.heading} (${entries.length})`), disclosure),
        list);
      disclosure.setAttribute('aria-controls', `country-list-${groupMode ? 'group' : 'browse'}-${section.id}`);
      list.id = disclosure.getAttribute('aria-controls');
      cards.push(group);
    }
    results.replaceChildren(...(cards.length ? cards : [panel(muted('No matching destinations.'))]));
  }
  query.addEventListener('input', paint);
  filter.addEventListener('change', paint);
  paint();
  return [title(groupMode ? 'Check Group Requirements' : 'Browse Countries'),
    refreshNotice(people, data), el('div', { class: 'stack' },
      people.length ? null : invite(),
      panel(label('Search destinations', query), people.length ? label('Filter requirements', filter) : null),
      groupMode ? muted('Group results follow the most restrictive requirement among selected travelers.') : null,
      results)];
}

let itinerary = [];
let comparedItinerary = null;
function multiSearch(data) {
  const people = activePassengers();
  const picker = el('input', { type: 'search', placeholder: 'e.g. Mozambique, Brazil, Cape Verde, Portugal, China',
    autocomplete: 'off', list: 'destination-suggestions' });
  const suggestions = el('datalist', { id: 'destination-suggestions' },
    destinations.map(([, name]) => el('option', { value: name })));
  const chips = el('div', { class: 'stack' });
  const results = el('section', { class: 'stack' });
  const message = el('p', { role: 'status', class: 'muted', 'aria-live': 'polite' });
  const search = button('Search Requirements', () => {
    // Search is also the completion action for a single unfinished typed destination.
    if (picker.value.trim() && !addTerms(picker.value)) return;
    if (!people.length || !itinerary.length) return;
    comparedItinerary = [...itinerary];
    message.textContent = `Comparing ${comparedItinerary.length} destinations. Open a country result below for details.`;
    paint();
    results.querySelector('summary')?.focus();
  }, 'primary');
  const clear = button('Clear All', () => confirmAction('Clear all countries in this trip?', 'Clear All', () => {
    itinerary = [];
    comparedItinerary = null;
    picker.value = '';
    message.textContent = 'The itinerary has been cleared.';
    paint();
    picker.focus();
  }));
  function resolve(term) {
    const key = destinationKey(term);
    if (!key) return null;
    const exact = destinations.filter(([id, name]) =>
      [id, name, ...(destinationAliases[id] ?? [])].some(value => destinationKey(value) === key));
    if (exact.length === 1) return exact[0][0];
    // A partial country name is acceptable only when it identifies exactly one place.
    const partial = destinations.filter(([, name]) => destinationKey(name).includes(key));
    return partial.length === 1 ? partial[0][0] : null;
  }
  function addTerms(value) {
    // Users may paste a full itinerary. Never silently discard unknown names.
    const terms = value.split(/[,\r\n]+/u).map(term => term.trim()).filter(Boolean);
    let added = 0;
    const unknown = [];
    for (const term of terms) {
      const id = resolve(term);
      if (!id) { unknown.push(term); continue; }
      if (!itinerary.includes(id)) {
        itinerary.push(id);
        added++;
      }
    }
    picker.value = unknown.join(', ');
    comparedItinerary = null;
    paint();
    message.textContent = unknown.length ?
      `Please check: ${unknown.join(', ')}. The unmatched text stays in the field.` :
      added ? `${added} destination${added === 1 ? '' : 's'} added. Press Search Requirements when ready.` :
        'No new destinations to add.';
    return !unknown.length;
  }
  picker.addEventListener('paste', event => {
    const pasted = event.clipboardData?.getData('text');
    if (!pasted || !/[,\r\n]/u.test(pasted)) return;
    event.preventDefault();
    addTerms([picker.value, pasted].filter(Boolean).join(', '));
    picker.focus();
  });
  picker.addEventListener('input', () => {
    // Commas typed manually complete preceding names; leave the last name
    // editable until Enter, list selection, or Search.
    if (picker.value.includes(',')) {
      const input = picker.value;
      // A complete pasted/typed list becomes ordered chips immediately,
      // including its final country, without requiring an Add Country click.
      const fullList = input.split(',').map(term => term.trim()).filter(Boolean);
      if (fullList.length > 1 && fullList.every(term => resolve(term))) {
        addTerms(input);
        return;
      }
      const boundary = input.lastIndexOf(',');
      const complete = input.slice(0, boundary);
      const remainder = input.slice(boundary + 1).trimStart();
      if (complete.trim()) {
        addTerms(complete);
        const unknown = picker.value;
        picker.value = [unknown, remainder].filter(Boolean).join(', ');
      }
    }
    search.disabled = !people.length || (!itinerary.length && !picker.value.trim());
  });
  picker.addEventListener('change', () => {
    if (picker.value.trim() && !picker.value.includes(',')) addTerms(picker.value);
  });
  picker.addEventListener('keydown', event => {
    if (event.key === 'Enter' && picker.value.trim()) {
      event.preventDefault();
      addTerms(picker.value);
    }
  });
  function paint() {
    const itineraryItems = itinerary.map((id, index) =>
      el('div', { class: 'itinerary-stop row' },
        el('strong', {}, `${index + 1}. ${places[id]}`),
        el('div', { class: 'actions' },
          button('Up', () => { if (index) [itinerary[index - 1], itinerary[index]] = [itinerary[index], itinerary[index - 1]]; comparedItinerary = null; paint(); },
            '', { disabled: index === 0 ? '' : undefined, 'aria-label': `Move ${places[id]} up` }),
          button('Down', () => { if (index < itinerary.length - 1) [itinerary[index + 1], itinerary[index]] = [itinerary[index], itinerary[index + 1]]; comparedItinerary = null; paint(); },
            '', { disabled: index === itinerary.length - 1 ? '' : undefined, 'aria-label': `Move ${places[id]} down` }),
          button('Remove', () => { itinerary.splice(index, 1); comparedItinerary = null; paint(); },
            '', { 'aria-label': `Remove ${places[id]}` }))));
    chips.replaceChildren(itinerary.length ? countedList('Destinations in order', itineraryItems) :
      muted('No destinations selected yet.'));
    search.disabled = !people.length || (!itinerary.length && !picker.value.trim());
    search.classList.add('primary');
    clear.hidden = !itinerary.length;
    results.replaceChildren();
    if (!comparedItinerary?.length) { if (unsavedResult?.itinerary) unsavedResult = null; return; }
    const header = el('h2', {}, 'Itinerary results');
    const all = comparedItinerary.map(id => ({ id, summary: compare(people, id, data) }));
    unsavedResult = { itinerary: comparedItinerary.slice(), passengers: structuredClone(people),
      results: Object.fromEntries(all.map(({ id, summary }) => [id, compactResult(summary)])) };
    const shareText = all.map(({ id, summary }) => reportText(id, summary)).join('\n\n---\n\n');
    results.append(header,
      el('div', { class: 'actions' }, button('Save Search', () => {
        const draftName = `${all.map(item => places[item.id]).join(' → ')} · ${checkedDate()}`;
        const name = prompt('Name this saved itinerary', draftName);
        if (name === null) return;
        const record = { id: uid(), name: name.trim() || draftName,
          checkedAt: new Date().toISOString(), itinerary: all.map(item => item.id),
          passengers: structuredClone(people),
          results: Object.fromEntries(all.map(({ id, summary }) => [id, compactResult(summary)])) };
        state.saved.push(record);
        persist();
        unsavedResult = null;
        go(`saved/${record.id}`);
      }, 'primary'), button('Copy Itinerary', () => copyOrShare(shareText)),
        button('Share Itinerary', () => copyOrShare(shareText, true))),
      countedList('Destination results', all.map(({ id, summary }, index) =>
        countryResultCard(id, index, summary, [
          summary.rows.map(row => passengerResult(row, id, null, data)),
          button('View Country', () => go(`destination/${id}/multi`))
        ]))),
      disclaimer());
  }
  paint();
  return [title('Search Multiple'), refreshNotice(people, data),
    people.length ? null : invite(),
    panel(label('Destinations — type or paste a country list', picker), suggestions,
      muted('Paste a comma-separated list, or choose a country from suggestions. Countries appear below automatically; reorder or remove them before searching.'),
      message, chips, el('div', { class: 'actions' }, search, clear)), results];
}

function editAnswer(row, question, choice, placeId, saved, data) {
  const passenger = row.passenger;
  const document = passenger.documents?.find(doc => doc.id === question.id);
  if (question.fact) {
    passenger.facts ??= {};
    if (choice === '') delete passenger.facts[question.field];
    else passenger.facts[question.field] = choice;
  } else if (!document) return;
  else if (question.field === 'qualify') {
    const destination = question.destination ?? placeId;
    document.qualifications ??= {};
    if (choice === '') delete document.qualifications[destination];
    else document.qualifications[destination] = choice === 'yes';
  } else if (choice === '') {
    delete document[question.field];
  } else {
    document[question.field] = question.field === 'valid' ? choice === 'yes' : choice;
  }
  if (saved) saved.snapshot[passenger.id] = resultSnapshot(compare([passenger], placeId, data))[passenger.id];
  persist();
  render(true);
}

function pendingResearch(row, placeId, includeReason = false) {
  const search = `${places[placeId]} entry requirements ${places[row.passenger.passport]} ordinary passport ${row.search ?? 'tourist visa immigration authority'}`;
  return [includeReason && row.reason ? muted(row.reason) : null, muted(`Search terms: ${search}`),
    null];
}

function healthDetails(row, placeId) {
  return healthNotices(placeId, row.passenger.passport).map(({ heading, text, url }) =>
    el('div', { class: 'stack' },
      el('p', {}, el('strong', {}, heading), '. ', text),
      link('Official health guidance ↗', url)));
}

function travelDetails(row, placeId) {
  return touristDetails(placeId, row).map(({ heading, text, url, more = [] }) =>
    el('div', { class: 'stack' },
      el('p', {}, el('strong', {}, heading), '. ', text),
      el('p', {}, link('Source guidance ↗', url),
        more.map((source, index) => [' · ', link(`Related source ${index + 1} ↗`, source)]))));
}

function passengerResult(row, placeId, saved, data) {
  const bad = row.options.includes('denied') || row.issue;
  const known = !row.options.includes('pending');
  const tone = bad ? 'bad' : !known || row.condition || row.flags?.length ? 'warn' : 'good';
  const advice = row.options.map(option => actions[option]).filter(Boolean);
  const controls = [...new Map([...(row.controls ?? []), ...(row.questions ?? [])]
    .map(question => [`${question.id ?? ''}:${question.field}`, question])).values()].map(question => {
    const document = row.passenger.documents?.find(doc => doc.id === question.id);
    const type = question.field === 'type';
    const issuer = places[question.issuer] ?? question.issuer;
    const prompt = question.detail ?? (type ? `What ${issuer} document does ${row.passenger.name} hold?` :
      `Is ${row.passenger.name}’s ${issuer} document valid for travel?`);
    const choices = question.choices ?? (type ? [['permit', 'Residence permit'], ['visa', 'Visa'], ['other', 'Other document']] :
      [['yes', 'Yes'], ['no', 'No']]);
    let current = question.fact ? row.passenger.facts?.[question.field] :
      question.field === 'qualify' ? document?.qualifications?.[question.destination ?? placeId] : document?.[question.field];
    if (typeof current === 'boolean') current = current ? 'yes' : 'no';
    const answer = select(question.field, choices, current ?? '', 'Skip for now');
    answer.addEventListener('change', () => editAnswer(row, question, answer.value, placeId, saved, data));
    return label(prompt, answer);
  });
  const research = !known ? pendingResearch(row, placeId) : null;
  const routes = row.routes?.map(option => el('p', {},
    option.url?.startsWith('https://') ? link(option.title, option.url) : option.title,
    option.detail ? ` · ${option.detail}` : null));
  const authority = row.official?.startsWith('https://') &&
    !row.routes?.some(option => option.url === row.official) ?
    el('p', { class: 'official-source' }, link('Official entry requirements ↗', row.official)) : null;
  const sourceNotes = currentHealthNotes(row.notes, placeId) ?? [];
  const terms = touristEntryTerms(placeId, row);
  const passportWarnings = sourceNotes.filter(note =>
    /passport (?:valid|validity|expiry|expiration|blank|page)|blank pages|valid (?:for|at least) (?:3|6|three|six) months/i.test(note));
  const requiresVisa = row.options.some(option => ['evisa', 'arrival', 'advance'].includes(option));
  const notes = sourceNotes.length ? el('details', { class: 'detail-notes' }, el('summary', {}, 'Source notes'),
    sourceNotes.map(note => el('p', {}, note))) : null;
  return panel(
    el('div', { class: 'row' }, el('h2', {}, row.passenger.name), muted(`${places[row.passenger.passport]} passport`)),
    el('div', { class: 'chips' }, chip(statuses(row), tone), row.issue ? chip('Issue', 'bad') : null,
      row.flags?.map(flag => chip(flag, 'warn')) ?? []),
    row.condition ? el('p', { class: 'condition' }, `* ${row.condition}`) : null,
    passportWarnings.map(note => el('p', { class: 'condition' }, `Passport requirement: ${note}`)),
    healthDetails(row, placeId),
    travelDetails(row, placeId),
    terms ? el('dl', {}, Object.entries(terms).map(([key, value]) =>
      [el('dt', {}, { entries: 'Number of entries', validity: 'Visa validity', stay: 'Permitted stay' }[key]), el('dd', {}, value)])) : null,
    row.reason ? el('p', {}, row.reason) : null,
    advice.length ? el('ul', {}, advice.map(text => el('li', {}, text))) : null,
    row.home ? muted('Travel on your passport for this destination.') : null,
    known && !row.home && !row.options.includes('denied') ?
      muted(row.stay ? `Stay limit · ${row.stay}` : 'Stay limit unknown') : null,
    row.fee ? muted(`Application / entry fee · ${row.fee}`) :
      requiresVisa ? muted('Visa fee unknown') : null,
    row.entry ? el('p', {}, row.entry) : null,
    saved?.changes?.[row.passenger.id] ? el('p', { class: 'condition' }, saved.changes[row.passenger.id]) : null,
    saved ? null : controls, research, authority, routes, notes,
    null);
}

function destinationTravelNotes(placeId) {
  if (['KE', 'RW', 'UG'].includes(placeId)) return el('div', { class: 'stack' },
    el('h3', {}, 'East Africa Tourist Visa'),
    muted('This regional tourist visa covers Kenya, Uganda and Rwanda for up to 90 days. Enter through the issuing country first. It allows travel between those countries, and leaving the three-country area ends its validity.'),
    muted('Verify eligibility and first-entry arrangements before applying. If visiting Kenya, check whether you need a separate Kenyan eTA for your itinerary.'),
    el('p', {}, link('Uganda Immigration visa guidance', 'https://www.immigration.go.ug/services/east-african-tourist-visa'),
      ' · ', link('Rwanda visa guidance', 'https://www.rwandainthenetherlands.gov.rw/info/info-details/how-to-apply-for-an-east-african-tourist-visa'),
      ' · ', link('Kenya eTA guidance', 'https://etakenya.go.ke/')));
  if (placeId === 'TZ') return el('div', { class: 'stack' },
    el('h3', {}, 'Mainland Tanzania and Zanzibar ferries'),
    muted('Expect ID checks even on domestic ferries. Azam Marine requires foreign passengers to carry their passports. Tanzanian citizens can present accepted identification, such as a national ID, for ferry ticket purchases. Check with your operator before departure.'),
    el('p', {}, link('Azam Marine travel tips', 'https://azammarine.com/news/')));
  return null;
}

function destinationDetails(placeId, saved, data) {
  if (!saved && !state.passengers.length) return firstTravelerScreen(placeId);
  const people = saved?.passengers ?? activePassengers();
  const freshSummary = compare(people, placeId, data);
  const summary = saved?.result ? structuredClone(saved.result) : freshSummary;
  if (!saved && people.length) unsavedResult = { placeId, passengers: structuredClone(people), result: compactResult(summary) };
  const save = () => {
    const record = { id: uid(), placeId, name: `${places[placeId]} · ${new Date().toLocaleDateString()}`, checkedAt: new Date().toISOString(), passengers: structuredClone(people), snapshot: resultSnapshot(summary), result: compactResult(summary) };
    const chosen = prompt('Name this saved search', record.name);
    if (chosen === null) return;
    record.name = chosen.trim() || record.name;
    state.saved.push(record);
    persist();
    unsavedResult = null;
    go(`saved/${record.id}`);
  };
  const controls = saved ? [
    button('Refresh Results', async event => {
      if (!confirm('Refresh and replace the saved results? The previous version will not be retained.')) return;
      event.currentTarget.disabled = true;
      try {
        if (!navigator.onLine) throw new Error('Offline');
        await readCatalog();
        const refreshedPeople = people.map(savedPerson =>
          structuredClone(state.passengers.find(person => person.id === savedPerson.id) ?? savedPerson));
        for (const p of refreshedPeople) cache.delete(p.passport);
        const fresh = await loadGroup(refreshedPeople);
        const refreshed = compare(refreshedPeople, placeId, fresh);
        if (refreshed.rows.some(row => row.source?.unavailable ||
            (row.source?.url && sourceDelayed(row.source, new Date(), catalog.overdueDays))))
          throw new Error('One or more sources are unavailable or stale');
        const changes = Object.fromEntries(refreshed.rows.map(row => [row.passenger.id,
          requirementChange(row, saved)]).filter(([, change]) => change));
        saved.passengers = refreshedPeople;
        saved.snapshot = resultSnapshot(refreshed);
        saved.result = compactResult(refreshed);
        saved.changes = changes;
        saved.checkedAt = new Date().toISOString();
        persist();
      } catch (error) { alert('Refresh failed. Original saved results were preserved. ' + error.message); }
      render(true);
    }),
    button('Delete saved destination', () => confirmAction(`Delete saved ${places[placeId]}?`, 'Delete', () => {
      state.saved = state.saved.filter(record => record.id !== saved.id);
      persist();
      go('saved');
    }), 'danger')
  ] : [people.length ?
    button('Save destination', save, 'primary') : null];
  const edits = saved ? muted('This is the original saved result. Refresh to replace it with current requirements.') : null;
  const cumulative = summary.rows.filter(row => row.cumulative).map(row => {
    const answer = select('recent', [['yes', 'Yes'], ['no', 'No']], '', 'Skip for now');
    const hint = muted('');
    hint.hidden = true;
    answer.addEventListener('change', () => {
      hint.hidden = answer.value !== 'yes';
      hint.textContent = 'Check how many days of your allowance remain with the immigration authority.';
    });
    return el('div', { class: 'stack' }, label(`Is ${row.passenger.name} there now, or have they visited recently?`, answer), hint);
  });
  const warnings = destinationTravelNotes(placeId);
  warnings?.querySelectorAll('a').forEach(anchor => anchor.replaceWith(anchor.textContent));
  const notes = panel(el('h2', {}, 'Notes'), cumulative, warnings,
    muted('Enter during the allowed window and leave before the authorized stay expires. Check with local immigration or a qualified local visa agent before relying on re-entry.'),
    muted('Check transit requirements for each connection, including whether each traveler can remain airside.'),
    muted('Confirm current rules with the destination’s embassy, consulate, or immigration authority before booking or traveling.'),
    el('p', {}, link('Open Travel-Prep', `${travelPrep}#country=${encodeURIComponent(placeId)}`)));
  const origin = route()[2];
  const mixed = new Set(people.map(p => p.passport)).size > 1;
  const summaryBox = people.length > 1 ?
    el('details', { class: 'panel stack', ...(origin === 'group' ? { open: '' } : {}) },
      el('summary', {}, 'Group Summary · ', summary.pending ? 'Needs Review' : noIssues(summary, placeId) && !(saved && savedNeedsRefresh(saved)) ? 'NO ISSUES' : summary.issues ? issueLabel(summary.issues) : 'Check conditions'),
      el('div', { class: 'chips' },
        summary.group ? chip(summary.group, 'warn') : null,
        chip(issueLabel(summary.issues), summary.issues ? 'bad' : ''),
        summary.pending ? chip(`${summary.pending} pending verification`, 'warn') : null),
      muted(groupDetail(summary))) :
    people.length ? panel(el('div', { class: 'chips' },
      noIssues(summary, placeId) && !(saved && savedNeedsRefresh(saved)) ? chip('NO ISSUES — verify passport and entry conditions', 'good') : null,
      chip(issueLabel(summary.issues), summary.issues ? 'bad' : ''),
      summary.pending ? chip(`${summary.pending} pending verification`, 'warn') : null)) : invite(placeId);
  return [title(places[placeId]), refreshNotice(people, data),
    saved ? muted(`Original saved snapshot · Checked ${saved.checkedAt?.slice(0, 10) ?? 'date unavailable'}${savedNeedsRefresh(saved) ? ' · Needs Refresh' : ''}`) : null,
    el('div', { class: 'stack' }, el('div', { class: 'actions' }, controls,
      people.length ? button('Copy', () => copyOrShare(reportText(placeId, summary, saved?.checkedAt?.slice(0, 10) ?? checkedDate()))) : null,
      people.length ? button('Share', () => copyOrShare(reportText(placeId, summary, saved?.checkedAt?.slice(0, 10) ?? checkedDate()), true)) : null),
    summaryBox,
    people.length > 1 ? countedList('Traveler requirements',
      summary.rows.map(row => passengerResult(row, placeId, saved, data))) :
      summary.rows.map(row => passengerResult(row, placeId, saved, data)),
    notes, edits, disclaimer())];
}

function countryResultCard(id, index, summary, contents) {
  const status = summary.pending ? 'Needs Review' : noIssues(summary, id) ? 'NO ISSUES' :
    summary.issues ? issueLabel(summary.issues) : summary.group || 'Check requirements';
  const details = el('details', { class: 'country-result' },
    el('summary', { class: 'country-result-summary' },
      el('span', { class: 'country-result-name' }, `${index + 1}. ${places[id]}`),
      el('span', { class: 'country-result-status' }, status),
      el('span', { class: 'country-result-toggle' }, 'Show visa requirements')),
    el('div', { class: 'stack country-result-body' }, contents));
  details.addEventListener('toggle', () => {
    details.querySelector('.country-result-toggle').textContent =
      details.open ? 'Hide visa requirements' : 'Show visa requirements';
  });
  return el('section', { class: 'panel itinerary-country' },
    details,
    el('div', { class: 'country-result-links' },
      link('Travel-Prep ↗', `${travelPrep}#country=${encodeURIComponent(id)}`)));
}

function displaySavedName(record) {
  // Preserve user-chosen names, but improve labels in previously saved automatic names.
  const raw = record.name ?? (record.itinerary?.map(id => places[id]).join(' → ') ||
    places[record.placeId] || record.placeId);
  const legacy = raw.replaceAll('Congo - Kinshasa', places.CD)
    .replaceAll('Congo - Brazzaville', places.CG);
  return legacy.replace(/\s*·\s*\d{1,2}\/\d{1,2}\/\d{4}\s*$/, '').trim();
}

function savedItineraryDetails(saved, data) {
  const checked = saved.checkedAt?.slice(0, 10) ?? 'Date unavailable';
  const report = saved.itinerary.map(id => reportText(id, saved.results[id], checked)).join('\n\n---\n\n');
  const refresh = button('Refresh Results', async () => {
    if (!confirm('Refresh and replace this saved itinerary? Previous results will not be retained.')) return;
    try {
      if (!navigator.onLine) throw new Error('Offline');
      await readCatalog();
      const refreshedPeople = saved.passengers.map(savedPerson =>
        structuredClone(state.passengers.find(person => person.id === savedPerson.id) ?? savedPerson));
      for (const person of refreshedPeople) cache.delete(person.passport);
      const fresh = await loadGroup(refreshedPeople);
      const results = Object.fromEntries(saved.itinerary.map(id => [id, compare(refreshedPeople, id, fresh)]));
      if (Object.values(results).some(result => result.rows.some(row =>
        row.source?.unavailable || (row.source?.url &&
          sourceDelayed(row.source, new Date(), catalog.overdueDays)))))
        throw new Error('Sources are unavailable or outdated');
      saved.changes = Object.fromEntries(saved.itinerary.map(id => {
        const previous = { snapshot: resultSnapshot(saved.results[id]) };
        const changes = results[id].rows.map(row => requirementChange(row, previous)).filter(Boolean);
        return [id, changes];
      }));
      saved.passengers = refreshedPeople;
      saved.results = Object.fromEntries(Object.entries(results).map(([id, result]) => [id, compactResult(result)]));
      saved.checkedAt = new Date().toISOString();
      persist();
      render(true);
    } catch (error) { alert('Refresh failed. Original saved results were preserved. ' + error.message); }
  });
  return [title(displaySavedName(saved)),
    muted(`Saved results · Checked ${checked}${savedNeedsRefresh(saved) ? ' · Needs Refresh' : ''}`),
    el('div', { class: 'actions' }, refresh,
      button('Copy', () => copyOrShare(report)),
      button('Share', () => copyOrShare(report, true)),
      button('Delete', () => confirmAction('Delete this saved itinerary?', 'Delete', () => {
        state.saved = state.saved.filter(item => item.id !== saved.id);
        persist();
        go('saved');
      }), 'danger')),
    countedList('Destination results', saved.itinerary.map((id, index) =>
      countryResultCard(id, index, saved.results[id], [
        ...(saved.changes?.[id]?.length ? [muted(saved.changes[id].join(' · '))] : []),
        saved.results[id].rows.map(row => passengerResult(row, id, saved, data))
      ]))),
    disclaimer()];
}

function savedNeedsRefresh(record) {
  if (!record.checkedAt || Date.now() - Date.parse(record.checkedAt) > 30 * 86400000) return true;
  return record.passengers.some(original => {
    const current = state.passengers.find(person => person.id === original.id);
    return !current || JSON.stringify([current.passport, current.documents, current.facts]) !==
      JSON.stringify([original.passport, original.documents, original.facts]);
  });
}

function savedList() {
  return [title('Saved destinations'), el('div', { class: 'stack' }, state.saved.length ?
    countedList('Saved searches', [...state.saved].reverse().map(record =>
      panel(el('div', { class: 'row' },
      el('div', {}, el('h2', {}, displaySavedName(record)),
        muted(record.passengers.map(p => p.name).join(', ')),
        muted(record.checkedAt ? `Checked ${new Date(record.checkedAt).toLocaleDateString()}` : 'Older saved result'),
        muted(savedNeedsRefresh(record) ? 'Needs Refresh' : '')),
      el('div', { class: 'actions' }, button('Open', () => go(`saved/${record.id}`)),
        button('Rename', () => { const name = prompt('Saved search name', record.name ?? places[record.placeId]); if (name?.trim()) { record.name = name.trim(); persist(); render(true); } }),
        button('Delete', () => confirmAction('Delete this saved search?', 'Delete', () => { state.saved = state.saved.filter(item => item.id !== record.id); persist(); render(true); }), 'danger')))))) : panel(muted('Open a destination comparison and choose Save destination.')))];
}

const scrollByRoute = new Map();
function shouldRestoreListScroll(previous, next) {
  if (next !== '#countries' && next !== '#group') return false;
  return previous.startsWith('#destination/') &&
    previous.endsWith(next === '#countries' ? '/countries' : '/group');
}
window.addEventListener('scroll', () => scrollByRoute.set(location.hash, window.scrollY), { passive: true });
let renderId = 0;
const screenNames = { home: 'Home', view: 'View Country', group: 'Check Group Req', passengers: 'Travelers', countries: 'Browse Countries', multi: 'Search Multiple', saved: 'Saved Searches' };
function breadcrumbs(screen, id, parent, saved) {
  const home = el('a', { href: '#home' }, 'Home');
  if (screen === 'home' || !screen) return el('nav', { 'aria-label': 'Breadcrumb', class: 'breadcrumb' },
    el('span', { 'aria-current': 'page' }, 'Home'));
  const items = [home];
  if (screen === 'destination' || saved) {
    items.push(el('a', { href: `#${parent}` }, screenNames[parent]));
    items.push(el('span', { 'aria-current': 'page' }, saved ? displaySavedName(saved) : (places[id] ?? 'Destination')));
  } else {
    items.push(el('span', { 'aria-current': 'page' }, screenNames[parent]));
  }
  return el('nav', { 'aria-label': 'Breadcrumb', class: 'breadcrumb' },
    items.map((item, i) => i ? [el('span', { 'aria-hidden': 'true' }, '/'), item] : item));
}
async function render(focus = false, restoreScroll = false) {
  const request = ++renderId;
  const [screen, id, origin] = route();
  const current = screen === 'destination' ? (['multi','view','group','countries'].includes(origin) ? origin : 'view') :
    Object.hasOwn(screenNames, screen) ? screen : 'passengers';
  for (const tab of tabs) tab.setAttribute('aria-current', tab.dataset.route === current ? 'page' : 'false');
  main.setAttribute('aria-busy', 'true');
  main.replaceChildren(el('p', { class: 'panel', role: 'status' }, 'Loading comparison…'));
  try {
    const saved = screen === 'saved' && id ? state.saved.find(item => item.id === id) : undefined;
    const data = ['countries', 'group', 'multi', 'destination'].includes(screen) || saved ?
      await loadGroup(saved?.passengers ?? activePassengers()) : {};
    if (request !== renderId) return;
    let nodes;
    if (screen === 'home' || !screen) nodes = dashboard();
    else if (screen === 'view') nodes = viewCountry();
    else if (screen === 'group') nodes = countries(data, true);
    else if (screen === 'countries') nodes = countries(data);
    else if (screen === 'multi') nodes = multiSearch(data);
    else if (saved?.itinerary?.length) nodes = savedItineraryDetails(saved, data);
    else if (saved && places[saved.placeId]) nodes = destinationDetails(saved.placeId, saved, data);
    else if (screen === 'saved') nodes = savedList();
    else if (screen === 'destination' && destinations.some(([code]) => code === id)) nodes = destinationDetails(id, null, data);
    else nodes = passengerList();
    main.replaceChildren(breadcrumbs(screen, id, current, saved), ...nodes.filter(Boolean));
    requestAnimationFrame(() => window.scrollTo({ top: restoreScroll ? (scrollByRoute.get(location.hash) ?? 0) : 0, left: 0, behavior: 'instant' }));
  } catch (error) {
    if (request !== renderId) return;
    console.error('VisaBrowser could not open the requested screen.', error);
    main.replaceChildren(panel(el('h1', {}, 'Could not open this screen'),
      el('p', { role: 'alert' }, 'Try again or return to Passengers to review the selected group.'),
      el('div', { class: 'actions' }, button('Try again', () => {
        cache.clear();
        render(true);
      }, 'primary'), button('Back to Passengers', () => go('passengers')))));
  }
  main.setAttribute('aria-busy', 'false');
  if (focus) main.focus();
}

document.querySelector('#version').textContent = `v${version}`;


async function readCatalog() {
  [catalog, places] = await Promise.all([json('./data/index.json'), json('./data/places.json')]);
  // Presentation labels only: retain canonical source JSON and offline hashes.
  places.CD = 'Congo (Democratic Republic of the Congo)';
  places.CG = 'Congo (Republic of the Congo)';
  const dataDate = document.querySelector('#visa-data-date');
  dataDate.hidden = !catalog.generated;
  dataDate.textContent = catalog.generated ? `Visa data · ${catalog.generated.slice(0, 10)}` : '';
  destinations = catalog.destinations.filter(code => places[code]).map(code => [code, places[code]]).sort(alpha);
  passports = Object.entries(places).filter(([code]) => catalog.passports.includes(code)).sort(alpha);
  issuers = Object.entries(places).filter(([code]) => !['BNO', 'BOC', 'BOTC'].includes(code)).sort(alpha);
  cache.clear();
}

const offlineButton = document.querySelector('#save-offline');
const offlineMessage = document.querySelector('#offline-status');
let savingPack = false;
let packCheck = 0;
async function showOfflineStatus(message) {
  if (!('caches' in window)) return;
  const request = ++packCheck;
  const saved = await offlineStatus().catch(() => null);
  const latest = navigator.onLine && !savingPack
    ? await onlineManifest().catch(() => null) : null;
  if (request !== packCheck || savingPack) return;
  offlineButton.textContent = saved && latest && saved.version !== latest.version
    ? 'Update available' : saved ? 'Refresh offline data' : 'Save offline';
  offlineButton.disabled = !navigator.onLine || !navigator.serviceWorker?.controller;
  const connectivity = !navigator.onLine || cachedCatalog ? 'Offline' : '';
  const copy = saved ? `Offline dataset · ${saved.generated.slice(0, 10)}` :
    connectivity ? 'Some passport data may require a connection.' : '';
  offlineMessage.textContent = [message, connectivity, copy].filter(Boolean).join(' · ');
  offlineMessage.hidden = !offlineMessage.textContent;
}

offlineButton.addEventListener('click', async () => {
  if (savingPack) return;
  savingPack = true;
  offlineButton.disabled = true;
  offlineMessage.hidden = false;
  let notice = 'Download interrupted. Any previous complete offline dataset is still available.';
  offlineMessage.textContent = 'Preparing offline download…';
  try {
    await saveOffline((done, total) => {
      offlineMessage.textContent = `Saving offline data · ${done}/${total}`;
    });
    notice = 'Saved offline';
    await readCatalog().catch(() => {});
    if (!document.querySelector('dialog[open]')) await render();
  } catch {
    // The active dataset remains untouched on download or integrity failure.
  } finally {
    savingPack = false;
    await showOfflineStatus(notice);
  }
});
window.addEventListener('offline', () => showOfflineStatus());
window.addEventListener('online', async () => {
  if (!savingPack && catalog) {
    const oldVersion = catalog.generated;
    await readCatalog().catch(() => {});
    if (oldVersion !== catalog.generated && !document.querySelector('dialog[open]')) await render();
  }
  await showOfflineStatus();
});

async function start() {
  try {
    await readCatalog();
    // Route the masthead through the same guarded navigation as dashboard
    // actions, instead of relying on a bare hash hyperlink. An unsaved
    // comparison must still offer Save/Discard before leaving.
    const homeBrand = document.querySelector('.brand-home');
    homeBrand.addEventListener('click', event => {
      event.preventDefault();
      go('home');
    });
    for (const tab of tabs) tab.addEventListener('click', () => {
      pendingDestination = '';
      const [screen, , origin] = route();
      if (tab.dataset.route !== 'multi' || (screen !== 'multi' && origin !== 'multi')) clearShortlist();
      go(tab.dataset.route);
    });
    lastRouteHash = location.hash;
    window.addEventListener('hashchange', () => {
      const nextHash = location.hash;
      const previousHash = lastRouteHash;
      if (unsavedResult && nextHash !== previousHash &&
          (previousHash.startsWith('#destination/') || /^#country=/i.test(previousHash) || previousHash === '#multi')) {
        // Restore the unsaved screen without deleting the browser Back target.
        // Pushing the prior URL preserves Back semantics after Cancel.
        history.pushState(null, '', previousHash);
        leaveUnsaved(nextHash);
        return;
      }
      lastRouteHash = nextHash;
      unsavedResult = null;
      render(true, shouldRestoreListScroll(previousHash, nextHash));
    });
    if (!location.hash) location.hash = state.passengers.length ? '#home' : '#passengers';
    await render();
    if (!navigator.onLine || cachedCatalog) await showOfflineStatus();
  } catch {
    main.setAttribute('aria-busy', 'false');
    main.replaceChildren(panel(el('h1', {}, 'VisaBrowser could not load'),
      muted('Connect to the internet and reload to try again.'),
      button('Reload', () => location.reload(), 'primary')));
  }
}
start();

if ('serviceWorker' in navigator && 'caches' in window) {
  navigator.serviceWorker.register('./sw.js', { type: 'module', updateViaCache: 'none' }).then(() => {
    navigator.serviceWorker.addEventListener('controllerchange', () => showOfflineStatus());
    return navigator.serviceWorker.ready;
  }).then(() => {
    offlineButton.hidden = false;
    return showOfflineStatus();
  }).catch(() => {});
}
