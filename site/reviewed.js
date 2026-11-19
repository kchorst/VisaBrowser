// Destination authorities for the reviewed cases. Keep conditions tied to the
// specific route they describe, rather than copying them onto the baseline rule.
const official = {
  schengen: 'https://home-affairs.ec.europa.eu/policies/schengen/schengen-visas/applying-schengen-visa_en',
  brSchengen: 'https://eur-lex.europa.eu/eli/agree_internation/2012/508/2022-10-01/eng',
  brNorway: 'https://www.udi.no/en/word-definitions/persons-who-do-not-need-a-visa-to-visit-norway-/',
  brChina: 'https://concordia.itamaraty.gov.br/ApiConcordia/Acordo/integra-acordo-html/13219',
  brJapan: 'https://concordia.itamaraty.gov.br/acordo/13297',
  jpBrazil: 'https://www.br.emb-japan.go.jp/itpr_pt/11_000001_00627.html',
  brKn: 'https://concordia.itamaraty.gov.br/ApiConcordia/Acordo/integra-acordo-html/7567',
  knEta: 'https://technology.gov.kn/portfolio/kn-travel-2/',
  brazil: 'https://www.gov.br/mre%20/pt-br/assuntos/portal-consular/qgrv-simples-ing-18jul25.pdf',
  brEvisa: 'https://brazil.vfsevisa.com/prod_vfsevisa_txt?country=United+States',
  usVisitor: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html',
  kwNz: 'https://www.immigration.govt.nz/about-us/news-centre/visa-waiver-travel-changes-for-kuwait-nationals/',
  ukEta: 'https://www.gov.uk/eta',
  ukBno: 'https://www.gov.uk/guidance/check-when-you-can-get-an-electronic-travel-authorisation-eta',
  kenyaEta: 'https://etakenya.go.ke/general-information',
  kenyaHealth: 'https://health.go.ke/incoming-travellers',
  koreaUs: 'https://travel.state.gov/en/international-travel/travel-advisories/south-korea.html',
  mexicoUs: 'https://travel.state.gov/en/international-travel/travel-advisories/mexico.html',
  australiaUs: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601',
  nzWaiverUs: 'https://www.immigration.govt.nz/visit/what-you-need-to-visit-new-zealand/visa-waiver-countries-and-territories/',

  brAruba: 'https://www.aruba.com/br/planeje-sua-visita/requisitos-para-turistas-na-entrada-a-aruba',
  israelEta: 'https://www.gov.il/en/service/group_entry_to_israel',
  brIsrael: 'https://embassies.gov.il/brazil/en/services/foreign-citizens/entry-visa-visiting-or-touring-israel',
  kosovo: 'https://eur-lex.europa.eu/eli/reg/2023/850/oj/eng',
  norway: 'https://www.udi.no/en/information-ukraine-and-russia/information-for-russian-nationals/',
  svalbard: 'https://www.sysselmesteren.no/en/visas-and-immigration',
  mayen: 'https://jan.mayen.no/nyheter/guidelines-for-ship-calls-and-visitors-to-jan-mayen-2023/',
  nzPassport: 'https://www.immigration.govt.nz/process-to-apply/once-you-have-a-visa/manage-your-visa-and-passport/passports-we-do-not-recognise/',
  nzResident: 'https://www.immigration.govt.nz/visas/australian-resident-visa/',
  nzVisitor: 'https://www.immigration.govt.nz/visas/visitor-visa/',
  nzWaiver: 'https://www.immigration.govt.nz/visit/what-you-need-to-visit-new-zealand/visa-waiver-countries-and-territories/',
  nzWaiverTerms: 'https://www.immigration.govt.nz/visas/visa-waiver-visitor-visa/',
  za: 'https://eta.dha.gov.za/',
  zaPorts: 'https://eta.dha.gov.za/registration-warning',
  zaPalestine: 'https://dirco.gov.za/wp-content/uploads/2025/12/Following-abuse-of-Palestinian-travellers-Home-Affairs-withdraws-90-day-visa-exemption.pdf',
  kn: 'https://www.knatravelform.kn/en',
  knVisas: 'https://www.mofa.gov.kn/visa-required-countries-for-entry-2/',
  us: 'https://travel.state.gov/en/newsroom/visas/2026/suspension-of-visa-issuance-to-foreign-nationals-to-protect-the-security-of-the-united-states.html',
  ru: 'https://evisa.kdmid.ru/',
  ruIr: 'https://www.mos.ru/upload/documents/files/318/Image_013.pdf',
  ruBy: 'https://mfa.rs/en/citizens/travel-abroad/visas-and-states-travel-advisory/belarus',
  by: 'https://travel.state.gov/en/international-travel/travel-advisories/destination.blr.html',
  ir: 'https://evisa.mfa.ir/en/',
  irKish: 'https://www.gov.uk/foreign-travel-advice/iran/entry-requirements',
  tm: 'https://turkmenistaninfo.gov.tm/en/news/turkmenistan-zapusti-1',
  tmEntry: 'https://travel.state.gov/en/international-travel/travel-advisories/turkmenistan.html',
  china: 'https://en.nia.gov.cn/n147418/n147463/c183412/content.html',
  hainan: 'https://en.nia.gov.cn/n147418/n147463/c180637/content.html',
  tmChina: 'https://ch.china-embassy.gov.cn/ger/ls_fw_s_1/sbqz/202608/t20260821_12008399.htm',
  haiti: 'https://immigration.mict.gouv.ht/formulaire-electronique-dentree-et-de-sortie-ikat/'
};

const codes = list => new Set(list.split(' '));
const schengen = codes('AT BE BG HR CZ DK EE FI FR DE GR HU IS IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE CH');
const russianRestrictions = codes('NO FI EE LV LT PL');
const nzReviewed = codes('XK PS AF SN CD CG IR RU BY HT TM CN');
/* Nationalities in the UK government's 9 Apr 2026 ETA eligibility list.
   Do not infer eligibility from the Wikipedia heading alone. TW requires
   an identification number in its passport and is handled separately. */
const ukEtaEligible = codes('AD AG AR AU AT BS BH BB BE BZ BR BN BG CA CL CR HR CY CZ DK EE FI FR DE GR GD GT GY HK HU IS IT IL JP KI KW LV LI LT LU MO MY MV MT MH MU MX FM MC NL NZ NO OM PW PA PG PY PE PL PT QA RO WS SM SA SC SG SB KR SK SI ES KN VC SE CH TO TV AE US UY VA');
const ukEtaNotEligible = codes('NI LC NR BW TT CO');

