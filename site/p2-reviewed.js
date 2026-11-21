const codes = list => new Set(list.split(' '));
const thailand = 'https://helsinki.thaiembassy.org/en/publicservice/new-visa-exemption-and-visa-on-arrival-voa-to-thailand';
const mexico = 'https://consulmex.sre.gob.mx/houston/images/2026/guia_hhpaisano_ing.pdf';
const canada = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html';
const canadaConditional = 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta/eligibility/eta-x.html';
const newZealandAustralia = 'https://www.immigration.govt.nz/visit/what-you-need-to-visit-new-zealand/chinese-and-pacific-island-visitors-travelling-from-australia/';
const newZealandCitizens = 'https://www.immigration.govt.nz/visit/what-you-need-to-visit-new-zealand/australian-citizens-and-permanent-residents-travelling-to-new-zealand/';
const saudi = 'https://visa.visitsaudi.com/Registration/Verify?lang=en';
const mauritania = 'https://www.eoinouakchott.gov.in/pdf/E-visa%20by%20Mauritania_0001_0002.pdf';
const caboVerde = 'https://www.gov.cv/en/paises-com-visto-obrigatorio-para-cabo-verde';
const pitcairn = 'https://www.government.pn/immigration';
const thaiThirty = codes('AU AT BH BE BG BT BN CA HR CY CZ DK EE FJ FI FR GE DE GR HU IS IN ID IE IL IT JP JO KW KG LV LI LT LU MY MV MT NL NZ NO OM PH PL PT QA RO SA SG SK SI ZA ES SE CH TW TR UA AE GB US');
const thaiBilateralThirty = codes('CN KZ MO RU VN HK LA MN TL');
const caboVerdeConflicts = codes('BH BT CG DJ DM DZ ET JM KG KH KI KM KP LS LY MW NR SD SO TJ TO TV TZ UG VU WS YE');
const mauritaniaArrival = codes('BNO BOC BOTC GA GT HN MO SC SS UY');
const saudiOnline = codes('BA GY MX');
const nzViaAustralia = codes('CN FJ FM KI MH NR PG PW SB TO TV VU WS');
const canadaAirGroup = codes('AG AR BR CR MA MX PA PH KN LC VC SC TH TT UY');
const canadaVisaExempt = codes('AD AT BB BE BG BN BNO CH CL CY CZ DE DK EE ES FI FR GB GR HK HU IE IS IT LI LT LU LV MC MT NL NO NZ PL SE SI SK VA WS');

const result = (options, official, fields = {}) => ({ options, official, viaDocument: false, ...fields });
const verify = (official, reason, questions = []) => result(['pending'], official, { reason, questions });
const yesNo = [['yes', 'Yes'], ['no', 'No']];
const fact = (field, detail) => ({ field, detail, fact: true, choices: yesNo });
const routeLink = (title, url) => ({ title, url });

function thailandRule(nationality) {
  const flags = ['Complete the Thailand Digital Arrival Card before arrival'];
  if (thaiThirty.has(nationality)) return result(['free'], thailand, {
    stay: 'Up to 30 days',
    condition: 'For the ordinary-passport tourist exemption. Carry proof of onward travel within 30 days and confirm any repeat-entry limits.',
    flags
  });
  if (thaiBilateralThirty.has(nationality)) return result(['free'], thailand, {
    stay: 'Up to 30 days', condition: 'Ordinary passport under a bilateral agreement. Confirm conditions for your crossing.', flags
  });
  if (nationality === 'MM') return result(['free'], thailand, {
    stay: 'Up to 14 days', condition: 'Visa exemption applies at international airports. Check visa requirements for land or sea arrival.', flags
  });
  if (nationality === 'BNO') return verify('https://london.thaiembassy.org/en/page/exemp-visa',
    'Confirm the visa requirement for a British National (Overseas) passport with the Thai embassy before traveling.');
  if (nationality === 'UZ') return result(['advance'],
    'https://moscow.thaiembassy.org/en/publicservice/revision-of-thailand-s-visa-exemption-and-visa-on-arrival-schemes', { flags });
}

