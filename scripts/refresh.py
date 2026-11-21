import argparse
from concurrent.futures import ThreadPoolExecutor
from copy import deepcopy
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import subprocess
from tempfile import TemporaryDirectory
import unicodedata
from urllib.parse import unquote, urlsplit

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'site/data'
CATEGORY = 'https://en.wikipedia.org/wiki/Category:Visa_requirements_by_nationality'
OVERDUE_DAYS = 14
PARSE_FLOOR = 70
DOCUMENT_WORDS = r'\b(?:residence|resident(?:ial)?|residency|green card|visas?)\b'
ENTRY_POINT = r'\b(?:international airport|airport|port of entry|ports of entry|border crossing|border checkpoint|by air|by sea|land border)'
STAY_LIMIT = r'(?:(?:up to|maximum of) )?(?:\d+|one|two|three|six)\s*(?:day|week|month|year)s?'
FEE = r'(?:US\$|CA\$|AU\$|NZ\$|USD\s*|EUR\s*|GBP\s*|\$|€|£)\s*\d+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?\s*(?:USD|EUR|GBP)\b'
PREPARATION = {
    'Electronic travel authorization': r'\b(?:eta(?:-il| uk)?|esta|k-eta|nzeta|etias|electronic(?:al)? (?:system for )?travel authori[sz](?:ation|ations|ed)|electronic travel authority|evisitor|evisa waiver)\b',
    'Tourist registration': r'\b(?:ease|pre[- ]?registration|tourist registration|arrival (?:card|declaration|form)|electronic border system|e-?ticket|tourist card required|register (?:online|before|upon))\b',
    'Health documentation': r'\b(?:vaccination|vaccinated|yellow fever|health (?:certificate|declaration|documentation)|proof of immunization)\b',
}
ALIASES = {
    'Bahamas, The': 'BS', 'The Bahamas': 'BS', 'The Gambia': 'GM', 'Cape Verde': 'CV',
    'Czech Republic': 'CZ', 'Turkey': 'TR', 'Swaziland': 'SZ', 'Vietnam': 'VN',
    'Ivory Coast': 'CI', "Côte d'Ivoire": 'CI', 'East Timor': 'TL', 'Vatican': 'VA',
    'Holy See': 'VA', 'Myanmar (Burma)': 'MM', 'Burma': 'MM', 'Congo': 'CG',
    'Republic of the Congo': 'CG', 'Republic of Congo': 'CG',
    'Democratic Republic of the Congo': 'CD', 'DR Congo': 'CD', 'Congo-Kinshasa': 'CD',
    'Democratic Republic of Congo': 'CD', 'Micronesia': 'FM', 'Federated States of Micronesia': 'FM',
    'Palestinian territories': 'PS', 'Palestinian Territories': 'PS',
    'State of Palestine': 'PS', 'Macao': 'MO', 'Macao SAR': 'MO', 'Hong Kong SAR': 'HK',
    'People’s Republic of China': 'CN', 'Mainland China': 'CN',
    'Republic of China': 'TW', 'United States of America': 'US', 'U.S.': 'US',
    'United Kingdom of Great Britain and Northern Ireland': 'GB', 'UK': 'GB',
    'Great Britain': 'GB', 'The Netherlands': 'NL', 'Netherlands Antilles': 'X-NA',
    'Reunion': 'RE', 'Saint Martin (French part)': 'MF', 'Saint Martin': 'MF',
    'French Saint Martin': 'MF', 'Saint-Barthélemy': 'BL', 'Saint Barthelemy': 'BL',
    'Saint Pierre and Miquelon': 'PM', 'Wallis and Futuna': 'WF', 'Svalbard': 'SJ',
    'Åland': 'AX', 'The Faroe Islands': 'FO', 'Falkland Islands (Malvinas)': 'FK',
    'Pitcairn': 'PN', 'Christmas Island (Australia)': 'CX', 'Cocos Islands': 'CC',
    'Cocos (Keeling) Islands': 'CC', 'Saint Helena': 'SH',
    'North Macedonia': 'MK', 'Macedonia': 'MK', 'Kyrgyz Republic': 'KG',
    'Republic of Korea': 'KR', 'Republic of Kosovo': 'XK',
    'Democratic People\'s Republic of Korea': 'KP', 'Pridnestrovie': 'X-TRN',
    'Eswatini (Swaziland)': 'SZ', 'Tibet Autonomous Region': 'X-TIB',
    'Mount Athos': 'X-ATH', 'Akrotiri and Dhekelia': 'X-AKD',
    'Ascension Island': 'X-ASC', 'Tristan da Cunha': 'X-TDC',
    'Saint Helena, Ascension and Tristan da Cunha': 'X-SHT',
    'Jan Mayen': 'X-JAN', 'Hainan': 'X-HAINAN', 'Hainan Province': 'X-HAINAN', 'British Indian Ocean Territory': 'IO',
    'West Bank': 'X-WBK', 'Gaza Strip': 'X-GAZ',
    'Turkish Republic of Northern Cyprus': 'X-NCY',
    'South Georgia and the South Sandwich Islands': 'GS',
    'Bonaire, Sint Eustatius and Saba': 'BQ', 'Caribbean Netherlands': 'BQ',
    'Antigua and Barbuda': 'AG', 'Bosnia and Herzegovina': 'BA', 'Myanmar': 'MM',
    'Saint Kitts and Nevis': 'KN', 'Saint Lucia': 'LC', 'Saint Vincent and the Grenadines': 'VC',
    'São Tomé and Príncipe': 'ST', 'Trinidad and Tobago': 'TT', 'Turks and Caicos Islands': 'TC',
    'Turks and Caicos': 'TC', 'Sahrawi Arab Democratic Republic': 'EH',
    'Sahrawi Arab Democratic Republic (Western Sahara controlled territory)': 'EH',
    'United States Minor Outlying Islands': 'UM', 'Bonaire, St. Eustatius and Saba': 'BQ',
    'Caribbean Netherlands (includes Bonaire, Sint Eustatius and Saba)': 'BQ',
    'French Southern and Antarctic Lands': 'TF', 'Palestinian Territory': 'PS',
    'Heard Island and McDonald Islands': 'HM', 'Jeju Special Autonomous Province': 'X-JEJ',
    'Jeju-do': 'X-JEJ', 'Clipperton Island': 'X-CLP', 'Galápagos': 'X-GAL',
    'Ashmore and Cartier Islands': 'X-ASH', 'Iraqi Kurdistan': 'X-KUR',
    'UN Buffer Zone in Cyprus': 'X-CBZ', 'Korean Demilitarized Zone': 'X-DMZ',
    'Korean Demilitarised Zone': 'X-DMZ', 'UNDOF Zone and Ghajar': 'X-UND',
    'Sabah and Sarawak': 'X-SAB', 'Brest and Grodno': 'X-BRG',
    'San Andrés and Leticia': 'X-SAL', 'India PAP/RAP': 'X-PAP',
    'Protected and restricted areas of India': 'X-PAP',
    'Svalbard of Norway': 'SJ', 'Réunion': 'RE', 'Gambia, The': 'GM', 'U.S. Virgin Islands': 'VI',
}
SPECIAL = {
    'X-TIB': 'Tibet', 'X-ATH': 'Mount Athos', 'X-AKD': 'Akrotiri and Dhekelia',
    'X-ASC': 'Ascension Island', 'X-TDC': 'Tristan da Cunha', 'X-SHT': 'Saint Helena, Ascension and Tristan da Cunha',
    'SJ': 'Svalbard', 'X-HAINAN': 'Hainan (China)', 'X-JAN': 'Jan Mayen', 'X-WBK': 'West Bank', 'X-GAZ': 'Gaza Strip',
    'X-NA': 'Netherlands Antilles (historical)', 'X-JEJ': 'Jeju Island', 'X-CLP': 'Clipperton Island',
    'X-GAL': 'Galápagos', 'X-ASH': 'Ashmore and Cartier Islands', 'X-KUR': 'Iraqi Kurdistan',
    'X-CBZ': 'UN Buffer Zone in Cyprus', 'X-DMZ': 'Korean Demilitarized Zone', 'X-UND': 'UNDOF Zone and Ghajar',
    'X-SAB': 'Sabah and Sarawak', 'X-BRG': 'Brest and Grodno', 'X-SAL': 'San Andrés and Leticia',
    'X-PAP': 'Protected and restricted areas of India',
}