// Nationality exemptions verified in the November 2026 audit.
const kenyaEtaExemptDays = new Map([
  ['CM', 60], ['CV', 60], ['SC', 60], ['SN', 60], ['ST', 60],
  ['CG', 90], ['GM', 90], ['LC', 90], ['MZ', 90],
  ['BI', 180], ['CD', 180], ['SS', 180], ['TZ', 180]
]);

// Ordinary passports on the State Department's Visa Waiver Program list.
const usaWaiverPassports = codes('AD AT AU BE BN CH CL CZ DE DK EE ES FI FR GR HR HU IE IL IS IT JP KR LI LT LU LV MC MT NL NO NZ PL PT QA SE SG SI SK SM');
const australiaEVisitorPassports = codes('AD AT BE BG CH CY CZ DE DK EE ES FI FR GB GR HR HU IE IS IT LI LT LU LV MC MT NL NO PL PT RO SE SI SK SM');
const australiaEtaPassports = codes('BN CA HK JP KR MY SG TW US');

const usRestricted = codes('AF PS IR CG HT SN');
const tmReviewed = codes('HT PS IR CN AF RU BY US SN CD CG XK');
const chinaTransit = codes('AL AT BY BE BA BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LV LT LU MT MC ME NL MK NO PL PT RO RU RS SK SI ES SE CH UA GB CA US AR BR CL MX AU NZ BN ID JP KG QA SG KR AE VN');
const hainan = codes('AL AR AU AT BY BE BA BR BN BG CA CL HR CY CZ DK EE FI FR DE GR HU IS ID IE IT JP KZ KG LV LT LU MY MT MX MC ME NL NZ MK NO PH PL PT QA KR RO RU RS SG SK SI ES SE CH TH UA AE GB US VN');
const shortStay = '90 days in any 180 days across Schengen';
const authorization = 'Electronic travel authorization';
const yesNo = [['yes', 'Yes'], ['no', 'No']];
const fact = (field, detail, choices = yesNo) => ({ field, detail, choices, fact: true });
const choice = (field, detail, choices) => fact(field, detail, choices);
const docCheck = (doc, field, detail, choices = yesNo) => ({ id: doc.id, field, detail, choices, issuer: doc.issuer });
const routeOptions = {
  'china:route': choice('china:route', 'Mainland China trip type', [
    ['visit', 'Tourist visit'], ['24h', '24-hour transit to a third country or region'],
    ['240h', '240-hour transit to a third country or region']
  ]),
  'svalbard:route': choice('svalbard:route', 'Does the route pass through mainland Norway / Schengen?', [
    ['no', 'No'], ['once', 'Yes, one Schengen entry'], ['twice', 'Yes, Schengen entry both ways']
  ]),
  'iran:route': choice('iran:route', 'Iran destination', [
    ['mainland', 'Mainland Iran'], ['kish', 'Kish Island'], ['qeshm', 'Qeshm Island']
  ])
};

const rule = (status, source, fields = {}) => ({ options: [status], official: source, ...fields });
const unknown = (reason, source, search, questions = [], fields = {}) =>
  rule('pending', source, { reason, search, questions, ...fields });
const officialNote = (base, source, notes) => ({ ...base, official: source, notes });
const values = passenger => passenger.facts ?? {};

function checkDocument(documents, questionFactory) {
  const questions = [];
  for (const document of documents) {
    const check = questionFactory(document);
    if (check === true) return { accepted: document, questions: [] };
    if (check) questions.push(check);
  }
  return { questions };
}

function schengenDocument(passenger, destination, permitsOnly = false) {
  const documents = (passenger.documents ?? []).filter(d => schengen.has(d.issuer) || d.issuer === 'X-SCH');
  return checkDocument(documents, doc => {
    if (!doc.type) return docCheck(doc, 'type', 'Which Schengen document do you hold?',
      [['visa', 'Visa'], ['permit', 'Residence permit'], ['other', 'Other document']]);
    if (doc.type !== 'permit' && (permitsOnly || doc.type !== 'visa')) return false;
    if (doc.valid === false) return false;
    if (doc.valid !== true) return docCheck(doc, 'valid', 'Will this document be valid for the full trip?');
    if (doc.type === 'permit') {
      if (!schengen.has(doc.issuer) && doc.qualifications?.[destination] !== true) {
        if (doc.qualifications?.[destination] === false) return false;
        return docCheck(doc, 'qualify', 'Is this a recognized residence permit issued by a Schengen country?');
      }
    } else {
      const scope = doc.schengenScope;
      if (!scope) return docCheck(doc, 'schengenScope', 'What does the Schengen visa cover?', [
        ['uniform', 'Short-stay visa valid across Schengen'], ['limited', 'Short-stay visa limited to listed countries'],
        ['transit', 'Airport transit only'], ['other', 'Other or unsure']
      ]);
      if (scope === 'transit') return false;
      if (scope === 'other') return docCheck(doc, 'schengenScope', 'Check the visa type and the “Valid for” field.', [
        ['uniform', 'Short-stay visa valid across Schengen'], ['limited', 'Short-stay visa limited to listed countries'],
        ['transit', 'Airport transit only']
      ]);
      if (scope === 'limited' && doc.qualifications?.[destination] !== true) {
        if (doc.qualifications?.[destination] === false) return false;
        return docCheck(doc, 'qualify', 'Does the visa’s “Valid for” field cover this destination and all Schengen countries on the route?');
      }
    }
    const entryKey = 'schengenEntry';
    if (doc[entryKey] === 'no') return false;
    if (doc[entryKey] !== 'yes') return docCheck(doc, entryKey,
      'Do you have any required entries left and enough authorized days for this trip?');
    return true;
  });
}

