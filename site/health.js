const whoYellowFever = 'https://www.who.int/publications/m/item/countries-with-risk-of-yellow-fever-transmission-and-countries-requiring-yellow-fever-vaccination-(november-2022)';

const whoCountryList = 'https://cdn.who.int/media/docs/default-source/travel-and-health/vaccination-requirements-and-who-recommendations-ith-2022-country-list.pdf';

// WHO country list, revised January 2023. Keep these as verification prompts.
// Each row has the source page, arrival scope, reported age and transit trigger.
const historicalYellowFever = {
  AE: [44, 'risk', '9 months or over', 'more than 12 hours'],
  AG: [7, 'risk', '1 year or over', 'more than 12 hours'],
  AL: [6, 'risk', '1 year or over', ''],
  AO: [6, 'all', '9 months or over', ''],
  AU: [7, 'risk', '1 year or over', 'more than 12 hours'],
  AW: [7, 'risk', '9 months or over', 'more than 12 hours'],
  BB: [9, 'risk', '1 year or over', ''],
  BD: [8, 'risk', '1 year or over', 'check'],
  BF: [11, 'all', '9 months or over', ''],
  BH: [8, 'risk', '9 months or over', 'more than 12 hours'],
  BI: [11, 'all', '9 months or over', ''],
  BJ: [9, 'all', '9 months or over', ''],
  BL: [36, 'risk', '1 year or over', 'more than 12 hours'],
  BN: [11, 'risk', '9 months or over', 'more than 12 hours'],
  BO: [9, 'risk', '1 year or over', ''],
  BQ: [10, 'risk', '9 months or over', 'more than 12 hours'],
  BS: [8, 'risk', '1 year or over', 'more than 12 hours'],
  BW: [10, 'risk', '1 year or over', 'check'],
  CD: [15, 'all', '9 months or over', ''],
  CF: [12, 'all', '9 months or over', ''],
  CG: [14, 'all', '9 months or over', ''],
  CI: [14, 'all', '9 months or over', ''],
  CM: [12, 'all', '1 year or over', ''],
  CN: [13, 'risk', '9 months or over', 'more than 12 hours'],
  CO: [13, 'risk', '1 year or over', 'more than 12 hours'],
  CR: [14, 'risk', '9 months or over', 'check'],
  CU: [15, 'risk', '9 months or over', 'more than 12 hours'],
  CV: [12, 'risk', '1 year or over', ''],
  CW: [15, 'risk', '9 months or over', 'more than 12 hours'],
  DJ: [16, 'risk', '1 year or over', 'more than 12 hours'],
  DM: [16, 'risk', '1 year or over', 'more than 12 hours'],
  DO: [16, 'risk', '1 year or over', 'more than 12 hours'],
  DZ: [6, 'risk', '9 months or over', 'more than 12 hours'],
  EC: [16, 'risk', '1 year or over', 'more than 12 hours'],
  EG: [17, 'risk', '9 months or over', 'more than 12 hours'],
  ER: [18, 'risk', '9 months or over', ''],
  ET: [18, 'risk', '9 months or over', 'more than 12 hours'],
  FJ: [19, 'risk', '1 year or over', 'more than 12 hours'],
  GA: [19, 'all', '9 months or over', ''],
  GD: [21, 'risk', '1 year or over', 'more than 12 hours'],
  GF: [19, 'all', '1 year or over', ''],
  GH: [20, 'all', '9 months or over', ''],
  GM: [20, 'risk', '9 months or over', 'more than 12 hours'],
  GN: [21, 'risk', '9 months or over', ''],
  GP: [21, 'risk', '1 year or over', 'more than 12 hours'],
  GQ: [17, 'risk', '9 months or over', ''],
  GT: [21, 'risk', '1 year or over', 'more than 12 hours'],
  GW: [21, 'all', '1 year or over', ''],
  GY: [22, 'risk', '1 year and over', 'more than 4 hours'],
  HN: [22, 'risk', 'between 1 and 60 years', 'more than 12 hours'],
  HT: [22, 'risk', '1 year or over', ''],
  ID: [23, 'risk', '9 months or over', ''],
  IN: [23, 'risk', '', 'check'],
  IR: [23, 'risk', '9 months or over', 'more than 12 hours'],
  JM: [24, 'risk', '1 year or over', 'more than 12 hours'],
  KE: [25, 'risk', '1 year or over', ''],
  KH: [12, 'risk', '1 year or over', 'more than 12 hours'],
  KN: [36, 'risk', '1 year or over', ''],
  KP: [15, 'risk', '1 year or over', ''],
  KZ: [25, 'risk', '', 'check'],
  LC: [36, 'risk', '9 months or over', ''],
  LK: [40, 'risk', '9 months or over', 'more than 12 hours'],
  LR: [26, 'risk', '9 months or over', ''],
  MF: [37, 'risk', '1 year or over', 'more than 12 hours'],
  MG: [27, 'risk', '9 months or over', 'more than 12 hours'],
  ML: [28, 'all', '9 months or over', ''],
  MM: [30, 'risk', '1 year or over', 'more than 12 hours'],
  MQ: [28, 'risk', '1 year or over', 'more than 12 hours'],
  MR: [28, 'risk', '1 year or over', ''],
  MS: [30, 'risk', '1 year or over', 'check'],
  MT: [28, 'risk', '9 months or over', 'more than 12 hours'],
  MV: [27, 'risk', '9 months or over', 'more than 12 hours'],
  MW: [27, 'risk', '1 year or over', 'more than 12 hours'],
  MY: [27, 'risk', '1 year or over', 'more than 12 hours'],
  MZ: [30, 'risk', '1 year or over', 'more than 12 hours'],
  NA: [30, 'risk', '9 months or over', 'more than 12 hours'],
  NC: [31, 'risk', '1 year or over', 'more than 12 hours'],
  NE: [32, 'all', '9 months or over', ''],
  NG: [32, 'risk', '9 months or over', 'check'],
  NI: [32, 'risk', '1 year or over', ''],
  NP: [31, 'risk', '9 months or over', 'more than 12 hours'],
  NU: [32, 'risk', '9 months or over', ''],
  OM: [33, 'risk', '9 months or over', 'more than 12 hours'],
  PA: [33, 'risk', '1 year or over', ''],
  PF: [19, 'risk', '1 year or over', 'more than 12 hours'],
  PG: [34, 'risk', '1 year or over', 'check'],
  PH: [35, 'risk', '9 months or over', 'more than 12 hours'],
  PK: [33, 'risk', '1 year or over', 'more than 12 hours'],
  PN: [35, 'risk', '1 year or over', ''],
  PY: [34, 'risk', '1 year or over', 'more than 24 hours'],
  QA: [35, 'risk', '9 months or over', ''],
  RW: [36, 'risk', '1 year or over', ''],
  SA: [37, 'risk', '9 months or over', 'more than 12 hours'],
  SB: [39, 'risk', '9 months or over', ''],
  SC: [38, 'risk', '1 year or over', 'check'],
  SG: [39, 'risk', '1 year or over', 'more than 12 hours'],
  SH: [36, 'risk', '1 year or over', ''],
  SL: [39, 'all', '', ''],
  SN: [38, 'risk', '9 months or over', 'check'],
  SR: [41, 'risk', '1 year or over', 'more than 12 hours'],
  SS: [40, 'all', '9 months or over', ''],
  ST: [37, 'risk', '1 year or over', 'check'],
  SV: [17, 'risk', '1 year or over', 'more than 12 hours'],
  SX: [39, 'risk', '9 months or over', ''],
  SZ: [18, 'risk', '9 months or over', 'check'],
  TD: [13, 'risk', '9 months or over', ''],
  TG: [42, 'all', '9 months or over', ''],
  TH: [42, 'risk', '9 months or over', 'more than 12 hours'],
  TZ: [42, 'risk', '1 year or over', 'more than 12 hours'],
  UG: [44, 'all', '1 year or over', ''],
  VC: [37, 'risk', '1 year or over', ''],
  VE: [45, 'risk', '1 year or over', 'more than 12 hours'],
  WF: [45, 'risk', '1 year or over', 'more than 12 hours'],
  WS: [37, 'risk', '1 year or over', 'more than 12 hours'],
  YT: [29, 'risk', '1 year or over', 'more than 12 hours'],
  ZA: [40, 'risk', '1 year or over', 'more than 12 hours'],
  ZM: [46, 'risk', '1 year or over', 'more than 12 hours'],
  ZW: [46, 'risk', '9 months or over', 'more than 12 hours'],
};