def clean(value):
    return ' '.join(value.split())


def key(value):
    value = unicodedata.normalize('NFKD', value.casefold().replace('’', "'"))
    return re.sub(r'[^a-z0-9]', '', value)


def write_json(path, value):
    payload = json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n'
    target = path.with_suffix('.tmp')
    target.write_text(payload, encoding='utf-8')
    target.replace(path)


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def load_url(url, cache=None):
    if cache is not None:
        slug = unquote(urlsplit(url).path.rsplit('/', 1)[-1])
        page = cache / f'{slug}.html'
        redirect = cache / f'{slug}.url'
        if not page.exists():
            raise ValueError('Source fetch failed during initial collection')
        return page.read_bytes(), redirect.read_text().strip() if redirect.exists() else url
    with TemporaryDirectory() as temp:
        file = Path(temp) / 'page.html'
        result = subprocess.run(
            ['curl', '--fail', '--location', '--silent', '--show-error', '--max-time', '30',
             '--proto', '=https', '--proto-redir', '=https',
             '--user-agent', 'VisaBrowser/0.1 (https://github.com/kchorst/VisaBrowser)',
             '--output', str(file), '--write-out', '%{url_effective}', url],
            capture_output=True, text=True, check=False,
        )
        if result.returncode:
            raise ValueError(clean(result.stderr) or 'Source request failed')
        return file.read_bytes(), result.stdout


