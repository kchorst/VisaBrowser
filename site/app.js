import { actions, compare, groupDetail, issueLabel, noAdvanceVisa, rank, requirementChange,
  resultSnapshot, sixMonthsFrom, sourceDelayed, statuses } from './rules.js';
import { offlineStatus, onlineManifest, saveOffline } from './offline.js';
import { version } from './version.js';

const main = document.querySelector('main');
const reminder = document.querySelector('#reminder');
const storageKey = 'visabrowser.v1';
const uid = () => crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint32Array(4))).join('-');
const travelPrep = 'https://kchorst.github.io/Travel-Prep/';
const alpha = ([, a], [, b]) => a.localeCompare(b, 'en');
const tabs = [...document.querySelectorAll('[data-route]')];

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
  for (const [key, value] of Object.entries(props)) node.setAttribute(key, value);
  node.append(...children.flat(Infinity).filter(child => child !== null && child !== undefined && child !== false));
  return node;
}
function button(text, click, className = '', props = {}) {
  const control = el('button', { type: 'button', class: className, ...props }, text);
  control.addEventListener('click', click);
  return control;
}
const panel = (...contents) => el('section', { class: 'panel stack' }, contents);
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

function passengerEditor(passenger, onSave) {
  const draft = passenger ? structuredClone(passenger) : { id: uid(), name: '', passport: '', documents: [] };
  draft.documents = uniqueDocuments(draft.documents);
  const form = el('form', { class: 'stack' });
  const name = el('input', { name: 'name', value: draft.name, maxlength: '80', required: '', autofocus: '' });
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
  const documents = el('fieldset', { class: 'stack visa-section' }, el('legend', {}, 'Visas and residence permits'),
    list, label('Issuing country or area', issuer), label('Visa or permit type', type),
    label('Label (optional)', nickname), button('Add visa or permit', addDocument), message);
  paint();
  form.append(el('h2', { id: 'dialog-title' }, passenger ? 'Edit passenger' : 'Add passenger'),
    label('Name', name), label('Passport', passport), documents);
  if (Object.keys(draft.facts ?? {}).length) form.append(button('Reset entry answers', event => {
    delete draft.facts;
    event.currentTarget.textContent = 'Entry answers reset';
    event.currentTarget.disabled = true;
  }));
  form.append(el('div', { class: 'actions' }, el('button', { type: 'submit', class: 'primary' }, 'Save passenger'),
    button('Cancel', () => dialog.close())));
  const dialog = modal(form);
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
    dialog.close();
    onSave(draft);
  });
}

