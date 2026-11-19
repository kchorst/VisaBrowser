import { auditFindings } from './tourist-audit.js';

const onward = 'Proof of onward travel';
const transit = 'Connections and boarding';
const arrival = 'Arrival forms and documents';
const notice = (heading, text, url) => ({ heading, text, url });
const schengen = new Set('AT BE BG HR CZ DK EE FI FR DE GR HU IS IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE CH'.split(' '));
const schengenVisas = 'https://home-affairs.ec.europa.eu/policies/schengen/schengen-visas/applying-schengen-visa_en';
const usWaiver = 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html';

const touristNotices = {
  TH: [
    notice(onward, 'For the 30-day tourist visa exemption, show proof of departure within 30 days of arrival. Check separate requirements if you have a visa or are using visa on arrival.',
      'https://london.thaiembassy.org/en/page/exemp-visa'),
    notice(arrival, 'Submit the Thailand Digital Arrival Card during the three-day window before arrival if entering Thailand.',
      'https://tdac.immigration.go.th/')
  ],
  SG: [
    notice(onward, 'Singapore may require confirmed return or onward tickets and evidence you can enter your next destination. The 96-hour Visa Free Transit Facility has its own eligibility and onward-ticket rules.',
      'https://www.ica.gov.sg/information-and-e-services/entry-and-departure/entering-singapore/entry-requirements/visa-free-transit-facility'),
    notice(transit, 'Ask your carrier whether you stay airside. Collecting baggage or a boarding pass landside and checking in again can require Singapore immigration clearance.',
      'https://www.ica.gov.sg/information-and-e-services/entry-and-departure/entering-singapore/transit-through-singapore'),
    notice(arrival, 'Submit the SG Arrival Card within three days including arrival day if entering Singapore, unless exempt. An airside connection without immigration clearance is exempt.',
      'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/sg-arrival-card')
  ],
  GB: [
    notice(transit, 'Ask your carrier whether your connection goes through UK border control. Changing airports or collecting bags can require landside transit. Check the visa or ETA rules for your passport and documents.',
      'https://www.gov.uk/transit-visa/overview')
  ],
  VN: [
    notice(onward, 'The general tourist eVisa guidance does not list a paid exit ticket. If traveling one-way, confirm what your carrier and specific entry route require.',
      'https://evisa.gov.vn/')
  ],
  CR: [
    notice(onward, 'Visitors must show departure before their authorized stay ends. The official guidance accepts prepaid bus or flight tickets and proof of cruise passage.',
      'https://www.visitcostarica.com/planning-your-trip/entry-requirements')
  ],
  NZ: [
    notice(onward, 'Visa-waiver visitors need paid onward travel before departure for New Zealand. Immigration lists alternative proof for cruises and private craft. You may also be asked for a ticket out of your next destination.',
      'https://www.immigration.govt.nz/visas/visa-waiver-visitor-visa/')
  ],
  MV: [
    notice(onward, 'The tourist visa-on-arrival checklist calls for confirmed return tickets, accommodation and sufficient funds, or an approved sponsorship.',
      'https://www.immigration.gov.mv/visa/tourist-visa'),
    notice(arrival, 'Submit the free Traveller Declaration within 96 hours before your arrival flight.',
      'https://imuga.immigration.gov.mv/traveller')
  ],
  PH: [
    notice(onward, 'A valid return or onward ticket is required for the 30-day visa-free tourist route.',
      'https://hanoipe.dfa.gov.ph/images/2024/Requirements_for_PH_Visa.pdf')
  ],
  FJ: [notice(onward, 'Carry a confirmed return or applicable onward ticket for tourist entry.', 'https://www.immigration.gov.fj/border-watch')],
  CO: [notice(onward, 'Colombia’s tourist entry checklist includes a ticket out of the country.', 'https://www.migracioncolombia.gov.co/preguntas-frecuentes-importadas')],
  SC: [notice(onward, 'The visitor permit requires a valid return or onward ticket.', 'https://ics.gov.sc/permits/visitors-permit')],
  LC: [notice(onward, 'Saint Lucia requires a return ticket for visitors. Confirm what the authority accepts if departing by a different route.', 'https://staff.govt.lc/visiting-saint-lucia')],
  DO: [notice(onward, 'The official tourist checklist lists arrival and return tickets. Confirm the evidence your carrier accepts at check-in.', 'https://www.godominicanrepublic.com/media/travel-alert')],
  CA: [
    notice(onward, 'Border officials may ask for your return or onward ticket and proof of funds.', 'https://www.gov.uk/foreign-travel-advice/canada/entry-requirements'),
    notice(arrival, 'If a child is traveling without one or both guardians, check consent and custody documents. Canadian guidance recommends carrying a consent letter for these trips.',
      'https://travel.gc.ca/returning/customs/entering-canada')
  ],
  GH: [notice(onward, 'Ghana’s tourist eVisa application calls for a confirmed return or onward itinerary.', 'https://evisa.immigration.gov.gh/applicant-guide.html'), notice(arrival, 'For a Ghana tourist eVisa, the application guide lists six months of passport validity after departure from Ghana, three blank pages, an itinerary, and accommodation evidence.',
    'https://evisa.immigration.gov.gh/applicant-guide.html')],
  CN: [notice(transit, 'Visa-free transit needs a confirmed onward journey to a third country or region. Ask your carrier about baggage, terminal changes, and whether you need to clear immigration.',
    'https://en.nia.gov.cn/n147418/n147463/c183412/content.html')]
};