def notes_from(cell):
    if cell is None:
        return []
    items = [clean(x.text_content()) for x in cell.xpath('./ul/li|./ol/li|./p|./div/ul/li')]
    if not items:
        items = [clean(cell.text_content())]
    return list(dict.fromkeys(note for note in items if note and note not in {'—', '–', '-', 'N/A'}))


def flag_list(value, notes):
    flags = []
    for label, pattern in PREPARATION.items():
        if not re.search(pattern, f"{value} {' '.join(notes)}", re.I):
            continue
        if not re.search(pattern, value, re.I):
            # Suppress clauses explicitly saying that a document is not required.
            clauses = [note for note in notes if re.search(pattern, note, re.I)]
            if clauses and all(re.search(r'\b(?:not required|no longer required|no .+ required|exempt)\b', note, re.I)
                               for note in clauses):
                continue
        flags.append(label)
    return flags


def classify(value):
    text = value.casefold().strip(' .}')
    text = re.sub(r' [(](?:ease|in mainland denmark|european netherlands)[)]$', '', text)
    if re.fullmatch(r'(?:admission (?:refused|prohibited)|entry (?:not permitted|refused|prohibited|banned)|'
                    r'travel prohibited|not allowed)', text):
        return ['denied']
    if text == 'visa required' or text in {'visa required in advance', 'prior visa required'}:
        return ['advance']
    if text in {'freedom of movement', 'visa waiver program', 'visa waiver', 'esta', 'ease',
                'pre-registration required', 'electronic border system', 'tourist card required'}:
        return ['free']
    parts = re.split(r'\s*(?:/|\bor\b)\s*', text)
    options = []
    for part in parts:
        if re.fullmatch(r'(?:visa not required|visa[- ]free|no visa required)', part):
            options.append('free')
        elif re.fullmatch(r'(?:e[- ]?visa|online visa|electronic visa)(?: required)?', part):
            options.append('evisa')
        elif re.fullmatch(r"(?:free )?(?:visa|entry permit|visitor'?s permit|tourist card) on arrival", part):
            options.append('arrival')
        elif part == 'e-voa':
            # This abbreviation alone does not establish whether online approval is mandatory.
            return []
        else:
            return []
    options = list(dict.fromkeys(options))
    if 'free' in options and len(options) > 1:
        return []
    return options