function schengenRule(passenger, destination, base) {
  const nationality = passenger.passport;
  if (nationality === 'BR' && base?.options?.includes('free')) return {
    ...base, stay: shortStay, cumulative: true,
    official: destination === 'NO' ? official.brNorway : official.brSchengen
  };
  const restricted = nationality === 'RU' && russianRestrictions.has(destination);
  if (restricted) {
    if (destination !== 'NO') return unknown('Russian tourist entry restrictions can depend on the country, route and residence status.',
      'https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en',
      'Russian ordinary passport tourist entry external border residence permit exceptions immigration authority');
    const { accepted, questions } = schengenDocument(passenger, destination, true);
    if (accepted) return rule('existing', official.norway, { status: 'Existing residence permit', stay: shortStay });
    if (questions.length) return unknown('Check whether the traveler qualifies for Norway’s residence-permit exception.',
      official.norway, 'Norway UDI Russian national tourism Schengen residence permit entry visa', questions);
    return rule('denied', official.norway, {
      status: 'Tourist entry restricted',
      condition: 'A Schengen visitor visa alone does not lift Norway’s restriction on tourism at the external border. Confirm any other exception directly with UDI.'
    });
  }

  if (nationality === 'XK') {
    const biometric = fact('kosovo:biometric', 'Do you have a qualifying biometric Kosovo passport?');
    if (values(passenger)[biometric.field] === 'yes') return rule('free', official.kosovo, {
      stay: shortStay, cumulative: true, condition: 'Use a qualifying biometric passport. Check issue date, validity and remaining Schengen days.'
    });
    if (!values(passenger)[biometric.field]) return unknown('The Kosovo waiver requires a qualifying biometric passport.',
      official.kosovo, 'Kosovo biometric passport Schengen visa waiver 90 days in 180', [biometric]);
    base = rule('advance', official.kosovo, { notes: ['The biometric-passport waiver does not cover this document. Check any existing visa or other exception.'] });
  }

  if (base?.options?.includes('advance')) {
    const { accepted, questions } = schengenDocument(passenger, destination);
    if (accepted) return rule('existing', official.schengen, {
      status: accepted.type === 'permit' ? 'Existing residence permit' : 'Existing visa covers this trip',
      stay: shortStay, cumulative: true
    });
    if (questions.length) return unknown('Check whether the existing Schengen document covers this trip.',
      official.schengen, 'Schengen visa Valid for From Until Number of entries remaining stay', questions);
  }
  return base;
}

function newZealand(passenger) {
  const facts = values(passenger);
  if (passenger.passport === 'AF') {
    const authority = choice('af-nz:authority', 'Which authority issued your Afghan passport?', [
      ['republic', 'Islamic Republic of Afghanistan'], ['emirate', 'Islamic Emirate of Afghanistan'], ['other', 'Other or unsure']
    ]);
    const year = choice('af-nz:year', 'When was that passport issued?', [
      ['before', 'Before 2004'], ['recognized', '2004–2021'], ['after', 'After 2021']
    ]);
    if (facts[authority.field] === 'emirate' ||
        (facts[authority.field] === 'republic' && ['before', 'after'].includes(facts[year.field]))) {
      return rule('denied', official.nzPassport, { status: 'Passport not recognized',
        condition: 'Immigration New Zealand does not recognize this passport for travel. Confirm any other travel document with Immigration New Zealand.' });
    }
    if (facts[authority.field] !== 'republic' || facts[year.field] !== 'recognized')
      return unknown('New Zealand recognizes certain Afghan passports based on both issuing authority and issue year.',
        official.nzPassport, 'Immigration New Zealand Afghan passport issuing authority 2004–2021',
        facts[authority.field] === 'republic' ? [year] : [authority]);
  }
  const australianDocuments = (passenger.documents ?? []).filter(doc => doc.issuer === 'AU' && doc.type !== 'other');
  const { accepted, questions } = checkDocument(australianDocuments, doc => {
    if (doc.valid === false || doc.qualifications?.NZ === false) return false;
    if (doc.qualifications?.NZ !== true) return docCheck(doc, 'qualify',
      'Is this a valid Australian Permanent Resident Visa or Resident Return Visa linked to your travel passport? Temporary residency does not qualify.');
    return true;
  });
  if (accepted) return rule('residentArrival', official.nzResident, {
    flags: [authorization], stay: 'Indefinite if granted',
    condition: 'Obtain an NZeTA before travel. New Zealand assesses the resident visa at the border, including character requirements.'
  });
  if (passenger.passport === 'BR') return rule('free', official.nzWaiver, {
    flags: ['Obtain an NZeTA before travel'], stay: 'Up to 3 months per visit; up to 6 months in any 12 months',
    cumulative: true, controls: questions,
    notes: ['New Zealand assesses entry and grants the Visa Waiver Visitor Visa at the border. It expires when you leave.', 'Show onward travel and sufficient funds. The NZeTA fee and visitor levy generally apply.'],
    routes: [{ title: 'Visa Waiver Visitor Visa conditions', url: official.nzWaiverTerms },
      { title: 'Request an NZeTA', url: 'https://www.immigration.govt.nz/visas/new-zealand-electronic-travel-authority-nzeta/' }]
  });
  if (questions.length) return unknown('Check whether the Australian immigration document qualifies for the resident visa route.',
    official.nzResident, 'New Zealand Australian permanent resident NZeTA Permanent Resident Visa Resident Return Visa', questions);
  return rule('advance', official.nzVisitor, {
    notes: passenger.passport === 'PS' ? ['Egyptian refugee travel documents for Palestinians have separate recognition rules. Verify the exact document with Immigration New Zealand.'] : []
  });
}

function svalbard(passenger, data) {
  const route = routeOptions['svalbard:route'];
  const via = values(passenger)[route.field];
  const norway = schengenRule(passenger, 'NO', data[passenger.passport]?.rules?.NO);
  const source = official.svalbard;
  const scope = { controls: [route] };
  if (via === 'no') return rule('free', source, { ...scope, notes: ['Svalbard has separate local visitor rules. Check the Governor’s trip guidance.'] });
  if (!via) return unknown('Svalbard itself requires no visa. Check whether the inbound or outbound route enters Schengen.',
    source, 'Governor of Svalbard visa mainland Norway Schengen two entries', [], scope);
  if (norway?.options?.includes('free')) return rule('free', source, {
    ...scope, condition: 'Check that the Schengen visa waiver covers travel through mainland Norway and any return leg.'
  });
  if (norway?.options?.includes('denied')) return rule('denied', official.norway, {
    ...scope, status: 'Mainland Norway route restricted', notes: ['Svalbard does not require a visa of its own. Check the requirements of the chosen route.']
  });
  const entries = via === 'twice' ? 'at least two Schengen entries' : 'a Schengen entry';
  const question = fact('svalbard:entries', `Does your existing visa or residence document cover ${entries} for this route?`);
  if (norway?.options?.includes('existing') && values(passenger)[question.field] === 'yes')
    return rule('existing', source, { ...scope, condition: `Verify ${entries} and the dates on the document for the transit route.` });
  return unknown(`Svalbard itself requires no visa. The selected route needs ${entries} for a traveler subject to a Schengen visa requirement.`,
    source, 'Svalbard mainland Norway transit Schengen visa two entries route',
    [...(norway?.questions ?? []).map(item => ({ ...item, destination: 'NO' })), question], scope);
}