const officialOnwardReferrals = {
  AG: 'antigua-and-barbuda', BB: 'barbados', BD: 'bangladesh', BM: 'bermuda',
  CL: 'chile', DM: 'dominica', FM: 'micronesia', IQ: 'iraq', KI: 'kiribati',
  KW: 'kuwait', KY: 'cayman-islands', MD: 'moldova', MG: 'madagascar',
  MH: 'marshall-islands', MX: 'mexico', MZ: 'mozambique', NI: 'nicaragua',
  OM: 'oman', PA: 'panama', PG: 'papua-new-guinea', SN: 'senegal',
  TC: 'turks-and-caicos-islands', TN: 'tunisia', TO: 'tonga',
  TT: 'trinidad-and-tobago', TZ: 'tanzania', UA: 'ukraine', VE: 'venezuela',
  WS: 'samoa', ZM: 'zambia'
};

function onwardReferral(destination) {
  const slug = officialOnwardReferrals[destination];
  if (!slug) return null;
  return notice(onward, 'Published entry guidance flags a return or onward ticket check. Confirm how it applies to your passport, tourist visa and arrival route.',
    `https://www.gov.uk/foreign-travel-advice/${slug}/entry-requirements`);
}

const vietnamEntries = {
  entries: 'Choose single or multiple entry when applying for the tourist eVisa.',
  validity: 'Up to 90 days. Use the dates printed on the issued eVisa.',
  stay: 'Leave by the permitted date on your issued documents.'
};
const schengenEntries = {
  entries: 'Check the sticker for single, double or multiple entry before leaving and returning to Schengen.',
  validity: 'Check the “From” and “Until” dates on the visa.',
  stay: 'Check “Duration of stay” and the overall 90 days in any 180 days ceiling.'
};

export function touristEntryTerms(destination, row) {
  if (row.home) return null;
  if (destination === 'VN' && row.options.includes('evisa')) return vietnamEntries;
  if (schengen.has(destination) && row.options.includes('advance')) return schengenEntries;
  return null;
}

export function touristDetails(destination, row) {
  if (row.home) return [];
  const notices = [...(touristNotices[destination] ?? [])];
  if (row.entry && !touristEntryTerms(destination, row)) notices.push(notice('Visa validity and entries',
    'Check the issued visa for the number of entries, validity dates and permitted stay. A side trip can use another entry. Check before re-entering on a single-entry visa.',
    row.official ?? 'https://www.gov.uk/government/publications/foreign-embassies-in-the-uk'));
  if (schengen.has(destination)) {
    notices.push(notice(onward, 'A return or round-trip ticket is one document officials may request. Check the consulate’s tourist checklist for your route.',
      'https://eur-lex.europa.eu/eli/reg/2016/399'));
    notices.push(notice(transit, 'An airport transit visa covers the international transit area. A connection that requires clearing immigration or flying onward within Schengen needs the applicable Schengen entry permission.',
      schengenVisas));
  }
  if (destination === 'US' && row.sourceText === 'Visa Waiver Program') notices.push(notice(onward,
    'For the Visa Waiver Program by air or sea, check the return or onward ticket rule and the restrictions on travel ending in Canada, Mexico or nearby islands.',
    usWaiver));
  const referral = onwardReferral(destination);
  if (referral) notices.push(referral);
  const audit = auditFindings[destination]?.[row.passenger.passport];
  if (audit) notices.push(audit);
  return notices;
}