def extract_rule(raw, stay, notes):
    options = classify(raw)
    if not options:
        return {'reason': f'Wikipedia lists “{raw}”. The tourist entry status needs review.', 'notes': notes}
    rule = {'options': options}
    if notes:
        rule['notes'] = notes
    flags = flag_list(raw, notes)
    if flags:
        rule['flags'] = flags
    if re.search(r'\b(?:single|multiple)[ -]entr(?:y|ies)\b|\b(?:enter|entry) (?:within|by)\b', ' '.join(notes), re.I):
        rule['entry'] = 'See the source notes for the entry window or single- and multiple-entry terms.'
    if re.search(r'\b(?:\d+\s*days?\s+(?:in|within|per|out of)\s+(?:any\s+|each\s+|a\s+)?(?:\d+|one|six)|rolling|cumulative|schengen area)\b',
                 f"{stay} {' '.join(notes)}", re.I):
        rule['cumulative'] = True
    if stay and stay.casefold() not in {'—', '–', '-', 'n/a', 'unknown', 'varies', 'yes', '?'}:
        rule['stay'] = stay
    elif options == ['free']:
        stay_notes = [note for note in notes if re.fullmatch(f'{STAY_LIMIT}[.]?', note, re.I)]
        if len(stay_notes) == 1:
            rule['stay'] = stay_notes[0].rstrip('.')
    prices = list(dict.fromkeys(match.group() for note in notes for match in re.finditer(FEE, note)
                               if re.search(r'\b(?:visa|fee|cost|pay|dollars?)\b', note, re.I)
                               and not re.search(r'\b(?:exit|departure|fine|transit|minimum funds)\b', note, re.I)))
    if options == ['arrival'] and raw.casefold().startswith('free '):
        rule['fee'] = 'Free'
    elif len(prices) == 1 and len(options) == 1 and any(opt in options for opt in ['advance','evisa','arrival']):
        rule['fee'] = prices[0]

    restrictions = []
    conflicts = []
    for note in notes:
        if re.search(r'^(?:a |tourist )?visa (?:is )?(?:required|not required)\b[.!]?$', note, re.I):
            stated = classify(re.sub(r'^(?:a |tourist )|\bis \b|[.!]$', '', note, flags=re.I))
            if stated and stated != options:
                conflicts.append(note)
        if re.search(ENTRY_POINT, note, re.I) and re.search(r'\b(?:must|only|not allowed|not available|not permitted|issued at|available at|obtainable at)\b', note, re.I):
            restrictions.append(note)
        elif re.search(r'\b(?:must (?:have|hold|arrive|enter|present|travel|provide|show|carry|register|obtain)|only (?:if|for|when|with|available)|subject to|is required for entry)\b', note, re.I):
            if not re.search(r'\b(?:extensions?|transit|diplomatic|crew|business)\b', note, re.I):
                restrictions.append(note)
    if conflicts:
        return {'reason': 'The published requirement and its notes give conflicting entry rules.',
                'notes': [f'Wiki table: {raw}', *notes]}
    if restrictions and options != ['denied']:
        rule['condition'] = ' '.join(dict.fromkeys(restrictions))
    return rule


def columns(table):
    rows = table.xpath('./tr|./tbody/tr|./thead/tr')
    for position, row in enumerate(rows[:5]):
        heads = [key(clean(c.text_content())) for c in row.xpath('./th|./td')]
        if not heads or heads[0] not in {'country', 'countries', 'territory', 'territories', 'visitorto',
                                       'countryregion', 'countryorterritory', 'destination', 'countryterritory'}:
            continue
        visa = next((i for i, name in enumerate(heads) if name in {
            'visarequirement', 'visarequirements', 'conditionsofaccess', 'entryrequirement', 'entryrequirements', 'requirement'}), None)
        if visa is None:
            continue
        stay = next((i for i, name in enumerate(heads) if name in {'allowedstay', 'lengthofstay', 'duration', 'stay', 'stayduration'}), None)
        notes = next((i for i, name in enumerate(heads) if name.startswith('notes') or name == 'conditions'), None)
        if notes is not None:
            return rows[position + 1:], visa, stay, notes
    return None