function brazilChinaWaiver(destination, fields = {}) {
  const toBrazil = destination === 'BR';
  const expiry = toBrazil ? '2027-01-01T00:00:00-03:00' : '2027-01-01T00:00:00+08:00';
  if (Date.now() >= Date.parse(expiry)) return unknown(
    'The last confirmed tourist visa waiver ended December 31, 2026. Check for an extension or a visitor visa.',
    official.brChina, 'Brazil China reciprocal tourist visa waiver renewal after December 31 2026', [], fields);
  return rule('free', official.brChina, {
    ...fields, stay: toBrazil ? 'Up to 30 days total in 12 months from first entry; no extension' : 'Up to 30 days',
    cumulative: toBrazil, condition: 'The waiver is published through December 31, 2026. Check the rule for later travel.',
    notes: toBrazil ? ['The waiver covers valid ordinary mainland Chinese passports. Trips outside the waiver may require a separate visitor visa.'] :
      ['Use a valid ordinary Brazilian passport. For a separate transit rule, choose a transit itinerary under Mainland China trip type.'],
    routes: toBrazil ? [{ title: 'Brazil visa center guidance on repeat visits', url: 'https://visa.vfsglobal.com/chn/en/bra/news/chinese-citizens' }] : []
  });
}

function brazilJapanWaiver(passenger, destination) {
  const toBrazil = destination === 'BR';
  const source = toBrazil ? official.brJapan : official.jpBrazil;
  const expiry = toBrazil ? '2029-09-30T00:00:00-03:00' : '2029-09-30T00:00:00+09:00';
  if (Date.now() >= Date.parse(expiry)) return unknown('The last confirmed ePassport waiver ended September 29, 2029. Verify the current visitor visa rule.',
    source, 'Brazil Japan bilateral ordinary ePassport waiver extension');
  const passport = fact('br-jp:epassport', 'Will you travel on a valid ordinary ePassport that meets ICAO standards?');
  const fields = { controls: [passport] };
  const answer = values(passenger)[passport.field];
  if (answer === 'yes') return rule('free', source, {
    ...fields, stay: 'Up to 90 consecutive days', condition: 'Use the qualifying ePassport. The waiver is published through September 29, 2029.'
  });
  if (answer === 'no') return rule('advance', source, {
    ...fields, notes: ['The bilateral waiver is limited to qualifying ordinary ePassports.']
  });
  return unknown('The bilateral visa waiver requires a qualifying ordinary ePassport.',
    source, 'Brazil Japan ICAO ordinary ePassport visa waiver 90 days', [passport]);
}

function chinaRoute(passenger, destination, base) {
  const facts = values(passenger);
  const nationality = passenger.passport;
  const control = routeOptions['china:route'];
  const route = facts[control.field] ?? 'visit';
  const details = { controls: [control] };
  if (destination === 'X-HAINAN') {
    if (!hainan.has(nationality)) return unknown('The reviewed Hainan waiver does not list this passport. Confirm any other Hainan visa route.',
      official.hainan, 'China National Immigration Administration Hainan visa-free eligible passports and direct arrival');
    const itinerary = fact('china:hainan', 'Will you arrive in Hainan from outside mainland China and stay in Hainan only?');
    return facts[itinerary.field] === 'yes' ? rule('free', official.hainan, {
      stay: 'Up to 30 days in Hainan', condition: itinerary.detail.replace('Will you ', 'You must ').replace('?', '.')
    }) : unknown('Hainan’s regional waiver requires a qualifying route and stay within Hainan.', official.hainan,
      'China Hainan 30-day waiver direct arrival no mainland China', [itinerary]);
  }
  if (route !== 'visit') {
    const transit = fact('china:transit:' + route, 'Do you hold confirmed onward travel to a different country or region within the selected time limit?');
    const access = route === '24h'
      ? fact('china:stay-airside', 'Will you stay within the port’s restricted area for the entire connection?')
      : fact('china:approved-ports', 'Are the ports and all places you plan to visit approved for 240-hour visa-free transit?');
    const search = 'China National Immigration Administration ' + route + ' visa-free transit onward third country ports';
    if (route === '240h' && !chinaTransit.has(nationality)) return rule('advance', official.china, {
      ...details, status: '240-hour transit waiver unavailable', notes: ['Check the 24-hour transit route or whether another visa or waiver covers the itinerary.']
    });
    if (facts[transit.field] !== 'yes' || facts[access.field] !== 'yes')
      return unknown(route === '24h' && facts[access.field] === 'no'
        ? 'Leaving the restricted port area on the 24-hour route requires a temporary entry permit.'
        : 'Check the onward destination, confirmed ticket and approved port or allowed area before using the transit waiver.',
      official.china, search, [transit, access], details);
    return rule('transit', official.china, { ...details, stay: route === '24h' ? 'Up to 24 hours' : 'Up to 240 hours',
      condition: 'Only for the qualifying transit itinerary you confirmed.' });
  }
  if (nationality === 'TM') {
    const group = fact('china:tm-tour', 'Is this a tour group booked through an authorized agency under the China–Turkmenistan agreement?');
    if (facts[group.field] === 'yes') return rule('free', official.tmChina, {
      ...details, condition: 'Confirm the tour’s authorization, itinerary and allowed duration with the organizer.'
    });
    return rule('advance', official.tmChina, { ...details, controls: [...details.controls, group],
      notes: ['An approved tour group can qualify for a separate waiver. Confirm the arrangement before relying on it.'] });
  }
  if (nationality === 'BR') return brazilChinaWaiver(destination, details);
  if (!base) return unknown('The source has no verified rule for a mainland tourist visit.', official.china,
    'mainland China tourist visa ordinary passport visa waiver', [], details);
  if (nationality === 'RU') return unknown('China lists a time-limited waiver for Russian ordinary passports. Confirm the effective dates for your planned tourist visit.',
    'https://en.nia.gov.cn/n147418/n147463/c183390/content.html',
    'China National Immigration Administration Russian ordinary passport visa free tourism waiver validity end date', [], details);
  const notes = base.notes?.filter(note => !/24[0]?-hour|Hainan|airport transit|Hong Kong|Macao|Macau/i.test(note));
  const stay = nationality === 'BY' ? 'Up to 30 days per visit; 90 days total in a calendar year' : base.stay;
  const condition = /\b(?:transit|Hainan)\b/i.test(base.condition ?? '') ? undefined : base.condition;
  return { ...base, ...details, notes, stay, condition };
}