const route = () => location.hash.slice(1).split('/');
function go(path) {
  if (location.hash === `#${path}`) render(true);
  else location.hash = path;
}
function passengerList() {
  const add = button('Add passenger', () => passengerEditor(null, passenger => {
    state.passengers.push(passenger);
    state.selected.push(passenger.id);
    persist();
    if (pendingDestination) {
      const id = pendingDestination;
      pendingDestination = '';
      go(`destination/${id}`);
    } else render(true);
  }), 'primary');
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
        button('Remove', () => confirmAction(`Remove ${passenger.name}?`, 'Remove passenger', () => {
          state.passengers = state.passengers.filter(p => p.id !== passenger.id);
          state.selected = state.selected.filter(id => id !== passenger.id);
          persist();
          render(true);
        }), 'danger', { 'aria-label': `Remove ${passenger.name}` }))),
      passenger.documents.length ? muted(`Document issuers · ${[...new Set(passenger.documents.map(d => places[d.issuer]))].join(', ')}`) : null);
  });
  updateSelection();
  return [title('Passengers', add),
    el('div', { class: 'stack' }, people.length ? [selection, people,
      el('div', { class: 'actions' }, clearButton)] :
      panel(muted('Add a passenger to compare tourist entry requirements.')))];
}
let pendingDestination = '';
function invite(id = '') {
  return panel(muted('Select passengers to see entry requirements for your group.'),
    el('div', {}, button(state.passengers.length ? 'Select passengers' : 'Add passengers', () => {
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
  'CD': ['DRC', 'DR Congo', 'Democratic Republic of the Congo'],
  'CG': ['Republic of the Congo'],
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
    const { rows } = compare(people, id, data);
    return panel(el('div', { class: 'row' }, el('h3', {}, places[id]),
      el('a', { href: `#destination/${id}/multi`, 'aria-label': `View details for ${places[id]}` }, 'View details')),
    el('ul', { class: 'shortlist-passengers' }, rows.map(row => el('li', {},
      el('p', {}, el('strong', {}, row.passenger.name), ` · ${statuses(row)}`,
        row.flags?.length ? ` · ${row.flags.join(' · ')}` : null),
      row.condition ? muted(row.condition) : null,
      row.stay ? muted(`Stay limit · ${row.stay}`) : null,
      row.options.includes('pending') ? pendingResearch(row, id, true) : null))));
  }) : [];
  return { message: message.join(' '), cards };
}

function countries(data) {
  const query = el('input', { type: 'search', placeholder: 'Search by country or territory', autocomplete: 'off' });
  const results = el('div', { class: 'stack' });
  const people = activePassengers();
  const filter = select('filter', [['all', 'All destinations'], ['free', 'Visa-free for everyone'],
    ['covered', 'No conventional advance visa needed'], ['pending', 'Pending verification']], 'all');
  filter.remove(0);
  const sections = people.length ? rank(destinations, people, data) : [{
    heading: 'Destinations A–Z', destinations: destinations.map(([id, name]) => ({ id, name }))
  }];
  function paint() {
    const term = normalizeName(query.value.trim());
    const cards = [];
    for (const section of sections) {
      const entries = section.destinations.filter(({ id, name, result }) => {
        const matches = normalizeName(name).includes(term) || id.toLowerCase() === term;
        if (!matches || !result || filter.value === 'all') return matches;
        if (filter.value === 'free') return result.group === 'Visa-free for everyone';
        if (filter.value === 'covered') return noAdvanceVisa(result);
        return result.pending > 0;
      });
      if (!entries.length) continue;
      cards.push(el('section', { class: 'panel country-section' }, el('h2', {}, section.heading),
        el('ul', { class: 'country-list' }, entries.map(({ id, name, result }) => {
          const control = button(name, () => go(`destination/${id}`));
          if (result?.pending) control.append(chip(`${result.pending} pending verification`, 'warn'));
          return el('li', {}, control);
        }))));
    }
    results.replaceChildren(...(cards.length ? cards : [panel(muted('No matching destinations.'))]));
  }
  query.addEventListener('input', paint);
  filter.addEventListener('change', paint);
  paint();

  return [title('Countries'), refreshNotice(people, data), el('div', { class: 'stack' },
    people.length ? null : invite(), panel(el('h2', {}, 'Search and filter'), label('Search destinations', query),
      people.length ? label('Filter by visa result', filter) : null), results)];
}

function multiSearch(data) {
  const people = activePassengers();
  const input = el('input', { type: 'text', placeholder: 'Brazil, USA, Japan', autocomplete: 'off',
    'aria-describedby': 'shortlist-help' });
  input.value = destinationDraft;
  const feedback = el('p', { role: 'status', class: 'muted' });
  const shortlist = el('section', { class: 'stack', 'aria-labelledby': 'shortlist-heading' });
  const submit = el('button', { type: 'submit', class: 'primary' }, 'Check destinations');
  const clear = button('Clear list', () => {
    clearShortlist();
    input.value = '';
    paintShortlist();
    input.focus();
  });
  input.addEventListener('input', () => {
    destinationDraft = input.value;
    if (submittedDestinations !== null && input.value !== submittedDestinations) submittedDestinations = null;
    paintShortlist();
  });
  function paintShortlist(focusResults = false) {
    const submitted = submittedDestinations !== null;
    const { message, cards } = submitted ? compareShortlist(submittedDestinations, people, data) : { message: '', cards: [] };
    feedback.textContent = [cards.length ? `${cards.length} destination${cards.length === 1 ? '' : 's'} checked.` : '',
      message].filter(Boolean).join(' ');
    shortlist.hidden = !cards.length;
    const heading = el('h2', { id: 'shortlist-heading', tabindex: '-1' }, 'Destination results');
    shortlist.replaceChildren(heading, ...cards);
    clear.hidden = !submitted && !input.value;
    submit.disabled = !people.length || !input.value.trim() || submitted;
    if (focusResults && cards.length) heading.focus();
    else if (focusResults) input.focus();
  }
  const form = el('form', { class: 'panel stack' }, label('Destinations to compare', input),
    el('p', { id: 'shortlist-help', class: 'muted' }, 'Separate country or territory names with commas.'),
    el('div', { class: 'actions' }, submit, clear), feedback);
  form.addEventListener('submit', event => {
    event.preventDefault();
    submittedDestinations = input.value;
    paintShortlist(true);
  });
  paintShortlist();
  return [title('Multi-search'), refreshNotice(people, data), el('div', { class: 'stack' },
    people.length ? null : invite(), form, shortlist)];
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
    includeReason && row.official ? el('p', {}, link('Official guidance', row.official)) : null];
}

function passengerResult(row, placeId, saved, data) {
  const bad = row.options.includes('denied') || row.issue;
  const known = !row.options.includes('pending');
  const tone = bad ? 'bad' : !known || row.condition ? 'warn' : 'good';
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
    option.url ? link(option.title, option.url) : option.title, option.detail ? ` · ${option.detail}` : null));
  const requiresVisa = row.options.some(option => ['evisa', 'arrival', 'advance'].includes(option));
  const notes = row.notes?.length ? el('details', { class: 'detail-notes' }, el('summary', {}, 'Source notes'),
    row.notes.map(note => el('p', {}, note))) : null;
  return panel(
    el('div', { class: 'row' }, el('h2', {}, row.passenger.name), muted(`${places[row.passenger.passport]} passport`)),
    el('div', { class: 'chips' }, chip(statuses(row), tone), row.issue ? chip('Issue', 'bad') : null,
      row.flags?.map(flag => chip(flag, 'warn')) ?? []),
    row.condition ? el('p', { class: 'condition' }, `* ${row.condition}`) : null,
    row.reason ? el('p', {}, row.reason) : null,
    advice.length ? el('ul', {}, advice.map(text => el('li', {}, text))) : null,
    row.home ? muted('Travel on your passport for this destination.') : null,
    known && !row.home && !row.options.includes('denied') ?
      muted(row.stay ? `Stay limit · ${row.stay}` : 'Stay limit unknown') : null,
    requiresVisa ? muted(row.fee ? `Fee · ${row.fee}` : 'Fee unknown') : null,
    row.entry ? el('p', {}, row.entry) : null,
    saved && requirementChange(row, saved) ? el('p', { class: 'condition' }, requirementChange(row, saved)) : null,
    controls, research, routes, notes,
    row.official ? el('p', {}, link('Official guidance', row.official)) : null,
    row.source?.url ? el('p', {}, link('Wikipedia source', row.source.url),
      row.source.lastSuccess ? el('small', {}, ` · Refreshed ${row.source.lastSuccess.slice(0, 10)}`) : null) : null);
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
  const people = saved?.passengers ?? activePassengers();
  const summary = compare(people, placeId, data);
  const save = () => {
    const record = { id: uid(), placeId, passengers: structuredClone(people), snapshot: resultSnapshot(summary) };
    state.saved.push(record);
    persist();
    go(`saved/${record.id}`);
  };
  const controls = saved ? [
    button('Recalculate', async event => {
      event.currentTarget.disabled = true;
      try { await readCatalog(); }
      catch { /* the current catalog is available */ }
      for (const p of people) cache.delete(p.passport);
      render(true);
    }),
    button('Delete saved destination', () => confirmAction(`Delete saved ${places[placeId]}?`, 'Delete', () => {
      state.saved = state.saved.filter(record => record.id !== saved.id);
      persist();
      go('saved');
    }), 'danger')
  ] : [people.length ?
    button('Save destination', save, 'primary') : null];
  const edits = saved ? panel(el('h2', {}, 'Saved passengers'),
    ...people.map(person => el('div', { class: 'row' }, el('span', {}, person.name),
      button('Edit', () => passengerEditor(person, async updated => {
        const updatedData = await loadGroup([updated]);
        if (!state.saved.some(record => record.id === saved.id)) return;
        saved.passengers = saved.passengers.map(p => p.id === person.id ? updated : p);
        saved.snapshot[person.id] = resultSnapshot(compare([updated], placeId, updatedData))[person.id];
        persist();
        render(true);
      }), '', { 'aria-label': `Edit saved passenger ${person.name}` })))) : null;
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
  const notes = panel(el('h2', {}, 'Notes'), cumulative, destinationTravelNotes(placeId),
    muted('Enter during the allowed window and leave before the authorized stay expires. Check with local immigration or a qualified local visa agent before relying on re-entry.'),
    muted('Check transit requirements for each connection, including whether each traveler can remain airside.'),
    muted('Confirm current rules with the destination’s embassy, consulate, or immigration authority before booking or traveling.'),
    el('p', {}, link('Open Travel-Prep', `${travelPrep}#country=${encodeURIComponent(placeId)}`)));
  return [title(places[placeId]), refreshNotice(people, data),
    el('div', { class: 'stack' }, el('div', { class: 'actions' }, controls), people.length ?
      panel(el('div', { class: 'chips' }, summary.group ? chip(summary.group, 'good') : null,
        chip(issueLabel(summary.issues), summary.issues ? 'bad' : ''),
        summary.pending ? chip(`${summary.pending} pending verification`, 'warn') : null),
      muted(groupDetail(summary))) : invite(placeId),
    summary.rows.map(row => passengerResult(row, placeId, saved, data)), notes, edits)];
}