def expand_rows(rows):
    spanning = {}
    for row in rows:
        cells = row.xpath('./th|./td')
        grid = {i: cell for i, (cell, _) in spanning.items()}
        spanning = {i: (cell, remaining-1) for i, (cell, remaining) in spanning.items() if remaining > 1}
        i = 0
        for cell in cells:
            while i in grid:
                i += 1
            width = int(cell.get('colspan', 1))
            height = int(cell.get('rowspan', 1))
            for _ in range(width):
                grid[i] = cell
                if height > 1:
                    spanning[i] = (cell, height-1)
                i += 1
        if len(cells) == 1 and cells[0].tag == 'th':
            continue
        yield grid


def parse(code, config, payload, url, places):
    target = urlsplit(url)
    if target.scheme != 'https' or target.hostname != 'en.wikipedia.org':
        raise ValueError('Source redirected outside English Wikipedia')
    doc = html.fromstring(payload)
    heading = clean(''.join(doc.xpath('//h1[@id="firstHeading"]//text()') or doc.xpath('//title/text()')))
    heading = heading.removesuffix(' - Wikipedia')
    canonical = doc.xpath('//link[@rel="canonical"]/@href')
    if canonical and urlsplit(canonical[0]).hostname == 'en.wikipedia.org':
        target = canonical[0]
    else:
        target = url
    if key(heading) not in {key(title) for title in config['titles']}:
        raise ValueError(f'Article title does not match passport: {heading}')
    for noise in doc.xpath("//sup|//style|//span[contains(concat(' ',normalize-space(@class),' '),' sortkey ')]"):
        if noise.getparent() is not None:
            noise.drop_tree()
    aliases = {key(name): id_ for id_, name in places.items() if id_ not in {'BNO', 'BOC', 'BOTC', 'X-SCH'}}
    aliases.update({key(name): id_ for name, id_ in ALIASES.items()})
    rules, issues, raw_rules = {}, [], {}
    prefixes = sorted((name for name, id_ in aliases.items() if id_ in {'FR','NL','AU','US','GB','CN','NO','DK','MY','GR','FI','BY','CO','AR','NZ','ES','PT','KZ','RU'}), key=len, reverse=True)
    prefixes.append('unitednations')
    for table in doc.xpath('//table[contains(concat(" ",normalize-space(@class)," ")," wikitable ")]'):
        header = columns(table)
        if not header:
            continue
        rows, visa_col, stay_col, notes_col = header
        for row in expand_rows(rows):
            if 0 not in row or visa_col not in row or row[0] is row[visa_col]:
                continue
            name = clean(row[0].text_content())
            if not name:
                continue
            name_key = key(name)
            candidate = aliases.get(name_key)
            if candidate is None and len(rows) >= PARSE_FLOOR and name_key.endswith('andterritories'):
                candidate = aliases.get(name_key.removesuffix('andterritories'))
                if candidate:
                    issues.append({'destination': name, 'reason': 'Parent-country status imported; review each territory separately'})
            if candidate is None:
                candidate = next((aliases[name_key[len(prefix):]] for prefix in prefixes
                                  if name_key.startswith(prefix) and name_key[len(prefix):] in aliases), None)
            if not candidate and name_key in {'visitorto', 'country', 'territory', 'countries'}:
                continue
            if candidate is None or candidate == 'X-NA' or not places.get(candidate):
                issues.append({'destination': name, 'reason': 'Unresolved, grouped, or historical jurisdiction'})
                continue
            raw = clean(row[visa_col].text_content())
            notes_cell = row.get(notes_col)
            notes = notes_from(notes_cell) if notes_cell is not row[visa_col] else []
            stay_cell = row.get(stay_col)
            stay = clean(stay_cell.text_content()) if stay_cell is not None and stay_cell not in [row[visa_col], notes_cell] else ''
            rule = extract_rule(raw, stay, notes)
            raw_rules.setdefault(candidate, []).append(raw)
            if candidate in rules and rules[candidate] != rule:
                earlier = rules[candidate]
                if earlier.get('options') == rule.get('options') and earlier.get('stay') == rule.get('stay') and not earlier.get('reason') and not rule.get('reason'):
                    merged_notes = list(dict.fromkeys(earlier.get('notes', []) + notes))
                    rule = extract_rule(raw, stay, merged_notes)
                else:
                    all_notes = earlier.get('notes', []) + [f'Wikipedia row: {raw}'] + notes
                    rule = {'reason': 'Wikipedia gives different rules for this destination.',
                            'notes': list(dict.fromkeys([f'Wikipedia row: {raw_rules[candidate][0]}', *all_notes]))}
            rule['sourceText'] = ' / '.join(dict.fromkeys(raw_rules[candidate]))
            rules[candidate] = rule
    known = sum(bool(rule.get('options')) for rule in rules.values())
    if not rules or (not config.get('smallTable') and (len(rules) < PARSE_FLOOR or known < PARSE_FLOOR)):
        raise ValueError(f'No usable visa table found ({len(rules)} destination rows, {known} classified)')
    for id_, rule in rules.items():
        if rule.get('reason'):
            issues.append({'destination': id_, 'reason': rule['reason']})
    return rules, issues, target