const documents = 'Required health documents';
const check = 'Check health documents';
const screening = 'Health screening and temporary restrictions';
const notice = (heading, text, url) => ({ heading, text, url });
const yellowFever = {
  GH: notice(documents, 'Ghana requires a yellow fever vaccination certificate for covered arrivals aged 9 months or older, regardless of passport or departure country. Check exemptions with Ghana Immigration.',
    'https://evisa.immigration.gov.gh/applicant-guide.html'),
  KE: notice(check, 'Carry a yellow fever vaccination certificate if arriving from a country with a risk of transmission. Check your route with Kenya Port Health.',
    'https://porthealth.health.go.ke/entry-requirements'),
  ZA: notice(check, 'South Africa requires yellow fever proof after qualifying travel from a risk country, including airport transit over 12 hours. Check age, country list and exemptions.',
    'https://dirco.gov.za/canberra/yellow-fever/'),
  SG: notice(check, 'Singapore requires yellow fever proof if you visited a listed risk country in the previous six days, including airport transit over 12 hours.',
    'https://www.ica.gov.sg/information-and-e-services/entry-and-departure/entering-singapore/entry-requirements/yellow-fever-vaccination-certificate'),
  CN: notice(check, 'Mainland China requires a yellow fever certificate for travelers aged 9 months or older arriving from a listed risk country or after airport transit over 12 hours in one, regardless of passport. South Sudan is a risk country. Rwanda has low transmission potential and a Rwanda-only itinerary generally does not trigger this rule. Check every stop.',
    'https://wwwnc.cdc.gov/travel/destinations/traveler/none/China'),
  IN: notice(check, 'Check yellow fever proof requirements if arriving within six days of leaving a listed risk country. India also publishes a polio certificate advisory for certain routes.',
    'https://www.ihpoe.mohfw.gov.in/'),
  AL: notice(check, 'Check yellow fever proof if arriving from a country with a risk of transmission. Confirm the applicable age and route rules.',
    'https://www.gov.uk/foreign-travel-advice/albania/entry-requirements'),
  MT: notice(check, 'Malta requires yellow fever proof for covered arrivals aged 9 months or older from risk countries, including airport transit over 12 hours.',
    'https://travelhealthpro.org.uk/country/141/malta'),
  JM: notice(check, 'Jamaica requires yellow fever proof for covered arrivals from risk countries, including transit over 12 hours. Check the age and route conditions.',
    'https://www.moh.gov.jm/jamaican-travellers-reminded-to-get-yellow-fever-vaccine/'),
  BS: notice(check, 'The Bahamas requires yellow fever proof for covered arrivals over age one from risk countries. Check the current origin list.',
    'https://www.bahamas.com/plan-your-trip/island-faq/visa-immigration'),
  DO: notice(check, 'Check yellow fever proof if arriving from Espírito Santo, Minas Gerais, Rio de Janeiro or São Paulo. Confirm any exemptions on the official entry page.',
    'https://www.godominicanrepublic.com/travel/entry-requirements'),
  PY: notice(check, 'Travelers aged 1 to 59 arriving from listed areas of Bolivia, Brazil, Colombia, Guyana or Peru should check the yellow fever certificate requirement. Paraguay also publishes separate departure rules.',
    'https://dgvs.mspbs.gov.py/salud-del-viajero/requisitos-para-ingresar-a-paraguay/'),
  VE: notice(check, 'Venezuela requires yellow fever proof for travel from Brazil. Confirm the transit and age rules for your itinerary.',
    'https://www.gov.uk/foreign-travel-advice/venezuela/entry-requirements'),
  GF: notice(documents, 'French Guiana requires a yellow fever vaccination certificate for covered arrivals regardless of passport. Confirm age and exemptions before travel.',
    'https://www.gov.uk/foreign-travel-advice/french-guiana/entry-requirements'),
  PA: notice(check, 'Check whether you need yellow fever proof if arriving from a country with a risk of transmission.',
    'https://www.gov.uk/foreign-travel-advice/panama/entry-requirements'),
  BO: notice(check, 'Sources differ on which arrivals to Bolivia need yellow fever proof. Confirm your itinerary with the Bolivian consulate before travel.',
    'https://www.gov.uk/foreign-travel-advice/bolivia/entry-requirements'),
  CO: notice(check, 'Check current yellow fever certificate rules with Colombian Port Health. The rules can differ between international arrival and travel to high-risk municipalities.',
    'https://www.minsalud.gov.co/salud/epidemiologia-demografia/Paginas/salud-al-viajero.aspx'),
  EC: notice(check, 'Ecuador removed the yellow fever certificate requirement for arrivals from Colombia, Peru, Bolivia and Brazil in its August 2025 notice. Confirm other routes and updates.',
    'https://www.salud.gob.ec/el-ministerio-de-salud-publica-de-Ecuador-modifica-la-obligatoriedad-del-carne-de-vacunacion-contra-fiebre-amarilla/'),
  CR: notice(check, 'Costa Rica publishes yellow fever certificate rules for travel to and from listed risk areas, including rules for Costa Rican citizens and residents. Confirm your itinerary and residence status.',
    'https://www.ministeriodesalud.go.cr/index.php/muestratitulocomunicado/2615-a-partir-del-31-de-agosto-se-actualizan-los-requisitos-de-vacunacion-contra-la-fiebre-amarilla-para-viajeros'),
  LK: notice(check, 'Check Sri Lanka’s yellow fever certificate rule when coming from a listed risk country, including airport transit over 12 hours. Confirm the age threshold with Port Health.',
    'https://epid.gov.lk/epid/public/vaccination-during-international-travel'),
  AU: notice(screening, 'Declare relevant yellow fever risk-area travel in the previous six days. Australia may ask for a certificate or refer you to a biosecurity officer if you don’t have one.',
    'https://www.health.gov.au/sites/default/files/2026-11/national-guidelines-for-yellow-fever-vaccination-centres-and-providers.pdf'),
  BQ: notice(check, 'Bonaire, Saba and Sint Eustatius have separate yellow fever entries in the WHO list. Check the exact island, recent travel, transit duration and age threshold before departure.',
    whoCountryList),
  BT: notice(check, 'Sources differ on Bhutan’s yellow fever documentation rules. Confirm your itinerary with Bhutan Port Health.',
    'https://www.doat.gov.bt/wp-content/uploads/2023/10/AIP-AMDT-01_23.pdf')
};