function canadaRule(nationality, facts, base) {
  if (canadaVisaExempt.has(nationality) && (base?.options?.includes('free') || nationality === 'BNO')) {
    const condition = nationality === 'HK' ? 'The waiver applies to a passport issued by Hong Kong SAR. ' :
      nationality === 'GB' ? 'Check the conditions for your exact British passport type. ' : '';
    return result(['free'], canada, {
      flags: ['Check whether to obtain a Canadian eTA before travel'],
      condition: condition + 'An eTA applies when flying to or transiting through a Canadian airport and generally does not apply by land or sea. An eTA is required for certain non-cruise boats from Saint-Pierre-et-Miquelon.',
      stay: 'Normally up to six months, subject to the period granted'
    });
  }
  if (['BOC', 'BOTC', 'RO'].includes(nationality) && base?.options?.includes('free')) {
    const eligibility = {
      BOC: 'For British Overseas Citizens, Canada lists the exemption for travelers readmissible to the United Kingdom.',
      BOTC: 'Canada limits this exemption to qualifying citizenship connections to listed British overseas territories.',
      RO: 'Canada lists Romanian electronic passport holders for the visa exemption.'
    };
    return verify(canada, eligibility[nationality] + ' Confirm your exact passport and arrival route before relying on an eTA.');
  }
  if (canadaAirGroup.has(nationality) && base?.options?.includes('advance')) {
    const air = fact('p2:ca-air', 'Are you flying to Canada or transiting through a Canadian airport?');
    const history = fact('p2:ca-history', 'Have you held a Canadian visitor visa in the past ten years, or do you hold a valid U.S. nonimmigrant visa when applying?');
    const eligible = facts[air.field] === 'yes' && facts[history.field] === 'yes';
    return result(eligible ? ['free'] : ['advance'], canadaConditional, {
      condition: 'The conditional eTA is for eligible air travel. For land or sea, check the visitor-visa rules, including any separate exceptions.',
      controls: [air, history],
      flags: eligible ? ['Obtain a Canadian eTA before travel'] : undefined,
      routes: [routeLink('Official Canadian conditional eTA eligibility', canadaConditional)]
    });
  }
}

function newZealandRule(passenger, facts, base) {
  if (passenger.passport === 'AU') return result(['residentArrival'], newZealandCitizens, {
    flags: ['Complete the New Zealand Traveller Declaration'],
    condition: 'Australian citizens traveling on a valid Australian passport normally receive a resident visa on arrival if eligible.',
    notes: ['No NZeTA or advance visa is generally required for Australian citizens using an Australian passport.']
  });
  if (!nzViaAustralia.has(passenger.passport)) return;
  // Preserve the separately reviewed New Zealand resident visa pathway.
  if (passenger.documents?.some(doc => doc.issuer === 'AU' && doc.type === 'permit' &&
      doc.valid !== false && doc.qualifications?.NZ === true)) {
    return result(['residentArrival'], newZealandCitizens, {
      viaDocument: true, stay: 'Indefinite if granted',
      flags: ['Obtain an NZeTA before travel', 'Complete the New Zealand Traveller Declaration'],
      condition: 'For a qualifying Australian permanent resident traveling on the document linked to the travel passport. New Zealand assesses eligibility and character at the border.'
    });
  }
  const direct = fact('p2:nz-direct', 'Will you fly directly from Australia after passing through Australian immigration?');
  const visa = fact('p2:nz-visa', 'Will you hold an eligible Australian visa at check-in for your flight to New Zealand? Check the linked subclass list.');
  const eligible = facts[direct.field] === 'yes' && facts[visa.field] === 'yes';
  return result(eligible ? ['free'] : ['advance'], newZealandAustralia, {
    status: eligible ? 'NZeTA visitor route via Australia' : undefined,
    stay: eligible ? 'Up to three months if granted' : undefined,
    flags: eligible ? ['Obtain an NZeTA before travel', 'Complete the New Zealand Traveller Declaration'] : undefined,
    condition: 'This visitor route is for a qualifying visa holder departing directly from Australia after entering Australia. An airside connection does not qualify.',
    routes: [routeLink('Immigration New Zealand eligibility and Australian visa subclasses', newZealandAustralia)],
    notes: !eligible && base?.reason ? [base.reason] : undefined,
    controls: [direct, visa]
  });
}