def apply_reviewed(code, rules, issue_rows, reviewed, places_for_exceptions):
    for destination, rule in rules.items():
        if not rule.get('options') or 'free' in rule['options'] or destination in reviewed.get(code, {}):
            continue
        # Unstructured exceptions are useful as notes but require human review for a matching document.
        for note in rule.get('notes', []):
            if not re.search(DOCUMENT_WORDS, note, re.I) or not re.search(
                    r'visa (?:is )?not required|visa[- ]free|exempt|can (?:enter|obtain)|may (?:enter|obtain)|'
                    r'visa waiver|eligible for', note, re.I):
                continue
            matches = set()
            issuer_names = {'US':r'U[.]?S[.]?(?:A[.]?)?|United States|American',
                            'GB':r'U[.]?K[.]?|United Kingdom|British',
                            'X-SCH':r'Schengen', 'AE':r'U[.]?A[.]?E[.]?|United Arab Emirates'}
            for issuer, pattern in issuer_names.items():
                if re.search(r'(?<!\w)(?:' + pattern + r')(?!\w)', note, re.I):
                    matches.add(issuer)
            for issuer, label in places_for_exceptions.items():
                if len(label) > 4 and re.search(r'(?<!\w)' + re.escape(label) + r'(?!\w)', note, re.I):
                    if issuer != destination:
                        matches.add(issuer)
            if re.search(r'\bany (?:country|valid visa|residence permit)\b', note, re.I):
                matches.add('*')
            if matches:
                rule.setdefault('unreviewedExceptions', []).append({'issuers': sorted(matches), 'note': note})
        if rule.get('unreviewedExceptions'):
            issue_rows.append({'destination': destination, 'reason': 'Document exception needs individual review'})
    for destination, entries in reviewed.get(code, {}).items():
        rule = rules.get(destination)
        if not rule or rule.get('reason'):
            continue
        remaining = [entry for entry in entries if any(
            key(entry['sourcePhrase']) in key(note) for note in rule.get('notes', []))]
        if len(remaining) != len(entries):
            issue_rows.append({'destination': destination, 'reason': 'A reviewed document exception changed and needs renewed review'})
            rule.update(reason='The source wording for a reviewed document exception changed.',
                        notes=rule.get('notes', []))
            rule.pop('options', None)
        else:
            rule['exceptions'] = [{k: v for k, v in entry.items() if k != 'sourcePhrase'} for entry in remaining]


def home_countries(config):
    # These travel documents do not establish entry under the same conditions
    # for every holder. Handle them separately when the app can ask for the needed facts.
    return sorted(set(config['primaryDestinations']) - {'PS', 'TW', 'VA'})