function southAfrica(passenger, base) {
  const nationality = passenger.passport;
  if (nationality === 'PS') return rule('advance', official.zaPalestine, {
    notes: ['South Africa withdrew the 90-day exemption for ordinary Palestinian passports in December 2025. Check the available visa route with Home Affairs.']
  });
  if (nationality === 'CN') {
    const checkpoint = fact('za:port', 'Is the intended port supported by the South African approval route you plan to use?');
    const routes = [
      { title: 'South African ETA', detail: 'Apply before travel and use the port approved on the application.', url: official.za },
      { title: 'South African e-visa', detail: 'Check available visa type, authorized stay and permitted entry points on the application portal.', url: 'https://ehome.dha.gov.za/epermit/user/createUserProfile' }
    ];
    return values(passenger)[checkpoint.field] === 'yes'
      ? rule('evisa', official.zaPorts, { condition: 'Travel through the port authorized for your chosen route.', routes, controls: [checkpoint] })
      : unknown('ETA and e-visa eligibility and ports depend on the route. Check the port before relying on either option.',
        official.zaPorts, 'South Africa Home Affairs China ordinary passport ETA eVisa ports of entry', [checkpoint], { routes });
  }
  if (['AF', 'CG', 'HT', 'TM'].includes(nationality) || (base && /^(eta|electronic travel authori[sz]ation)$/i.test(base.sourceText)))
    return unknown('The source gives an ETA label without confirming eligibility for this passport. Check the available visa route and participating entry points.',
      official.za, 'South Africa Home Affairs ETA eligible nationalities ordinary passport ports of entry');
  if (['CD', 'SN', 'IR', 'BY'].includes(nationality) && base?.options?.includes('evisa')) {
    const checkpoint = fact('za:evisa-port', 'Have you confirmed that your arrival port accepts this e-visa?');
    if (values(passenger)[checkpoint.field] !== 'yes') return unknown(
      'Confirm the current e-visa program and permitted entry point before relying on the online route.',
      'https://ehome.dha.gov.za/epermit/user/createUserProfile',
      'South Africa eVisa eligible nationality approved airport OR Tambo', [checkpoint], { notes: base.notes });
    return { ...base, controls: [checkpoint] };
  }
  return base;
}

function usa(passenger) {
  const facts = values(passenger);
  const held = fact('us:effective-visa', 'Did you hold a valid U.S. visa on January 1, 2026 that still covers this trip?');
  const outside = fact('us:outside', 'Were you outside the U.S. when the proclamation took effect on January 1, 2026?');
  const exemption = fact('us:exception', 'Could an official exception apply, such as U.S. permanent residency?');
  const search = 'US State Department Presidential Proclamation 10998 effective January 1 2026 existing visa exceptions';
  if (facts[held.field] === 'yes') return rule('existing', official.us, {
    status: 'Existing visa covers this trip', condition: 'Confirm that it still covers the trip and any required entries. Admissions decisions are separate.'
  });
  if (facts[held.field] === 'no' && facts[outside.field] === 'yes' && facts[exemption.field] === 'no')
    return rule('denied', official.us, { status: 'Tourist entry restricted',
      notes: ['The published restriction covers new tourist visa issuance and entry in these circumstances.'] });
  const questions = facts[held.field] === 'no' ? [outside, exemption] : [held];
  return unknown('Check whether the traveler is covered by the current U.S. visa issuance and entry restriction.',
    official.us, search, questions);
}

function russiaIran(passenger, destination) {
  const group = fact('ru-ir:tour-group', 'Is this a qualifying organized tour under the Russia–Iran agreement (5–50 travelers, up to 15 days)?');
  const entered = values(passenger)[group.field];
  const routes = [{ title: 'Accredited tour-group waiver', detail: 'Confirm that your organizer and group qualify.', url: official.ruIr }];
  if (destination === 'RU') routes.push({ title: 'Russian unified e-visa',
    detail: 'Apply in advance. Use an approved checkpoint for entry and exit. Single entry; up to 30 days within its validity.', url: official.ru });
  if (entered === 'yes') return rule('free', official.ruIr, {
    stay: 'Up to 15 days', condition: 'Confirm waiver eligibility with the authorized tour organizer.', controls: [group], routes
  });
  if (destination === 'RU') {
    const checkpoint = fact('ru:ports', 'Are both Russian entry and exit checkpoints approved for the unified e-visa?');
    if (values(passenger)[checkpoint.field] === 'yes') return rule('evisa', official.ru, {
      stay: 'Up to 30 days within the e-visa validity', condition: 'Single entry via approved checkpoints.', controls: [group, checkpoint], routes
    });
    return unknown('Iranian passports are eligible for Russia’s unified e-visa. Confirm the checkpoints or the group-tour waiver.',
      official.ru, 'Russia unified e-visa Iranian passport approved checkpoints accredited tour group', [checkpoint], { controls: [group], routes });
  }
  return unknown('The group waiver and the requirements for independent travel to Iran are separate. Confirm the visa or airport approval route before travel.',
    official.ir, 'Iran visa Russian ordinary passport accredited tour visa on arrival airport preapproval',
    [], { controls: [group], routes });
}

function mutualVisa(passenger, destination, base) {
  const other = destination === 'RU' ? 'BY' : 'RU';
  const docs = (passenger.documents ?? []).filter(doc => doc.issuer === other && doc.type !== 'other');
  if (!docs.length) return base;
  const { accepted, questions } = checkDocument(docs, doc => {
    if (doc.valid === false || doc.qualifications?.[destination] === false) return false;
    if (doc.qualifications?.[destination] !== true) return docCheck(doc, 'qualify',
      'Have you confirmed that this visa or permit covers the full visit under the Russia–Belarus agreement and that your crossing is designated?');
    return true;
  });
  if (accepted) return rule('existing', official.ruBy, {
    status: 'Existing document covers this trip', condition: 'Use the designated route you confirmed and carry the recognized travel document.'
  });
  if (questions.length) return unknown('Check the existing visa or residence document and the designated crossing under the Russia–Belarus agreement.',
    official.ruBy, 'Russia Belarus mutual visa recognition designated crossing existing visa eligibility', questions);
  return base;
}