const romaniaPolio = new Set(['AF', 'MG', 'PK', 'YE']);
const datedPolioChecks = new Set(['BD', 'BN', 'EG', 'GE', 'IR', 'KN', 'MA', 'MV', 'NP', 'PE', 'QA']);

export function healthNotices(destination, passport, now = Date.now()) {
  const notices = [];
  const yellow = yellowFever[destination];
  if (yellow) notices.push(yellow);
  else if (Object.hasOwn(historicalYellowFever, destination)) {
    const [page, scope, age, transit] = historicalYellowFever[destination];
    const travelers = scope === 'all' ? 'arrivals from any country' : 'arrivals from countries with yellow fever transmission risk';
    const ages = age ? ' (travelers aged ' + age + ')' : '';
    const connections = transit === 'check' ? ' Check the source for its transit rule.' :
      transit ? ' The listed rule includes airport transit of ' + transit + ' in a risk country.' : '';
    notices.push(notice(check,
      'The January 2023 WHO list reports yellow fever proof for ' + travelers + ages +
      ', regardless of passport.' + connections + ' Confirm the current rule and exceptions with the destination authority.',
      whoCountryList + '#page=' + page));
  }

  if (destination === 'RO' && romaniaPolio.has(passport)) notices.push(notice(documents,
    'Romania requires an international polio vaccination certificate for covered visa applicants from Afghanistan, Madagascar, Pakistan and Yemen. Confirm coverage with the consulate if your passport, residence and departure country differ.',
    'https://eviza.mae.ro/FAQ'));
  if (destination === 'IT') notices.push(notice(check,
    'Check the current consular checklist for polio proof if you reside in or spent over four weeks in an affected country. Ask the consulate processing your application which countries are covered.',
    'https://conscalcutta.esteri.it/en/news/dal_consolato/2018/07/avviso-per-i-richiedenti-il-visto-2/'));
  if (datedPolioChecks.has(destination)) notices.push(notice(check,
    'WHO’s country list reports a polio rule for certain travelers. Confirm the current affected origins, age or trip purpose and accepted proof with the destination authority.',
    whoYellowFever));
  if (destination !== 'PK' && passport === 'PK') notices.push(notice('Departure health documents',
    'If leaving Pakistan, check whether you must show polio vaccination proof at departure.',
    'https://www.poliofreepakistan.gov.pk/certificate/vaccination-certificate'));
  if (destination === 'SA') notices.push(notice(check,
    'For Hajj, Umrah or other covered travel, check the current Saudi Ministry of Health rules for meningococcal, polio, yellow fever or other vaccination proof.',
    'https://www.moh.gov.sa/en/healthawareness/pilgrims-health/pages/default.aspx'));
  if (destination === 'JM' && passport === 'KZ') notices.push(notice(documents,
    'If using Jamaica’s listed tourist visa waiver with a qualifying foreign visa, carry proof of measles, rubella and polio vaccination.',
    'https://www.pica.gov.jm/immigration/entry-visa-requirements'));
  if (destination === 'GB') notices.push(notice(check,
    'Check whether your visa application needs a TB test. The UK uses visa type, length of stay and residence history.',
    'https://www.gov.uk/tb-test-visa'));
  if (destination === 'KE') notices.push(notice(screening,
    'If arriving with flu-like symptoms, Kenya Port Health requires a passenger locator form.',
    'https://porthealth.health.go.ke/entry-requirements'));
  if (destination === 'US') {
    notices.push(notice(screening,
      'On U.S.-bound flights, crew must report certain illnesses to CDC, including fever with persistent cough. Officials assess any measures that apply.',
      'https://www.cdc.gov/port-health/php/airline-guidance/reporting-deaths-and-illnesses.html'));
    if (now >= Date.parse('2026-11-10T00:00:00-05:00') && now < Date.parse('2026-12-10T00:00:00-05:00')) {
      notices.push(notice(screening,
        'A temporary U.S. Ebola order can affect entry after recent presence in the DRC, Uganda or South Sudan. Check the current CDC order for your travel date and status.',
        'https://www.cdc.gov/port-health/legal-authorities/evdorder.html'));
    }
  }
  return notices;
}

export function currentHealthNotes(notes, destination) {
  return destination === 'US'
    ? notes?.filter(note => note !== 'Proof of COVID-19 vaccine required if entering by air.')
    : notes;
}