function pitcairnRule(facts) {
  const sameVessel = fact('p2:pn-vessel', 'Will you arrive and leave on the same vessel and stay no more than 14 days?');
  if (!facts[sameVessel.field]) return verify(pitcairn,
    'Confirm whether this visit qualifies for a short-term visitor visa at arrival or needs entry clearance in advance.', [sameVessel]);
  return result(facts[sameVessel.field] === 'yes' ? ['arrival'] : ['permit'], pitcairn, {
    stay: facts[sameVessel.field] === 'yes' ? 'Up to 14 days' : undefined,
    condition: 'Confirm eligibility, insurance, any fees, and landing forms with Pitcairn Immigration before departure.',
    controls: [sameVessel]
  });
}

export function reviewedP2Rule(passenger, destination, base) {
  const { passport: nationality, facts = {} } = passenger;
  if (destination === 'TH') return thailandRule(nationality);
  if (destination === 'NZ') return newZealandRule(passenger, facts, base);
  if (destination === 'CA') return canadaRule(nationality, facts, base);
  if (destination === 'PN') return pitcairnRule(facts);
  if (destination === 'YE' && base?.options?.some(option => option === 'arrival' || option === 'evisa'))
    return verify('https://www.gov.uk/foreign-travel-advice/yemen/entry-requirements',
      'Confirm whether this passport can obtain a visa for the intended Yemen airport or territory before traveling.');
  if (destination === 'MG' && nationality === 'PS') return verify(
    'https://www.diplomatie.gouv.fr/fr/information-par-pays/madagascar/conseils-aux-voyageurs-entree-sejour',
    'Confirm whether Madagascar recognizes this travel document and which visa route is available.');
  if (destination === 'SR' && nationality === 'LU') return verify(
    'https://gov.sr/ministeries/ministerie-van-buitenlandse-zaken-internationale-handel-samenwerking/reizen-naar-suriname/',
    'Confirm the tourist visa and entry-fee rules for an ordinary Luxembourg passport with the Suriname authorities.');
  if (destination === 'SR' && nationality === 'CU') return result(['evisa'],
    'https://gov.sr/wp-content/uploads/2025/06/Bekendmaking-2025.06.02.pdf-2.pdf', {
      status: 'Online tourist card or visa required',
      condition: 'Apply for the required tourist card or visa through the official online portal before travel.',
      routes: [routeLink('Suriname application portal', 'https://suriname.vfsevisa.com/')]
    });
  if (destination === 'KW' && ['BG', 'HR'].includes(nationality)) return result(['evisa', 'arrival'],
    'https://kuwaitvisa.moi.gov.kw/tourist-visa-instructions', {
      stay: 'Up to three months if granted',
      condition: 'Kuwait permits issuance at Kuwait International Airport for eligible passport holders. The standard tourist visa is single entry and valid for use within one month.'
    });
  if (destination === 'UZ' && nationality === 'US') return result(['free'],
    'https://gov.uz/en/uzbektourism/news/view/99187', { stay: 'Up to 30 days' });
  if (destination === 'CI' && base?.options?.includes('evisa')) return {
    ...base,
    condition: 'Obtain approved online pre-enrolment before boarding. Complete biometric enrolment on arrival at Abidjan.',
    notes: base.notes?.filter(note => !/holders must arrive via|^must arrive via/i.test(note)),
    routes: [routeLink('Ivorian eVisa pre-enrolment and fee', 'https://snedai.com/e-visa/')]
  };
  if (destination === 'UG' && base?.options?.includes('evisa') && base.options.includes('arrival'))
    return result(['evisa'], 'https://immigration.go.ug/index.php/services/tourist-visa', {
      condition: 'The standard tourist visa is applied for online. Confirm any exception before relying on visa issuance without prior approval.',
      fee: 'USD 50 for the standard single-entry tourist visa'
    });
  if (destination === 'PS') return verify('https://www.gov.uk/foreign-travel-advice/palestine/entry-requirements',
    'Confirm the intended West Bank or Gaza crossing and applicable permissions with the competent authorities before traveling.');
  if (destination === 'X-SOS') return verify('https://matsne.gov.ge/en/document/view/19132',
    'Georgian law restricts access. Confirm any permission and a lawful route with Georgian authorities before traveling.');
  if (destination === 'CV' && caboVerdeConflicts.has(nationality)) return verify(caboVerde,
    'Cabo Verde lists this passport as requiring a visa before travel. The imported arrival option conflicts with that guidance. Confirm with the consulate before relying on issuance on arrival.');
  if (destination === 'MR' && mauritaniaArrival.has(nationality)) return verify(mauritania,
    'Confirm this passport’s electronic approval and port before traveling. Visa-required travelers need approval before boarding.');
  if (destination === 'MR' && base?.options?.includes('evisa'))
    return result(['evisa'], mauritania, {
      status: 'Electronic approval required before travel',
      condition: 'If a visa is required for your travel document, obtain electronic approval before boarding. Confirm visa issuance, biometrics, fee and eligible port.'
    });
  if (destination === 'SA' && saudiOnline.has(nationality)) return result(['evisa'], saudi, {
    status: 'Saudi tourist eVisa available', condition: 'Confirm tourist application eligibility and the terms on your grant.'
  });
  if (destination === 'MX' && nationality === 'BR') return result(['evisa'],
    'https://www.gob.mx/sre/prensa/visa-electronica-para-nacionales-de-brasil?idiom=es-MX', {
      condition: 'Brazil’s electronic visitor visa route is for a single entry by air. For land or sea, confirm the applicable visa or exemption with a Mexican consulate.'
    });
  if (destination === 'MX' && ['AR', 'CL'].includes(nationality)) return result(['free'], mexico, {
    stay: 'Up to 180 days maximum, subject to authorization at entry',
    flags: ['Check immigration documentation and fees for your arrival route'],
    notes: ['The 2026 guide lists MXN 983 for the visitor charge and an exemption for land stays under seven days. For air arrivals the migration form is generated once entry is authorized.']
  });
  if (destination === 'SC' && nationality === 'BW') return result(['free'], 'https://www.ics.gov.sc/permits/visitors-permit', {
    stay: 'Initial visitor permit up to three months, if granted',
    flags: ['Obtain Seychelles travel authorization before departure'],
    condition: 'Show confirmed accommodation, sufficient funds and a return or onward ticket for the visitor permit on arrival.'
  });
  if (destination === 'WS' && base?.options?.includes('arrival') && /(?:visitor|entry).*permit/i.test(base.sourceText ?? ''))
    return result(['arrival'], 'https://mpmc.gov.ws/divisions/immigration/attheborder/', {
      status: 'Visitor permit on arrival',
      stay: 'Up to 90 days on the standard permit',
      condition: 'Confirm passport eligibility and bring accommodation details, onward travel, any required documents for the next destination and proof of funds.'
    });
  if (destination === 'BT' && nationality === 'IN') return result(['arrival'], 'https://bhutan.travel/visa', {
    status: 'Bhutan visitor permit required',
    condition: 'Eligible Indian visitors may apply before travel or at entry. Check the applicable Sustainable Development Fee and documents.'
  });
  if (destination === 'IN' && base?.options?.includes('evisa')) {
    const arrival = ['AE', 'JP', 'KR'].includes(nationality) && base.options.includes('arrival');
    return {
      ...base,
      stay: 'Depends on the visa product and grant',
      condition: arrival ? 'Visa on arrival is conditional. Confirm prior-visa requirements, the airport and what documentation you need.' :
        'Confirm the current designated entry points and the dates on your visa grant.',
      notes: base.notes?.filter(note => !/e-?visa holders must arrive via|visa on arrival is only|only be obtained twice/i.test(note)),
      routes: arrival ? [routeLink('India visa on arrival eligibility and ports', 'https://indianvisaonline.gov.in/visa/visa-on-arrival.html'),
        ...(nationality === 'AE' ? [routeLink('UAE passport visa on arrival guidance', 'https://www.indembassyuae.gov.in/page/visa-on-arrival/')] : [])] : undefined
    };
  }
}