function savedList() {
  return [title('Saved destinations'), el('div', { class: 'stack' }, state.saved.length ?
    state.saved.map(record => panel(el('div', { class: 'row' },
      el('div', {}, el('h2', {}, places[record.placeId] ?? record.placeId),
        muted(record.passengers.map(p => p.name).join(', '))),
      button('Open', () => go(`saved/${record.id}`), '', {
        'aria-label': `Open saved ${places[record.placeId] ?? record.placeId}`
      })))) : panel(muted('Open a destination comparison and choose Save destination.')))];
}

let renderId = 0;
const screenNames = { passengers: 'Passengers', countries: 'Countries', multi: 'Multi-search', saved: 'Saved destinations' };
function breadcrumbs(screen, id, parent, saved) {
  const home = el('a', { href: '#passengers' }, 'Home');
  home.addEventListener('click', clearShortlist);
  const items = [home];
  if (screen === 'destination' || saved) {
    items.push(el('a', { href: `#${parent}` }, screenNames[parent]));
    items.push(el('span', { 'aria-current': 'page' }, places[saved?.placeId ?? id] ?? 'Destination'));
  } else {
    items.push(el('span', { 'aria-current': 'page' }, screenNames[parent]));
  }
  return el('nav', { 'aria-label': 'Breadcrumb', class: 'breadcrumb' },
    items.map((item, i) => i ? [el('span', { 'aria-hidden': 'true' }, '/'), item] : item));
}
async function render(focus = false) {
  const request = ++renderId;
  const [screen, id, origin] = route();
  const current = screen === 'destination' ? (origin === 'multi' ? 'multi' : 'countries') :
    Object.hasOwn(screenNames, screen) ? screen : 'passengers';
  for (const tab of tabs) tab.setAttribute('aria-current', tab.dataset.route === current ? 'page' : 'false');
  main.setAttribute('aria-busy', 'true');
  main.replaceChildren(el('p', { class: 'panel', role: 'status' }, 'Loading comparison…'));
  try {
    const saved = screen === 'saved' && id ? state.saved.find(item => item.id === id) : undefined;
    const data = ['countries', 'multi', 'destination'].includes(screen) || saved ?
      await loadGroup(saved?.passengers ?? activePassengers()) : {};
    if (request !== renderId) return;
    let nodes;
    if (screen === 'countries') nodes = countries(data);
    else if (screen === 'multi') nodes = multiSearch(data);
    else if (saved && places[saved.placeId]) nodes = destinationDetails(saved.placeId, saved, data);
    else if (screen === 'saved') nodes = savedList();
    else if (screen === 'destination' && destinations.some(([code]) => code === id)) nodes = destinationDetails(id, null, data);
    else nodes = passengerList();
    main.replaceChildren(breadcrumbs(screen, id, current, saved), ...nodes.filter(Boolean));
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
document.querySelector('#reminder-date').textContent =
  `Six months from today is ${sixMonthsFrom(new Date()).toLocaleDateString(undefined, { dateStyle: 'long' })}.`;
document.querySelector('#dismiss').addEventListener('click', () => { reminder.hidden = true; tabs[0].focus(); });

async function readCatalog() {
  [catalog, places] = await Promise.all([json('./data/index.json'), json('./data/places.json')]);
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
    for (const tab of tabs) tab.addEventListener('click', () => {
      pendingDestination = '';
      const [screen, , origin] = route();
      if (tab.dataset.route !== 'multi' || (screen !== 'multi' && origin !== 'multi')) clearShortlist();
      go(tab.dataset.route);
    });
    window.addEventListener('hashchange', () => render(true));
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