def refresh(args):
    cfg = read_json(ROOT / 'scripts/sources.json')
    reviewed = read_json(ROOT / 'scripts/document-exceptions.json')
    places = read_json(DATA / 'places.json')
    places.update(SPECIAL)
    pass_dir = DATA / 'passports'
    pass_dir.mkdir(exist_ok=True)
    index_path = DATA / 'index.json'
    old = read_json(index_path) if index_path.exists() else {'sources': {}, 'destinations': []}
    stamp = datetime.now(timezone.utc).isoformat(timespec='seconds')
    sources = deepcopy(old['sources'])
    seen_rules = {id_: read_json(pass_dir / f'{id_}.json') for id_ in sources if (pass_dir / f'{id_}.json').exists()}

    def update(item):
        code, config = item
        current = sources.get(code, {})
        url = current.get('url') or config['url']
        try:
            payload, final_url = load_url(url, args.seed_html)
            rules, issue_rows, final_url = parse(code, config, payload, final_url, places)
            previous = seen_rules.get(code, {}).get('rules', {})
            previous_known = sum('options' in rule for rule in previous.values())
            previous_notes = sum(bool(rule.get('notes')) for rule in previous.values())
            if previous and (len(set(previous) & set(rules)) < len(previous) * .92 or
                             sum('options' in rule for rule in rules.values()) < previous_known * .88 or
                             sum(bool(rule.get('notes')) for rule in rules.values()) < previous_notes * .80):
                raise ValueError('Unexpected loss of destination rows, classified requirements, or notes')
            apply_reviewed(code, rules, issue_rows, reviewed, places)
            return code, {'url': final_url, 'lastSuccess': stamp, 'lastAttempt': stamp}, {
                'rules': rules, 'issues': issue_rows, 'lastSuccess': stamp
            }
        except (ValueError, OSError, IndexError) as exc:
            return code, {**current, 'url': url, 'lastAttempt': stamp, 'error': str(exc)}, None

    refreshed = False
    with ThreadPoolExecutor(max_workers=3) as pool:
        for code, meta, shard in pool.map(update, cfg['sources'].items()):
            sources[code] = meta
            if shard is not None:
                refreshed = True
                seen_rules[code] = shard
                write_json(pass_dir / f'{code}.json', shard)

    standard = set(cfg['primaryDestinations'])
    destinations = sorted(standard | set(old['destinations']) | ({'SJ', 'X-JAN', 'X-HAINAN'} & set(places)) |
                          {id_ for shard in seen_rules.values() for id_ in shard['rules']})
    passports = sorted((standard | set(cfg['sources'])) - {'X-SCH'})
    index = {'schema': 1, 'overdueDays': OVERDUE_DAYS, 'destinations': destinations,
             'passports': passports, 'homeCountries': home_countries(cfg),
             'sources': sources}
    if refreshed:
        index['generated'] = stamp
    elif old.get('generated'):
        index['generated'] = old['generated']
    issues = []
    for code in passports:
        source = sources.get(code, {})
        url = source.get('url', CATEGORY)
        if not source.get('lastSuccess'):
            issues.append({'passport': code, 'source': url, 'destination': None,
                           'reason': source.get('error', 'No validated candidate article is mapped to this passport')})
            continue
        shard = seen_rules[code]
        for issue in shard['issues']:
            issues.append({'passport': code, 'source': url, **issue})
        for destination in set(destinations) - set(shard['rules']) - {code}:
            issues.append({'passport': code, 'source': url, 'destination': destination, 'reason': 'No mapped source row'})
        if source.get('error'):
            issues.append({'passport': code, 'source': url, 'destination': None, 'reason': source['error']})
    for candidate in cfg['otherCandidates']:
        issues.append({'passport': candidate['label'], 'source': candidate['source'], 'destination': None,
                       'reason': 'Check passport category and issuing jurisdiction'})
    write_json(DATA / 'places.json', places)
    write_json(DATA / 'coverage-issues.json', sorted(issues, key=lambda i: (i['passport'], i['destination'] or '', i['reason'])))
    write_json(index_path, index)
    print(f"{len(seen_rules)}/{len(passports)} passports, {len(destinations)} destinations, {len(issues)} coverage records")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--seed-html', type=Path, help='Use locally archived source HTML for a reproducible seed')
    refresh(parser.parse_args())