export function reviewedRule(passenger, destination, base, data) {
  const nationality = passenger.passport;
  if (destination === 'GB') {
    if (nationality === 'BNO') return rule('free', official.ukBno, {
      stay: 'Up to six months per visit',
      viaDocument: false,
      notes: ['Travel with a valid British National (Overseas) passport. No visitor visa or ETA is required for a standard tourist visit.'],
      routes: [{ title: 'UK Standard Visitor rules', url: 'https://www.gov.uk/standard-visitor' }]
    });
    if (nationality === 'IE') return rule('free', official.ukEta, {
      notes: ['Irish citizens generally do not need a UK ETA or visitor visa; check other travel-document and Common Travel Area conditions.']
    });
    if (nationality === 'TW') return unknown(
      'Taiwan ETA eligibility requires a passport containing a Taiwanese identification number. Confirm this before relying on the ETA route.',
      official.ukEta, 'UK ETA Taiwan passport identification card number');
    if (ukEtaNotEligible.has(nationality) && base?.options?.includes('free')) return unknown(
      'The latest UK ETA nationality list does not include this passport. Check whether a Standard Visitor visa is required.',
      official.ukEta, 'UK ETA visitor visa eligibility nationality 2026',
      [], { routes: [{ title: 'Official UK ETA eligibility list',
        url: 'https://www.gov.uk/guidance/check-when-you-can-get-an-electronic-travel-authorisation-eta' }] });
    if (ukEtaEligible.has(nationality)) return rule('free', official.ukEta, {
      stay: base?.stay || 'Up to six months per visit',
      fee: '£20 (UK ETA application)',
      flags: ['Obtain UK ETA before travel unless exempt'],
      notes: ['UK ETA application fee: £20 (verified November 2026). The UK lists specific exemptions and eligibility conditions.',
        'An ETA is permission to travel, not guaranteed admission.'],
      routes: [{ title: 'Official UK ETA eligibility and application', url: official.ukEta }]
    });
  }
  if (destination === 'KE' && kenyaEtaExemptDays.has(nationality)) {
    const days = kenyaEtaExemptDays.get(nationality);
    return rule('free', official.kenyaEta, {
      stay: `Confirm on arrival · eTA exemption up to ${days} days`,
      viaDocument: false,
      flags: (base?.flags ?? []).filter(flag => flag !== authorization),
      notes: [
        `Kenya exempts this nationality from the eTA for visits of up to ${days} days. Kenyan immigration determines admission and the actual stay permitted.`,
        'Check route-specific health requirements. Kenya requires a valid yellow fever certificate when arriving from an endemic country.'
      ],
      routes: [{ title: 'Kenya Ministry of Health requirements', url: official.kenyaHealth }]
    });
  }
  // An emergency immigration direction applies independently of a wiki snapshot.
  // From 12 Nov 2026 NZDT Kuwait passports cannot use the NZeTA visa waiver.
  // Do not reinstate the waiver automatically after the published suspension ends.
  if (destination === 'NZ' && nationality === 'KW') {
    // Holders of a qualifying Australian permanent-resident document may
    // have a separate resident-visa pathway, not the suspended tourist waiver.
    const auResidence = (passenger.documents ?? []).filter(doc => doc.issuer === 'AU' &&
      doc.type === 'permit' && doc.valid !== false && doc.qualifications?.NZ !== false);
    if (auResidence.some(doc => doc.qualifications?.NZ === true)) return newZealand(passenger);
    if (auResidence.length) return unknown(
      'Kuwait passport visa-waiver travel is suspended. Check whether your Australian permanent-resident document independently qualifies for New Zealand resident entry.',
      official.kwNz, 'New Zealand Australian permanent resident NZeTA Kuwait passport visa waiver',
      auResidence.map(doc => docCheck(doc, 'qualify',
        'Does this Australian permanent-resident document independently qualify for a New Zealand resident visa?')));
    const start = Date.parse('2026-11-12T23:59:00+13:00');
    const end = Date.parse('2027-02-11T23:59:00+13:00');
    if (Date.now() >= start && Date.now() < end) return rule('advance', official.kwNz, {
      status: 'Visitor visa required before travel',
      condition: 'New Zealand has temporarily suspended visa-waiver travel for Kuwait passport holders. An NZeTA alone does not qualify.',
      notes: ['Visa-waiver suspension is published through 11 February 2027 (NZDT). Verify any changes before travel.'],
      routes: [{ title: 'Immigration New Zealand Kuwait notice', url: official.kwNz }]
    });
    if (Date.now() >= end) return unknown(
      'The published Kuwait visa-waiver suspension has reached its review date. Confirm current NZ immigration instructions before relying on the waiver.',
      official.kwNz, 'New Zealand Kuwait visa waiver suspension after February 2027 extension');
  }
  // Verified ordinary U.S. tourist passport routes. Keep an ETA distinct
  // from a conventional visa and don't classify routine arrival forms as visas.
  if (nationality === 'US') {
    if (destination === 'GB' && base?.options?.includes('free')) return rule('free', official.ukEta, {
      stay: 'Up to six months per visit',
      fee: '£20 (UK ETA application)',
      flags: ['UK ETA required before travel (unless exempt)'],
      notes: ['An ETA currently costs £20. Check exemptions for existing UK immigration status and other qualifying circumstances.', 'An ETA is permission to travel, not a guarantee of admission.'],
      routes: [{ title: 'Official UK ETA application and exemptions', url: official.ukEta }]
    });
    if (destination === 'MX' && base?.options?.includes('free')) return rule('free', official.mexicoUs, {
      stay: 'Up to 180 days maximum; immigration decides the actual authorized stay',
      flags: ['Check FMM entry documentation for your arrival route'],
      notes: ['Visa-free for ordinary tourism; additional immigration documentation depends on air, land or sea arrival.',
        'Check the Mexican INM / U.S. State Department entry requirements and border-zone exemptions.'],
      routes: [{ title: 'Mexico: entry and exit requirements', url: official.mexicoUs }]
    });
    if (destination === 'KR' && base?.options?.includes('free')) {
      const expires = Date.parse('2027-01-01T00:00:00+09:00');
      if (Date.now() < expires) return rule('free', official.koreaUs, {
        stay: base.stay,
        flags: ['Complete Korean e-Arrival card unless exempt'],
        notes: ['U.S. ordinary passport holders are exempt from K-ETA through 31 December 2026 (Korea time).',
          'K-ETA-exempt visitors generally submit an e-Arrival card unless another exemption applies; check the official traveler navigator.'],
        routes: [{ title: 'Official Korean e-Arrival card', url: 'https://www.e-arrivalcard.go.kr/' }]
      });
      return unknown('The published K-ETA exemption ended 31 December 2026. Check whether an extension applies or apply for K-ETA before travel.',
        official.koreaUs, 'US passport South Korea K-ETA exemption January 2027');
    }
    if (destination === 'AU' && base?.options?.includes('free')) return rule('evisa', official.australiaUs, {
      status: 'Electronic Travel Authority visa (subclass 601)',
      stay: 'Up to three months per visit',
      flags: ['Obtain Australian ETA subclass 601 before travel'],
      notes: ['Australia calls its ETA subclass 601 a visa; eligible U.S. ordinary passports may apply via the official Australian ETA app.'],
      routes: [{ title: 'Australia ETA subclass 601', url: official.australiaUs }]
    });
    if (destination === 'NZ' && base?.options?.includes('free')) return rule('free', official.nzWaiverUs, {
      stay: 'Generally up to three months per visit',
      flags: ['Obtain NZeTA before travel'],
      notes: ['NZeTA is a pre-travel authority for eligible visa-waiver visitors. Fees and visitor levy may apply; check current official amounts.'],
      routes: [{ title: 'NZ visa-waiver and NZeTA guidance', url: official.nzWaiverUs }]
    });
  }
  if (destination === 'NZ' && (nationality === 'BR' || nzReviewed.has(nationality))) return newZealand(passenger);
  if ((destination === 'JP' && nationality === 'BR') || (destination === 'BR' && nationality === 'JP'))
    return brazilJapanWaiver(passenger, destination);
  if (destination === 'BR' && nationality === 'CN') return brazilChinaWaiver(destination);
  if (destination === 'BR' && nationality === 'US') return rule('evisa', official.brEvisa, {
    stay: 'Up to 90 days per visit', notes: ['Obtain the e-visa before travel and carry a printed copy of the approved e-visa.']
  });
  if (destination === 'AU' && australiaEVisitorPassports.has(nationality)) {
    return rule('evisa', 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/evisitor-651/', {
      status: 'eVisitor visa (subclass 651)',
      stay: 'Up to three months per visit',
      notes: ['Apply before traveling. Check the grant notice for validity, permitted stay and entry conditions.']
    });
  }
  if (destination === 'AU' && australiaEtaPassports.has(nationality)) {
    return rule('evisa', official.australiaUs, {
      status: 'Electronic Travel Authority visa (subclass 601)',
      stay: 'Up to three months per visit',
      notes: ['Check ETA passport eligibility and apply via the official Australian ETA app before travel.']
    });
  }
  if (destination === 'US' && nationality === 'CA') return rule('free',
    'https://travel.state.gov/content/travel/en/us-visas/tourism-visit.html', {
      viaDocument: false,
      notes: ['Canadian citizens generally do not need a nonimmigrant visa for ordinary tourism. Confirm the travel document and admission conditions for your route.']
    });
  if (destination === 'US' && (usaWaiverPassports.has(nationality) || ['GB', 'TW'].includes(nationality))) {
    const waiverSource = 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html';
    const passportConditions = {
      GB: 'Use a qualifying British citizen passport with the right of permanent abode in the United Kingdom.',
      TW: 'Use a qualifying Taiwan passport that includes the personal identification number.'
    };
    return rule('free', waiverSource, {
      sourceText: 'Visa Waiver Program',
      viaDocument: false,
      stay: 'Up to 90 days under the Visa Waiver Program',
      condition: passportConditions[nationality],
      flags: ['Obtain ESTA before travel if using the Visa Waiver Program'],
      notes: ['The waiver requires an eligible biometric passport and an approved ESTA. Check the State Department’s travel-history, dual-nationality and carrier conditions before relying on ESTA.'],
      routes: [{ title: 'Official ESTA application', url: 'https://esta.cbp.dhs.gov/' }]
    });
  }
  if (destination === 'US' && ['BG', 'RO'].includes(nationality)) return rule('advance', official.usVisitor, {
    notes: ['Apply for a U.S. visitor visa for ordinary tourism. Check your issued visa for validity and number of entries.'],
    routes: [{ title: 'U.S. Visa Waiver Program eligible countries', url: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html' }]
  });
  if (destination === 'US' && nationality === 'BR') return rule('advance', official.usVisitor, {
    notes: ['A B-2 or combined B-1/B-2 visitor visa is the ordinary tourist route. The visa’s validity and the period granted at the border are separate.']
  });
  if (destination === 'BR' && nationality === 'XK') return rule('advance', official.brazil, {
    notes: ['Brazil lists a special consular category for Kosovo. Ask the Brazilian consulate which document to present and confirm the permitted stay.']
  });
  if (destination === 'AW' && nationality === 'BR') return rule('free', official.brAruba, {
    flags: ['Complete Aruba’s ED Card'], notes: ['Check proof of yellow fever vaccination and other arrival requirements before travel.'],
    routes: [{ title: 'Aruba ED Card and sustainability levy', url: 'https://www.aruba.com/br/planeje-sua-visita/como-chegar-em-aruba/ed-card-online' }]
  });
  if (destination === 'IL' && nationality === 'BR') return rule('free', official.brIsrael, {
    stay: 'Up to 3 months', flags: ['Obtain ETA-IL before travel'],
    routes: [{ title: 'ETA-IL requirements and application', url: official.israelEta }]
  });
  if (destination === 'KN' && nationality === 'BR') return rule('free', official.brKn, {
    flags: ['Obtain an eTA before travel'],
    notes: ['Travelers who qualify as residents or have another recognized status may use the immigration and customs form instead.'],
    routes: [{ title: 'eTA and immigration form requirements', url: official.knEta }, { title: 'Official entry portal', url: official.kn }]
  });
  if (schengen.has(destination)) return schengenRule(passenger, destination, base);
  if (destination === 'SJ') return svalbard(passenger, data);
  if (destination === 'X-JAN') {
    const notes = ['Visitor access is limited during construction through winter 2027–28. Confirm availability before planning a visit.',
      'Check the station commander for visits up to 24 hours, Nordland police for visits up to one week, or the Ministry of Justice for longer visits.'];
    return nationality === 'NO'
      ? rule('free', official.mayen, { condition: 'Contact the station commander before arrival.', notes })
      : rule('permit', official.mayen, { notes, condition: 'Obtain prior visitor permission from the authority responsible for the length of your stay.' });
  }
  if (destination === 'ZA') return southAfrica(passenger, base);
  if (destination === 'IL' && ['US', 'JP'].includes(nationality) && base?.options?.includes('free'))
    return { ...base, official: 'https://www.gov.il/en/service/group_entry_to_israel',
      flags: [...new Set([...(base.flags ?? []), 'Obtain ETA-IL before travel'])] };
  if (destination === 'KN' && nationality === 'XK') return unknown(
    'Confirm whether an eTA is sufficient for a Kosovo passport or an e-visa is also required.',
    official.kn, 'Kosovo passport St Kitts and Nevis eTA e-visa entry requirement',
    [], { routes: [{ title: 'Ministry visa-required list', url: official.knVisas }] });
  if (destination === 'US' && usRestricted.has(nationality)) return usa(passenger);
  if (destination === 'US' && nationality === 'TM') return rule('advance', official.us, {
    notes: ['The Turkmenistan restriction in Proclamation 10998 concerns immigrant visas. Confirm the ordinary visitor visa rules for this trip.']
  });
  if (destination === 'US' && nationality === 'CN' && base) return officialNote(base,
    'https://www.cbp.gov/travel/international-visitors/electronic-visa-update-system-evus',
    ['EVUS generally applies to holders of a 10-year B1/B2, B1 or B2 visa traveling on a PRC passport. Check the particular visa before travel.']);
  if (destination === 'CN' || destination === 'X-HAINAN') return chinaRoute(passenger, destination, base);
  if (destination === 'TM' && tmReviewed.has(nationality)) return unknown(
    'Turkmenistan launched an online visa system. The available category, nationality eligibility and invitation requirements for this trip still need confirmation.',
    official.tm, 'Turkmenistan State Migration Service tourist eVisa ordinary passport approved invitation airport',
    [], { routes: [{ title: 'Invitation and entry requirements', url: official.tmEntry }] });
  if (destination === 'IR') {
    const control = routeOptions['iran:route'];
    const region = values(passenger)[control.field];
    if (region === 'kish' || region === 'qeshm') return unknown(
      'Confirm the island-specific entry requirements for this passport, arrival point and any onward travel to mainland Iran.',
      official.irKish, 'Iran Kish Qeshm island visa passport route accredited tour mainland entry',
      [], { controls: [control] });
    if (nationality === 'RU') {
      const reviewed = russiaIran(passenger, destination);
      return { ...reviewed, controls: [control, ...(reviewed.controls ?? [])] };
    }
    if (['PS', 'BY', 'TM', 'CN', 'HT'].includes(nationality) && base?.options?.some(o => ['free', 'evisa', 'arrival'].includes(o)))
      return unknown('Confirm the mainland tourist visa, waiver or visa-on-arrival conditions for this passport and port.',
        official.ir, 'Iran Ministry of Foreign Affairs tourist visa on arrival approved airport preapplication passport',
        [], { controls: [control] });
    if (base) return { ...base, controls: [control] };
  }
  if (destination === 'RU' && nationality === 'IR') return russiaIran(passenger, destination);
  if (destination === 'RU' && nationality === 'TM') {
    const checkpoint = fact('ru:ports', 'Are both Russian entry and exit checkpoints approved for the unified e-visa?');
    return values(passenger)[checkpoint.field] === 'yes' ? rule('evisa', official.ru, {
      stay: 'Up to 30 days within the e-visa validity', condition: 'Single entry through approved checkpoints.', controls: [checkpoint]
    }) : unknown('Confirm the current list of checkpoints before relying on Russia’s unified e-visa.',
      official.ru, 'Russian unified e-visa Turkmenistan ordinary passport approved border checkpoints', [checkpoint]);
  }
  if (destination === 'RU' && nationality === 'CN') return unknown(
    'Confirm the effective dates and route conditions of the Chinese ordinary-passport waiver. An accredited group trip is a separate route.',
    official.ru, 'Russia Chinese ordinary passport current tourist visa waiver end date accredited group');
  if (destination === 'BY' && nationality === 'CN' && base?.options?.includes('free'))
    return { ...base, stay: 'Up to 30 days per visit; 90 days total in a calendar year' };
  if (destination === 'BY' && nationality === 'US') {
    const route = fact('by:evisa-route', 'Have you confirmed the entry and exit route is permitted under the Belarus e-visa rules?');
    return values(passenger)[route.field] === 'yes' ? rule('evisa', official.by, {
      stay: 'Up to 30 days', condition: 'Use the permitted ports on the confirmed route.', controls: [route]
    }) : unknown('Belarus e-visa use depends on the entry and exit route, including direct travel to or from Russia.',
      official.by, 'Belarus US ordinary passport electronic visa permitted airport direct Russia route', [route]);
  }
  if ((destination === 'BY' && ['PS', 'HT', 'TM'].includes(nationality)) ||
      (destination === 'RU' && ['PS', 'HT'].includes(nationality))) {
    const available = mutualVisa(passenger, destination, base);
    if (available !== base) return available;
    if (destination === 'BY' && ['PS', 'HT'].includes(nationality)) return unknown(
      'Confirm whether an existing visa or an approved Minsk airport arrangement covers the trip.',
      official.ruBy, 'Belarus Minsk airport visa on arrival preapproved support documents Russia existing visa', [],
      { notes: base?.notes });
    return available;
  }
  if (destination === 'HT' && base?.options) return {
    ...base, official: official.haiti,
    flags: [...new Set([...(base.flags ?? []), 'Complete the iKat entry/exit form'])],
    notes: [...(base.notes ?? []).filter(note => !/open borders|borders are currently/i.test(note)),
      'Check current air and land operations separately from visa eligibility.']
  };
  return base;
}

const researchSources = {
  US: official.us, ZA: official.za, NZ: official.nzVisitor, CN: official.china,
  'X-HAINAN': official.hainan, SJ: official.svalbard, 'X-JAN': official.mayen,
  KN: official.kn, RU: official.ru, BY: official.by, IR: official.ir, HT: official.haiti, TM: official.tm
};
export const officialFor = destination => researchSources[destination] ?? (schengen.has(destination) ? official.schengen : undefined);
