// Pair-specific findings and referrals from the November 2026 P1 ledgers.
// Keep published visa classifications separate from scope-limited audit evidence.
const auditGroups = {
  "AD": [
    ["BW BZ FJ", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Andorra and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "AF": [
    ["ID", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, effective date. Ask the consular mission serving your place of residence for the document requirements for Afghanistan and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["AE", "Confirm entry details", "Confirm the scope of the reported restriction and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Afghanistan and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction. Ask the consular mission serving your place of residence for the document requirements for Afghanistan and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["RU", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Afghanistan and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "AG": [
    ["FM GM SN ST", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Antigua & Barbuda and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "AL": [
    ["XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the consular mission serving your place of residence for the document requirements for Albania and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "AM": [
    ["PK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition, effective date. Ask the consular mission serving your place of residence for the document requirements for Armenia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["AZ", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Armenia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the consular mission serving your place of residence for the document requirements for Armenia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["OM", "Confirm entry details", "Confirm which entry route and paperwork apply and check the arrival route or residency condition, effective date. Ask the consular mission serving your place of residence for the document requirements for Armenia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "AQ": [
    ["AE AF AL AT BG BH BN BNO BOC BOTC BY CL CZ DO ES GB GT HK HU IE IT JO JP KH KR LB LK MD MY NO PH PL PT RO RS SG SK TH TW US UY VN XK", "Reviewed entry guidance", "Audit finding. The Antarctic Treaty Secretariat directs visitors and operators to the competent national authority. Ask the operator which authority and permit covers the expedition.", ["https://www.ats.aq/devAS/e/Ats/NationalCompetentAuthorities"]],
  ],
  "AR": [
    ["TW", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition, current fee. Ask the consular mission serving your place of residence for the document requirements for Argentina and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["VE", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Argentina and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["KW", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Argentina and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "AS": [
    ["TW", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the exact travel document. Use American Samoa’s own immigration rules. Check the passport, sponsorship or existing visa and the relevant territorial visitor permit before travel.", ["https://legalaffairs.as.gov/visa-entry"]],
    ["AL AR BG BH CN EG HU KH MA MD MY PH TH UA", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Use American Samoa’s own immigration rules. Check the passport, sponsorship or existing visa and the relevant territorial visitor permit before travel.", ["https://legalaffairs.as.gov/visa-entry"]],
    ["AT AU BN CH CL CZ DE ES FM FR GB IL IT JP KR MH NO NZ PL PT PW QA SG SK", "Confirm entry details", "Confirm which visa, waiver or permit applies. Use American Samoa’s own immigration rules. Check the passport, sponsorship or existing visa and the relevant territorial visitor permit before travel.", ["https://legalaffairs.as.gov/visa-entry"]],
  ],
  "AU": [
    ["AD AT BE BG CH CY CZ DE DK EE ES FI FR GB GR HR HU IE IS IT LI LT LU LV MC MT NO PL PT RO SE SI SK SM VA", "Reviewed entry guidance", "Audit finding. Australia publishes the subclass 651 eVisitor as a visa for eligible passport holders. The UK entry here refers to British citizens. Vatican passports must indicate Holy See nationality. Some listed passports also qualify for subclass 601, including Ireland.", ["https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/evisitor-651/", "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601"]],
    ["BN BNO CA HK JP KR MY SG TW US", "Reviewed entry guidance", "Audit finding. Australia lists these passports for subclass 601, an electronic visa. Taiwan’s official and diplomatic passports are excluded. BN(O) eligibility is specific to 601.", ["https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601"]],
    ["BI BJ CI CM ML NE NR SD SN TD TV ZW", "Reviewed entry guidance", "Audit finding. Australia publishes a subclass 600 offshore tourist application route. The authority assesses eligibility and publishes separate conditions, processing times and cost concessions.", ["https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600/tourist-stream-overseas"]],
    ["IR", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. An imported admission restriction has no verified scope for this passport. Ask Home Affairs about the applicable visitor pathway and any individual restriction.", ["https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder"]],
  ],
  "AZ": [
    ["JP", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Azerbaijan and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "BD": [
    ["SO", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the consular mission serving your place of residence for the document requirements for Bangladesh and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "BI": [
    ["HK", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Burundi and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "BM": [
    ["PH", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Bermuda and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["AE", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Bermuda and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "BO": [
    ["MY", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Bolivia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "BV": [
    ["IQ", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Bouvet Island and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "BY": [
    ["ID", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, current fee. Ask the consular mission serving your place of residence for the document requirements for Belarus and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["KR", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, effective date. Ask the consular mission serving your place of residence for the document requirements for Belarus and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["AU CA JP SG", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Belarus and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["CO NZ", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Belarus and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["BNO", "Confirm entry details", "Confirm which entry route and paperwork apply and check the exact travel document, arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Belarus and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["LV", "Confirm entry details", "Confirm which entry route and paperwork apply and check the arrival route or residency condition, effective date. Ask the consular mission serving your place of residence for the document requirements for Belarus and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "CA": [
    ["AE AU JP KR QA", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the arrival route or residency condition. Use Canada’s passport-specific lookup. Check whether an eTA is available, whether air travel is required, and whether prior Canadian or current U.S. documents are a condition.", ["https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html"]],
    ["GB HR IL PG PT SB SG SM", "Confirm entry details", "Confirm which visa or electronic authorization applies. Use Canada’s passport-specific lookup. Check whether an eTA is available, whether air travel is required, and whether prior Canadian or current U.S. documents are a condition.", ["https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html"]],
    ["TW", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the exact travel document. Use Canada’s passport-specific lookup. Check whether an eTA is available, whether air travel is required, and whether prior Canadian or current U.S. documents are a condition.", ["https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html"]],
    ["SO", "Confirm entry details", "Confirm the scope of the reported restriction and check the exact travel document. Use Canada’s passport-specific lookup. Check whether an eTA is available, whether air travel is required, and whether prior Canadian or current U.S. documents are a condition.", ["https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html"]],
    ["BS PA TT", "Confirm entry details", "Confirm which visa, waiver or permit applies. Use Canada’s passport-specific lookup. Check whether an eTA is available, whether air travel is required, and whether prior Canadian or current U.S. documents are a condition.", ["https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/entry-requirements-country.html"]],
  ],
  "CC": [
    ["JP KR US", "Confirm entry details", "Confirm which visa or electronic authorization applies. Check whether the itinerary is domestic or international, the Australian immigration rules and any local island restrictions.", ["https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia"]],
    ["IL JO", "Confirm entry details", "Confirm which visa, waiver or permit applies. Check whether the itinerary is domestic or international, the Australian immigration rules and any local island restrictions.", ["https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia"]],
  ],
  "CI": [
    ["AO", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Côte d’Ivoire and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "CN": [
    ["MO", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition, effective date. Confirm which mainland entry basis fits the passport, course of travel and trip date. Distinguish a general tourism waiver from transit, regional programs and special documents.", ["https://en.nia.gov.cn/"]],
    ["ID MX", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, effective date. Confirm which mainland entry basis fits the passport, course of travel and trip date. Distinguish a general tourism waiver from transit, regional programs and special documents.", ["https://en.nia.gov.cn/"]],
    ["UA", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Confirm which mainland entry basis fits the passport, course of travel and trip date. Distinguish a general tourism waiver from transit, regional programs and special documents.", ["https://en.nia.gov.cn/"]],
    ["AU BE BR CA CL DK EE FI FR GB IE IS IT JP KR LU LV MC ME MK NL NO NZ PL PT RU SE SK", "Confirm entry details", "Confirm which entry route and paperwork apply and check the arrival route or residency condition, effective date. Confirm which mainland entry basis fits the passport, course of travel and trip date. Distinguish a general tourism waiver from transit, regional programs and special documents.", ["https://en.nia.gov.cn/"]],
  ],
  "CR": [
    ["LK", "Confirm entry details", "Confirm the scope of the reported restriction. Ask the consular mission serving your place of residence for the document requirements for Costa Rica and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "CU": [
    ["BN FM IE KP LI MM PA PL SD SK TT UY", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the effective date. Confirm whether the electronic visa replaces the tourist card for this passport and date. Check any separate migration or health form.", ["https://evisacuba.cu/"]],
    ["BS EE GY LV MC SM VA", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm whether the electronic visa replaces the tourist card for this passport and date. Check any separate migration or health form.", ["https://evisacuba.cu/"]],
  ],
  "CV": [
    ["ZA", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask whether the actual passport needs a visa, EASE pre-registration or an airport tax payment. These are separate questions.", ["https://www.ease.gov.cv/"]],
    ["AT BG BR CY DE GB GR HR MT RU SG US", "Confirm entry details", "Confirm which entry route and paperwork apply and check the arrival route or residency condition, current fee. Ask whether the actual passport needs a visa, EASE pre-registration or an airport tax payment. These are separate questions.", ["https://www.ease.gov.cv/"]],
    ["PS", "Confirm entry details", "Confirm which entry route and paperwork apply and check the exact travel document, arrival route or residency condition, effective date. Ask whether the actual passport needs a visa, EASE pre-registration or an airport tax payment. These are separate questions.", ["https://www.ease.gov.cv/"]],
  ],
  "CX": [
    ["CH JP KR US", "Confirm entry details", "Confirm which visa or electronic authorization applies. Check whether the itinerary is domestic or international, the Australian immigration rules and any local island restrictions.", ["https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia"]],
    ["IL JO", "Confirm entry details", "Confirm which visa, waiver or permit applies. Check whether the itinerary is domestic or international, the Australian immigration rules and any local island restrictions.", ["https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia"]],
  ],
  "DJ": [
    ["HK", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Djibouti and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "DK": [
    ["PL", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Denmark and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "DZ": [
    ["IT", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Algeria and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "EG": [
    ["LB", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Egypt and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["AF MY SD", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Egypt and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "EH": [
    ["DE", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Confirm the administering authority, exact crossing and travel permission for the intended area. The linked advisory describes Moroccan-administered areas for British travelers.", ["https://www.gov.uk/foreign-travel-advice/western-sahara/entry-requirements"]],
    ["AE AF AG AL AO AR AU BB BF BG BH BI BJ BN BO BR BS BW BY CD CF CG CH CI CL CM CN CR CV DJ DM DZ EG ER ES ET FJ FM GA GD GH GM GN GQ GT GW HN HR HU IN IR IT JP KE KH KI KM KN KR LB LC LK LS LY MD ME MG MH MK MN MU MV MW MX MY MZ NA NG NO NR NZ OM PA PE PG PH PT PW PY QA RS RU RW SB SC SD SG SM SO SS ST SZ TD TH TN TO TT TV TZ UA UG US UY VC VN VU WS ZA ZM ZW", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm the administering authority, exact crossing and travel permission for the intended area. The linked advisory describes Moroccan-administered areas for British travelers.", ["https://www.gov.uk/foreign-travel-advice/western-sahara/entry-requirements"]],
    ["BOC BOTC TW XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Confirm the administering authority, exact crossing and travel permission for the intended area. The linked advisory describes Moroccan-administered areas for British travelers.", ["https://www.gov.uk/foreign-travel-advice/western-sahara/entry-requirements"]],
  ],
  "FM": [
    ["TM", "Confirm entry details", "Confirm which entry route and paperwork apply and check the exact travel document, effective date. Ask the consular mission serving your place of residence for the document requirements for Micronesia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "GA": [
    ["US", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, effective date. Ask the consular mission serving your place of residence for the document requirements for Gabon and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "GB": [
    ["AD AE AG AR AT BE BG BH BN BZ CA CH CL CR CY CZ DE DK EE ES FI FR GD GR GT GY HR HU IL IS IT JP KN KR KW LI LT LU LV MC MT MU MV MY NL NO OM PA PE PL PT PY QA RO SA SE SG SI SK SM TV TW US UY VA", "Reviewed entry guidance", "Audit finding. The UK publishes these nationalities for the ETA route, subject to exemptions. Taiwan requires a passport showing its identification number. The published ETA fee is £20.", ["https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-eta-national-list", "https://www.gov.uk/eta", "https://www.gov.uk/eta/when-not-need-eta"]],
  ],
  "GG": [
    ["CZ", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Guernsey and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "GH": [
    ["LY", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Ghana and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "GI": [
    ["DM", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Gibraltar and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "GS": [
    ["AE AF AG AL AO AR AT AU BB BF BG BH BI BJ BN BOC BOTC BS BW BY BZ CD CF CG CI CL CM CN CV CZ DE DJ DM DO DZ EG ER ES ET FJ FM FR GA GB GD GE GH GM GN GQ GT GW HK HU IE IL IQ IT JM JO JP KE KG KH KI KM KN KR KW KZ LB LC LK LR LS LY MA MD MG MH ML MO MR MU MV MW MY MZ NA NE NG NO NR NZ PG PH PL PT PW QA RO RS RW SB SC SD SG SK SL SM SN SO SS ST SV SZ TD TG TH TL TN TO TT TV TW TZ UA UG US UY VC VN VU WS XK ZA ZM ZW", "Reviewed entry guidance", "Audit finding. The territory requires a visitor entry permit unless deemed permission applies. A cruise operator may apply for passengers. Refer to the current permit page for deadlines, travel-document requirements and fees.", ["https://gov.gs/entry-control-order-permit-application/"]],
  ],
  "GU": [
    ["CH CL CZ QA", "Confirm entry details", "Confirm which visa or electronic authorization applies. Confirm the U.S. or territory-specific entry route, including any separate waiver and transit rules. Check the actual island and routing with CBP.", ["https://www.cbp.gov/travel/international-visitors"]],
  ],
  "GY": [
    ["AO", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Guyana and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "HK": [
    ["BNO", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the consular mission serving your place of residence for the document requirements for Hong Kong and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "HM": [
    ["AR DE FR IL", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the Australian Antarctic Division whether landing or other access is available and which environmental authorization applies.", ["https://www.antarctica.gov.au/"]],
  ],
  "HT": [
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Haiti and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "ID": [
    ["EG", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, effective date. Use the Indonesian portal to distinguish visa exemption from a B1 visa on arrival or e-VOA. Confirm the passport, permitted crossing and any other entry form.", ["https://evisa.imigrasi.go.id/"]],
    ["FR", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the effective date. Use the Indonesian portal to distinguish visa exemption from a B1 visa on arrival or e-VOA. Confirm the passport, permitted crossing and any other entry form.", ["https://evisa.imigrasi.go.id/"]],
    ["GB SA US", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the current fee. Use the Indonesian portal to distinguish visa exemption from a B1 visa on arrival or e-VOA. Confirm the passport, permitted crossing and any other entry form.", ["https://evisa.imigrasi.go.id/"]],
    ["TW", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, effective date. Use the Indonesian portal to distinguish visa exemption from a B1 visa on arrival or e-VOA. Confirm the passport, permitted crossing and any other entry form.", ["https://evisa.imigrasi.go.id/"]],
    ["AD AE AL AM AR AT AU AZ BA BE BG BH BR CA CH CL CN CO CY CZ DE DK EC EE ES FI GR HU IE IN IS IT JP KR KW LU MA MC MN MT MV MX MZ NL NO NZ OM PE PG PL PT QA RO RS RU RW SE SI SM TN TR TZ UA UZ VA VE ZA", "Confirm entry details", "Confirm which visa, waiver or permit applies. Use the Indonesian portal to distinguish visa exemption from a B1 visa on arrival or e-VOA. Confirm the passport, permitted crossing and any other entry form.", ["https://evisa.imigrasi.go.id/"]],
    ["BNO PS", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Use the Indonesian portal to distinguish visa exemption from a B1 visa on arrival or e-VOA. Confirm the passport, permitted crossing and any other entry form.", ["https://evisa.imigrasi.go.id/"]],
  ],
  "IL": [
    ["BG", "Reviewed entry guidance", "Audit finding. Bulgarian foreign ministry guidance and Israel’s entry portal support a predeparture ETA-IL for ordinary visa-exempt Bulgarian visitors. The authority’s passport and eligibility checks apply.", ["https://www.mfa.bg/en/embassyinfo/israel", "https://israel-entry.piba.gov.il/learn-about/"]],
    ["AD AL AR AT AU BB BE BR BS BY BZ CA CH CL CO CR CY CZ DE DK DM DO EC EE ES FI FJ FM FR GB GD GE GR GT HN HR HT HU IE IS IT JM JP KN KR LC LI LS LT LU LV MD ME MH MK MN MT MU MW MX NL NO NR NZ PA PE PH PL PT PW PY RO RS RU SE SG SI SK SM SR SV SZ TO TT TW UA US UY VC VU ZA", "Reviewed entry guidance", "Audit finding. Consular guidance lists this ordinary nationality for short-visit visa exemption, and Israel directs visa-exempt travelers to obtain ETA-IL before travel. Moldova is limited to biometric passports. Confirm the actual document and trip in the official tool.", ["https://embassies.gov.il/switzerland/en/the-embassy/departments/services-consular-section-visa", "https://www.gov.il/en/service/group_entry_to_israel"]],
    ["AE BW MC PG SB VA WS", "Confirm entry details", "Confirm which visa or electronic authorization applies. Confirm the exact passport in Israel’s eligibility checker. For records labeled invitation, restriction or ban, ask the Israeli mission about the specific route and any clearance.", ["https://israel-entry.piba.gov.il/"]],
    ["XK", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the exact travel document. Confirm the exact passport in Israel’s eligibility checker. For records labeled invitation, restriction or ban, ask the Israeli mission about the specific route and any clearance.", ["https://israel-entry.piba.gov.il/"]],
    ["PK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition. Confirm the exact passport in Israel’s eligibility checker. For records labeled invitation, restriction or ban, ask the Israeli mission about the specific route and any clearance.", ["https://israel-entry.piba.gov.il/"]],
    ["IQ", "Confirm entry details", "Confirm the scope of the reported restriction. Confirm the exact passport in Israel’s eligibility checker. For records labeled invitation, restriction or ban, ask the Israeli mission about the specific route and any clearance.", ["https://israel-entry.piba.gov.il/"]],
  ],
  "IM": [
    ["CZ", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Isle of Man and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "IN": [
    ["BY", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for India and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["ID MN PK", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for India and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "IO": [
    ["AE AF AG AL AO AR AT AU BB BF BG BH BI BJ BN BOC BOTC BS BW BY BZ CD CF CG CI CL CM CN CV DE DJ DM DO DZ EG ER ES ET FJ FM FR GA GB GD GE GH GM GN GQ GT GW HK HU IL IQ IT JM JO JP KE KG KH KI KM KN KR KW KZ LB LC LR LS LY MA MD MG MH ML MO MR MU MV MW MY MZ NA NE NG NO NR NZ PG PH PL PT PW QA RO RS RW SB SC SD SG SK SL SM SN SO SS ST SV SZ TD TG TH TL TN TO TT TV TW TZ UA UG US UY VC VE VN VU WS ZA ZM ZW", "Reviewed entry guidance", "Audit finding. The administering authority describes restricted access. Prior approval applies, Outer Islands yacht permits are for safe passage, and Diego Garcia access is restricted. Refer to current territorial advice.", ["https://www.biot.gov.io/visiting/", "https://www.biot.gov.io/visiting/current-travel-advice/"]],
  ],
  "IQ": [
    ["TR", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Iraq and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["IL KR", "Confirm entry details", "Confirm the scope of the reported restriction. Ask the consular mission serving your place of residence for the document requirements for Iraq and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "IR": [
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Iran and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["RU", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Iran and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["IL", "Confirm entry details", "Confirm the scope of the reported restriction. Ask the consular mission serving your place of residence for the document requirements for Iran and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "JE": [
    ["CZ", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Jersey and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "JM": [
    ["TW", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the consular mission serving your place of residence for the document requirements for Jamaica and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "JP": [
    ["CN", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Japan and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["ID QA", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Japan and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "KE": [
    ["BF CF CI DJ GA GN GQ LR ML MR", "Reviewed entry guidance", "Audit finding. Kenya lists a nationality-based eTA exemption for visits up to 60 days. The exemption window is distinct from the stay granted by immigration.", ["https://etakenya.go.ke/general-information"]],
    ["BN BZ FJ GD GY JM KM LS MV MW NR PG SB SL SZ TO TV VU", "Reviewed entry guidance", "Audit finding. Kenya lists a nationality-based eTA exemption for visits up to 90 days. The exemption window is distinct from the stay granted by immigration.", ["https://etakenya.go.ke/general-information"]],
    ["AD AE AF AG AL AM AR AT AU AZ BA BD BE BG BH BO BR BT BY CA CH CL CN CO CR CU CZ DE DK DO EC EE ES FI FM FR GB GE GR HK HR HT HU ID IE IL IN IQ IR IS IT JO JP KG KH KR KW KZ LA LB LI LK LT LU LV LY MC MD ME MH MK MM MN MO MT MX NI NL NO NP NZ OM PA PE PH PK PL PT PW PY QA RO RS RU SA SE SI SK SR SV SY TH TJ TL TM TR UA US UY UZ VA VE VN YE", "Reviewed entry guidance", "Audit finding. Kenya’s general rule requires eTA before travel for ordinary visitors outside the published exemptions. Refer to the official eligibility tool for individual exemptions and current fees.", ["https://etakenya.go.ke/general-information", "https://extern.api.etakenya.go.ke/eligibility"]],
    ["KP", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the current fee. Confirm the precise travel document and nationality in the official eTA eligibility tool. The general exemption list does not settle this document case.", ["https://extern.api.etakenya.go.ke/eligibility"]],
    ["PS XK", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the exact travel document, current fee. Confirm the precise travel document and nationality in the official eTA eligibility tool. The general exemption list does not settle this document case.", ["https://extern.api.etakenya.go.ke/eligibility"]],
    ["BNO TW", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the exact travel document. Confirm the precise travel document and nationality in the official eTA eligibility tool. The general exemption list does not settle this document case.", ["https://extern.api.etakenya.go.ke/eligibility"]],
  ],
  "KG": [
    ["CN", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, current fee. Ask the consular mission serving your place of residence for the document requirements for Kyrgyzstan and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "KN": [
    ["US", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the current fee. Check the passport against the Ministry’s visa-required list and the border portal for the applicable visa, eTA or arrival declaration.", ["https://www.mofa.gov.kn/visa-required-countries-for-entry-2/"]],
    ["AE AL AR AT AU BD BE BG BH BN BO BR BY CA CH CN CO CR CU CY CZ DE DK EE EG ES FI FJ FR GB GE GH GR HR HU ID IE IL IN IS IT JO JP KE KI KR KW LI LK LU LV MC MD ME MH MK MT MV MW MY NO NR NZ PE PG PL PT PY QA RO RU SA SB SE SG SI SK TO TR TV UA UG VA VE VU ZA ZM ZW", "Confirm entry details", "Confirm which visa or electronic authorization applies. Check the passport against the Ministry’s visa-required list and the border portal for the applicable visa, eTA or arrival declaration.", ["https://www.mofa.gov.kn/visa-required-countries-for-entry-2/"]],
    ["TW", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the exact travel document. Check the passport against the Ministry’s visa-required list and the border portal for the applicable visa, eTA or arrival declaration.", ["https://www.mofa.gov.kn/visa-required-countries-for-entry-2/"]],
  ],
  "KP": [
    ["US", "Confirm entry details", "Confirm the scope of the reported restriction and check the exact travel document. Ask the consular mission serving your place of residence for the document requirements for North Korea and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["KR", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for North Korea and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "KR": [
    ["US", "Reviewed entry guidance", "Audit finding. U.S. ordinary passport visitors are covered by the Korean temporary K-ETA exemption through 31 Dec 2026 KST. The e-Arrival Card generally applies without K-ETA unless another exemption applies. Recheck before January travel.", ["https://www.k-eta.go.kr/portal/board/viewboarddetail.do?bbsSn=299707&locale=EN", "https://www.e-arrivalcard.go.kr/portal/guide/navigator.do?locale=E", "https://travel.state.gov/en/international-travel/travel-advisories/south-korea.html"]],
    ["AU BE CA DK FI FR JP MO NO NZ PL SE TW", "Reviewed entry guidance", "Audit finding. Korean consular guidance lists these countries and regions in the temporary exemption through 31 Dec 2026 KST. Use the Korean navigator to check the passport and arrival-card obligation. For 2027 trips check for updated notices.", ["https://www.mofa.go.kr/us-philly-en/wpge/m_26418/contents.do", "https://www.k-eta.go.kr/portal/board/viewboarddetail.do?bbsSn=299707&locale=EN", "https://www.e-arrivalcard.go.kr/portal/guide/navigator.do?locale=E"]],
    ["BH MX SA", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the effective date. Use the Korean navigator with the actual passport, traveler age, destination and trip date. Check K-ETA and the arrival declaration separately.", ["https://www.e-arrivalcard.go.kr/portal/guide/navigator.do?locale=E"]],
    ["AD AL AR BA BB BN BR BS BW CL CO CR CZ DM DO EC GD GY HR HT IE IL JM KN KW KZ LC LU LV MA ME MU MY NI OM PA PE PW PY QA RS RU SB SC SR SV SZ TH TN TO TR TT UY VA VC VE ZA", "Confirm entry details", "Confirm which visa or electronic authorization applies. Use the Korean navigator with the actual passport, traveler age, destination and trip date. Check K-ETA and the arrival declaration separately.", ["https://www.e-arrivalcard.go.kr/portal/guide/navigator.do?locale=E"]],
    ["BOTC", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the exact travel document. Use the Korean navigator with the actual passport, traveler age, destination and trip date. Check K-ETA and the arrival declaration separately.", ["https://www.e-arrivalcard.go.kr/portal/guide/navigator.do?locale=E"]],
    ["BOC", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Use the Korean navigator with the actual passport, traveler age, destination and trip date. Check K-ETA and the arrival declaration separately.", ["https://www.e-arrivalcard.go.kr/portal/guide/navigator.do?locale=E"]],
    ["EE GT HN KP LI LS", "Confirm entry details", "Confirm which visa, waiver or permit applies. Use the Korean navigator with the actual passport, traveler age, destination and trip date. Check K-ETA and the arrival declaration separately.", ["https://www.e-arrivalcard.go.kr/portal/guide/navigator.do?locale=E"]],
  ],
  "KZ": [
    ["AL AT AU BG BN BZ CZ DO ES FR GB GD HK HU JM KH KW LB MD MO MV MY NZ PH PL PT RO RS SG SK SV TH TT VN ZA", "Confirm entry details", "Confirm which visa, waiver or permit applies. Check nationality in the Kazakhstan visa table and the exact crossing for QazETA. Kazakhstan announced a phased rollout from 1 November 2026 at selected checkpoints for visa-free entry.", ["https://www.gov.kz/org/mfa/press/article/details/253813?lang=en"]],
    ["BNO BOC BOTC", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Check nationality in the Kazakhstan visa table and the exact crossing for QazETA. Kazakhstan announced a phased rollout from 1 November 2026 at selected checkpoints for visa-free entry.", ["https://www.gov.kz/org/mfa/press/article/details/253813?lang=en"]],
  ],
  "LA": [
    ["CH", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Laos and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "LB": [
    ["LY MA SY TN", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, current fee. Ask the consular mission serving your place of residence for the document requirements for Lebanon and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["EG", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the current fee. Ask the consular mission serving your place of residence for the document requirements for Lebanon and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["IL", "Confirm entry details", "Confirm the scope of the reported restriction. Ask the consular mission serving your place of residence for the document requirements for Lebanon and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "LI": [
    ["KW", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Liechtenstein and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "LK": [
    ["AE AT AU BH BY CA CH CN DE GB ID IL IN IR IT JP KR KW KZ MY NP NZ OM PK PL QA RU SA TH TR US", "Reviewed entry guidance", "Audit finding. Sri Lanka’s fee waiver covers the 40 listed nationalities and reciprocal Singapore and Seychelles travelers. The published 30-day tourist visa is obtained through ETA. Cite the current notice rather than imply a visa exemption or rely on a generic visa-on-arrival label.", ["https://www.immigration.gov.lk/pages_e.php?id=60", "https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US"]],
    ["MV", "Reviewed entry guidance", "Audit finding. Sri Lanka lists a no-fee 90-day tourist visa for Maldivians, obtained through the ETA system.", ["https://www.eta.gov.lk/slvisa/"]],
    ["KN TG TZ UG", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the arrival route or residency condition, current fee. Confirm whether this passport can use advance ETA, an arrival channel, or needs special clearance. Check the fee for the actual channel.", ["https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US"]],
    ["AL AO BB CF DZ LC LY MD RO SI SM ST TD TT UA", "Confirm entry details", "Confirm which visa or electronic authorization applies. Confirm whether this passport can use advance ETA, an arrival channel, or needs special clearance. Check the fee for the actual channel.", ["https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US"]],
    ["BOC BOTC PS", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the exact travel document. Confirm whether this passport can use advance ETA, an arrival channel, or needs special clearance. Check the fee for the actual channel.", ["https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US"]],
    ["AG BF BJ BT CG CR CV DJ DM DO ET FJ FM GN GQ GW HT KE KG KI LI LR LS MH ML MR MW NR RW SB SL SZ TJ TO TV UZ VU WS ZM", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, current fee. Confirm whether this passport can use advance ETA, an arrival channel, or needs special clearance. Check the fee for the actual channel.", ["https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US"]],
    ["BD", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the current fee. Confirm whether this passport can use advance ETA, an arrival channel, or needs special clearance. Check the fee for the actual channel.", ["https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US"]],
    ["BW", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the effective date. Confirm whether this passport can use advance ETA, an arrival channel, or needs special clearance. Check the fee for the actual channel.", ["https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US"]],
    ["AF AM AR AZ BG BN BO BR CD CL CO CU CY EG ER GD GR GY HK HR HU JO KH KM LB LT LV MA MG MN MX MZ NA NE PE PG PH PW RS SD SK SO SR TL TM TN VA VC VN YE ZA ZW", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm whether this passport can use advance ETA, an arrival channel, or needs special clearance. Check the fee for the actual channel.", ["https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US"]],
    ["KP", "Confirm entry details", "Confirm the scope of the reported restriction. Confirm whether this passport can use advance ETA, an arrival channel, or needs special clearance. Check the fee for the actual channel.", ["https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US"]],
    ["XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Confirm whether this passport can use advance ETA, an arrival channel, or needs special clearance. Check the fee for the actual channel.", ["https://www.eta.gov.lk/slvisa/visainfo/fees.jsp?locale=en_US"]],
  ],
  "LR": [
    ["AU CA EE LU MD MY NZ UA", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Liberia publishes a visa-on-arrival processing route with eligibility and application conditions. Ask Immigration whether this passport qualifies, whether approval is needed in advance and how to apply.", ["https://lis.gov.lr/img/SERVICE_DELIVERY_CHARTER.pdf"]],
    ["TT", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the effective date. Liberia publishes a visa-on-arrival processing route with eligibility and application conditions. Ask Immigration whether this passport qualifies, whether approval is needed in advance and how to apply.", ["https://lis.gov.lr/img/SERVICE_DELIVERY_CHARTER.pdf"]],
    ["AE AF AL AM AR AZ BO BR BY CH CL CO CU EC EG GD ID IL IN IR KP KR KZ LB LK LV LY MG MN MV MX MZ NP OM PE PG PH PK PL PW RS RU SD SG TH TN TR VA VN", "Confirm entry details", "Confirm which visa, waiver or permit applies. Liberia publishes a visa-on-arrival processing route with eligibility and application conditions. Ask Immigration whether this passport qualifies, whether approval is needed in advance and how to apply.", ["https://lis.gov.lr/img/SERVICE_DELIVERY_CHARTER.pdf"]],
  ],
  "LY": [
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Libya and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["EG TR", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Libya and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["PK", "Confirm entry details", "Confirm the scope of the reported restriction. Ask the consular mission serving your place of residence for the document requirements for Libya and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "MA": [
    ["CG GH GN ML", "Confirm entry details", "Confirm which visa or electronic authorization applies. Ask the consular mission serving your place of residence for the document requirements for Morocco and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["EC", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Morocco and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "ME": [
    ["XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the consular mission serving your place of residence for the document requirements for Montenegro and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "MG": [
    ["HK", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Madagascar and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "MK": [
    ["XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the consular mission serving your place of residence for the document requirements for North Macedonia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "ML": [
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Mali and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "MN": [
    ["CY", "Confirm entry details", "Confirm which entry route and paperwork apply and check the arrival route or residency condition, effective date. Ask the consular mission serving your place of residence for the document requirements for Mongolia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "MP": [
    ["CL CZ QA", "Confirm entry details", "Confirm which visa or electronic authorization applies. Confirm the U.S. or territory-specific entry route, including any separate waiver and transit rules. Check the actual island and routing with CBP.", ["https://www.cbp.gov/travel/international-visitors"]],
    ["VE", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm the U.S. or territory-specific entry route, including any separate waiver and transit rules. Check the actual island and routing with CBP.", ["https://www.cbp.gov/travel/international-visitors"]],
  ],
  "MV": [
    ["AL BG BN BNO BOC BOTC DO ES FR HK HU KH KR MD MO MY PH PT RS SG TH XK", "Reviewed entry guidance", "Audit finding. Maldives Immigration publishes tourist visa on arrival subject to its conditions and a separate online Traveller Declaration due within 96 hours before arrival.", ["https://www.immigration.gov.mv/visa/tourist-visa"]],
  ],
  "MX": [
    ["US", "Reviewed entry guidance", "Audit finding. Mexico publishes FMM procedures and the U.S. advisory distinguishes air processing from land entry. Refer travelers to Mexico’s INM by route for current document and fee instructions, particularly for short border-zone stays.", ["https://inm.gob.mx/fmme/publico/en/solicitud.html", "https://embamex.sre.gob.mx/eua/index.php/en/tourism/1601-3-know-before-you-go", "https://travel.state.gov/en/international-travel/travel-advisories/mexico.html"]],
    ["UA", "Confirm entry details", "Confirm which visa or electronic authorization applies. Check the exact passport and route with a Mexican consular mission. Distinguish the visitor visa, any document-based exemption and INM entry paperwork.", ["https://www.gob.mx/sre"]],
    ["RU", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Check the exact passport and route with a Mexican consular mission. Distinguish the visitor visa, any document-based exemption and INM entry paperwork.", ["https://www.gob.mx/sre"]],
    ["TR", "Confirm entry details", "Confirm which visa, waiver or permit applies. Check the exact passport and route with a Mexican consular mission. Distinguish the visitor visa, any document-based exemption and INM entry paperwork.", ["https://www.gob.mx/sre"]],
  ],
  "MY": [
    ["IL", "Confirm entry details", "Confirm the scope of the reported restriction and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Malaysia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "MZ": [
    ["AE CA CH DE ID IL JP KR RU SG US", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the current fee. Check whether the passport is visa-exempt, eligible for online authorization or needs a visa. Confirm the route and any prior registration.", ["https://evisa.gov.mz/"]],
    ["CN UA", "Confirm entry details", "Confirm which visa or electronic authorization applies. Check whether the passport is visa-exempt, eligible for online authorization or needs a visa. Confirm the route and any prior registration.", ["https://evisa.gov.mz/"]],
    ["HK", "Confirm entry details", "Confirm which visa, waiver or permit applies. Check whether the passport is visa-exempt, eligible for online authorization or needs a visa. Confirm the route and any prior registration.", ["https://evisa.gov.mz/"]],
  ],
  "NA": [
    ["LT", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Namibia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["PS", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the consular mission serving your place of residence for the document requirements for Namibia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "NC": [
    ["CN", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for New Caledonia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "NE": [
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Niger and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "NF": [
    ["IT JP KR NO US", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the arrival route or residency condition. Check whether the itinerary is domestic or international, the Australian immigration rules and any local island restrictions.", ["https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia"]],
    ["JO", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the effective date. Check whether the itinerary is domestic or international, the Australian immigration rules and any local island restrictions.", ["https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia"]],
    ["IL", "Confirm entry details", "Confirm which visa, waiver or permit applies. Check whether the itinerary is domestic or international, the Australian immigration rules and any local island restrictions.", ["https://immi.homeaffairs.gov.au/entering-and-leaving-australia/entering-australia"]],
  ],
  "NG": [
    ["SG", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Nigeria and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "NO": [
    ["RU", "Confirm entry details", "Confirm the scope of the reported restriction and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Norway and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "NU": [
    ["GB", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Niue and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "NZ": [
    ["AD AE AR AT BE BG BH BN BNO BR CA CH CL CY CZ DE DK EE ES FI FR GB GR HR HU IE IL IS IT JP KR LI LT LU LV MC MO MT MU MX MY NL NO OM PL PT QA RO SA SC SE SG SI SK SM TW US UY VA", "Reviewed entry guidance", "Audit finding. The listed visitor waiver route generally requires an NZeTA before travel. Keep the authority’s citizenship, residency and passport conditions. Hong Kong residents using HKSAR or BN(O) passports qualify under the listed Hong Kong route. Taiwan requires permanent residency and a Taiwan passport. Estonia, Latvia and Lithuania are citizens-only. Portugal and the UK have permanent-residence-right conditions, Macao has document and residency conditions, and Greece has a passport issue-date condition.", ["https://www.immigration.govt.nz/visit/what-you-need-to-visit-new-zealand/visa-waiver-countries-and-territories/"]],
    ["AF", "Confirm entry details", "Confirm the scope of the reported restriction and check the exact travel document, arrival route or residency condition. Do not treat the imported admission restriction as a blanket ban. Ask Immigration New Zealand about document recognition and applicable visa routes.", ["https://www.immigration.govt.nz/process-to-apply/once-you-have-a-visa/manage-your-visa-and-passport/passports-we-do-not-recognise/"]],
    ["SO", "Confirm entry details", "Confirm the scope of the reported restriction. Do not treat the imported admission restriction as a blanket ban. Ask Immigration New Zealand about document recognition and applicable visa routes.", ["https://www.immigration.govt.nz/process-to-apply/once-you-have-a-visa/manage-your-visa-and-passport/passports-we-do-not-recognise/"]],
  ],
  "OM": [
    ["AM AR AT AU BE BN BO BR CA CH CL CN CO CZ DE DK EC FI FR GB ID IE IR IS IT JP KR LB LU MD MK MY NL NO NZ PH PY RS SE SG SM TH UA US UY VE ZA", "Reviewed entry guidance", "Audit finding. Oman lists these nationalities in its first group for a stay up to 14 days, subject to its passport, booking, insurance and other conditions. Oman also announced a separate no-fee 14-day tourist visa category. Confirm the route for this passport with Royal Oman Police.", ["https://www.fm.gov.om/en/visitors/entry-visas/", "https://www.fm.gov.om/en/52262/", "https://evisa.rop.gov.om/visa-eligibility"]],
    ["BNO TW", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask Royal Oman Police which short-stay arrangement or visa applies to this exact travel document. Do not infer that a UK-associated passport or a Taiwan passport inherits a listed nationality’s route.", ["https://evisa.rop.gov.om/visa-eligibility"]],
  ],
  "PF": [
    ["CN", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for French Polynesia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "PG": [
    ["AG BB BW BZ DM FJ GD GY KN LC LS MU MX NZ SC TT VC", "Reviewed entry guidance", "Audit finding. Papua New Guinea Immigration lists this passport for the 30-day Easy Visitor Permit. Some listed passports also have a 60-day route. Use the official class and fee instructions for the travel date.", ["https://evisa.ica.gov.pg/evisa/evisa/visaclass"]],
    ["BE CH CZ DK FI FR GE HR ID IS JM NO PY RW SI SK UY ZM", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Confirm whether the actual passport qualifies for the 30- or 60-day Easy Visitor Permit, visa on arrival, or a separate visitor route.", ["https://evisa.ica.gov.pg/evisa/evisa/visaclass"]],
    ["SM VA", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm whether the actual passport qualifies for the 30- or 60-day Easy Visitor Permit, visa on arrival, or a separate visitor route.", ["https://evisa.ica.gov.pg/evisa/evisa/visaclass"]],
  ],
  "PH": [
    ["KR", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, effective date. Ask the consular mission serving your place of residence for the document requirements for Philippines and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["IN JP", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Philippines and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["CN", "Confirm entry details", "Confirm which entry route and paperwork apply and check the arrival route or residency condition, effective date. Ask the consular mission serving your place of residence for the document requirements for Philippines and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "PK": [
    ["AO BB BS BW CR GH GM LC MC RW TT TZ", "Confirm entry details", "Confirm which visa or electronic authorization applies. Ask the Pakistan visa authority which visitor category applies to the exact passport and whether advance clearance is needed.", ["https://visa.nadra.gov.pk/"]],
    ["IN", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Ask the Pakistan visa authority which visitor category applies to the exact passport and whether advance clearance is needed.", ["https://visa.nadra.gov.pk/"]],
    ["BN CN IQ KH MM SS", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the Pakistan visa authority which visitor category applies to the exact passport and whether advance clearance is needed.", ["https://visa.nadra.gov.pk/"]],
    ["BNO", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the Pakistan visa authority which visitor category applies to the exact passport and whether advance clearance is needed.", ["https://visa.nadra.gov.pk/"]],
    ["IL", "Confirm entry details", "Confirm the scope of the reported restriction. Ask the Pakistan visa authority which visitor category applies to the exact passport and whether advance clearance is needed.", ["https://visa.nadra.gov.pk/"]],
  ],
  "PR": [
    ["AU CL CZ DE GB IL JP KR NZ QA SG", "Confirm entry details", "Confirm which visa or electronic authorization applies. Confirm the U.S. or territory-specific entry route, including any separate waiver and transit rules. Check the actual island and routing with CBP.", ["https://www.cbp.gov/travel/international-visitors"]],
    ["BN", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm the U.S. or territory-specific entry route, including any separate waiver and transit rules. Check the actual island and routing with CBP.", ["https://www.cbp.gov/travel/international-visitors"]],
  ],
  "PT": [
    ["TW", "Confirm entry details", "Confirm which entry route and paperwork apply and check the exact travel document, arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Portugal and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "RE": [
    ["CN", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Réunion and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "RS": [
    ["TW", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Serbia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the consular mission serving your place of residence for the document requirements for Serbia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "RU": [
    ["KR", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the effective date. Confirm ordinary visa or waiver separately from the unified e-visa, permitted checkpoints and any applicable digital registration or other pre-entry step.", ["https://evisa.kdmid.ru/"]],
    ["PL", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Confirm ordinary visa or waiver separately from the unified e-visa, permitted checkpoints and any applicable digital registration or other pre-entry step.", ["https://evisa.kdmid.ru/"]],
    ["UA", "Confirm entry details", "Confirm the scope of the reported restriction and check the arrival route or residency condition. Confirm ordinary visa or waiver separately from the unified e-visa, permitted checkpoints and any applicable digital registration or other pre-entry step.", ["https://evisa.kdmid.ru/"]],
    ["AL AT AU BG BZ CZ DO ES FR GD HU IR IT JM JP KH KW MD MK MO MV MY NO NZ PH PT RO RS SG SK SV TH TT ZA", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm ordinary visa or waiver separately from the unified e-visa, permitted checkpoints and any applicable digital registration or other pre-entry step.", ["https://evisa.kdmid.ru/"]],
    ["BNO BOC BOTC", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Confirm ordinary visa or waiver separately from the unified e-visa, permitted checkpoints and any applicable digital registration or other pre-entry step.", ["https://evisa.kdmid.ru/"]],
  ],
  "RW": [
    ["HK", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Rwanda and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "SA": [
    ["GB", "Confirm entry details", "Confirm which visa or electronic authorization applies. Ask the consular mission serving your place of residence for the document requirements for Saudi Arabia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["IL", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Saudi Arabia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "SB": [
    ["AG KW LC MV PW WS", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Solomon Islands and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "SC": [
    ["AE AF AL AM AR AT AU AZ BD BG BN BO BY CA CD CH CL CO CU CY DK DZ EC EG ES GA GB GE GR GT GY HK HN HR HU ID IL IN IQ IR IT JO JP KR KZ LA LB LK MA MD ME MG MK MM MN MT MV MX MY NA NP NZ OM PA PE PG PH PK PT PW PY QA RO RS RU SA SG SR SV SY TH TL TM TN TR UA US UY UZ VE VN YE ZA", "Reviewed entry guidance", "Audit finding. Seychelles publishes predeparture Travel Authorisation and a visitor permit issued on arrival subject to admission conditions. Use the authority’s process and confirm travel-document recognition.", ["https://ics.gov.sc/permits/visitors-permit", "https://mfa.gov.sc/travelling-to-seychelles/"]],
    ["KP", "Confirm entry details", "Confirm which entry route and paperwork apply and check the effective date, current fee. Confirm that Seychelles recognizes the actual document and that the Travel Authorisation and visitor permit route applies.", ["https://ics.gov.sc/permits/visitors-permit"]],
    ["TW XK", "Confirm entry details", "Confirm which entry route and paperwork apply and check the exact travel document, effective date, current fee. Confirm that Seychelles recognizes the actual document and that the Travel Authorisation and visitor permit route applies.", ["https://ics.gov.sc/permits/visitors-permit"]],
  ],
  "SD": [
    ["AL AT BG BN CZ DO ES FR HK HU KH MD MO MY PH PL PT RO RS SG SK TH", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Confirm the intended crossing, visa and any additional permits with the competent authority. Use the linked travel advisory for context.", ["https://www.gov.uk/foreign-travel-advice/sudan"]],
    ["BNO BOC BOTC XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition. Confirm the intended crossing, visa and any additional permits with the competent authority. Use the linked travel advisory for context.", ["https://www.gov.uk/foreign-travel-advice/sudan"]],
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Confirm the intended crossing, visa and any additional permits with the competent authority. Use the linked travel advisory for context.", ["https://www.gov.uk/foreign-travel-advice/sudan"]],
    ["EG", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm the intended crossing, visa and any additional permits with the competent authority. Use the linked travel advisory for context.", ["https://www.gov.uk/foreign-travel-advice/sudan"]],
  ],
  "SG": [
    ["RU", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Singapore and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "SH": [
    ["AG AT AU BB BG BN BS BW BZ CZ DM ES FM FR GB GT HK HU IT KI KN LC MH MO NA NO NR NZ PL PT RO SB SC SK SV TO TT TV VC VU WS XK ZA", "Reviewed entry guidance", "Audit finding. St Helena publishes landing permission for visits up to 24 hours and a short-term entry permit route for other eligible visitors staying up to 183 days. Confirm any separate visa, exemptions and arrival procedure with St Helena Immigration.", ["https://www.sainthelena.gov.sh/st-helena/entry-requirements/"]],
  ],
  "SJ": [
    ["XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the consular mission serving your place of residence for the document requirements for Svalbard and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "SM": [
    ["FJ PK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for San Marino and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "SO": [
    ["KW", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Somalia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["BW", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Somalia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction. Ask the consular mission serving your place of residence for the document requirements for Somalia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "SR": [
    ["CR DO EE HN LI LT LV NI", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Suriname and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["HT", "Confirm entry details", "Confirm the scope of the reported restriction and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Suriname and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "SV": [
    ["MD", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for El Salvador and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "SY": [
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Syria and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["IL", "Confirm entry details", "Confirm the scope of the reported restriction. Ask the consular mission serving your place of residence for the document requirements for Syria and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["IR", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Syria and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "TD": [
    ["US", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Chad and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "TF": [
    ["IL", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Identify the specific French Southern or Antarctic territory and ask its administration about access permission for the intended activity.", ["https://taaf.fr/"]],
    ["AR DE FR", "Confirm entry details", "Confirm which visa, waiver or permit applies. Identify the specific French Southern or Antarctic territory and ask its administration about access permission for the intended activity.", ["https://taaf.fr/"]],
  ],
  "TJ": [
    ["JP", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, current fee. Ask the Tajik authority about the waiver or e-visa for this passport and whether the itinerary needs an additional regional permit.", ["https://www.evisa.tj/"]],
    ["CA LB QA", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the Tajik authority about the waiver or e-visa for this passport and whether the itinerary needs an additional regional permit.", ["https://www.evisa.tj/"]],
    ["IR", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the current fee. Ask the Tajik authority about the waiver or e-visa for this passport and whether the itinerary needs an additional regional permit.", ["https://www.evisa.tj/"]],
    ["AE AL AR AU BR CH CL CN ID KR MA MG MN MV MX NZ RS SA SG TH TN US VN", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the Tajik authority about the waiver or e-visa for this passport and whether the itinerary needs an additional regional permit.", ["https://www.evisa.tj/"]],
  ],
  "TK": [
    ["AL AR AT BA BG BY CH CL CN CZ DE ES GB GT HU IE IT JO JP LB MD ME MK NO PL PT RO RS SK UA US UY VN", "Reviewed entry guidance", "Audit finding. Tokelau directs foreign visitors to obtain an entry permit. Check the transit requirements for the itinerary separately.", ["https://www.tokelau.org.nz/Tokelau%2BGovernment/Government%2BDepartments/BDM%2BCertificates.html"]],
  ],
  "TM": [
    ["AL AT BG HU JP KR MY RO RS SG", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, current fee. Check the applicable visa, invitation, crossing and any restricted-area permission with Turkmen immigration or a consular mission.", ["https://migration.gov.tm/en/"]],
    ["BN CZ ES FR IT KH MD NO PL PT SK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Check the applicable visa, invitation, crossing and any restricted-area permission with Turkmen immigration or a consular mission.", ["https://migration.gov.tm/en/"]],
    ["BNO BOC BOTC", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition. Check the applicable visa, invitation, crossing and any restricted-area permission with Turkmen immigration or a consular mission.", ["https://migration.gov.tm/en/"]],
  ],
  "TN": [
    ["AM AZ EG GE IN RS", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Tunisia and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "TR": [
    ["MX", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the current fee. Ask the consular mission serving your place of residence for the document requirements for Türkiye and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["LY", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Türkiye and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "TW": [
    ["BNO", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition, effective date, current fee. Ask the consular mission serving your place of residence for the document requirements for Taiwan and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["BH", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Taiwan and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "UA": [
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Ukraine and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["ML", "Confirm entry details", "Confirm the scope of the reported restriction. Ask the consular mission serving your place of residence for the document requirements for Ukraine and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["MN", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Ukraine and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "UM": [
    ["AF IE", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Identify the exact island and administering agency. U.S. Fish and Wildlife describes different access rules across sites. Confirm permission before planning a landing.", ["https://www.fws.gov/office/pacific-islands-refuges-and-monuments/visit-us"]],
    ["BNO BOC BOTC", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition. Identify the exact island and administering agency. U.S. Fish and Wildlife describes different access rules across sites. Confirm permission before planning a landing.", ["https://www.fws.gov/office/pacific-islands-refuges-and-monuments/visit-us"]],
    ["AL AR AT AU BG BH BN BY BZ CZ DE DO ES FR GB GD HK HU IT JM JO JP KH KR KW LB MD MO MV MY NO NZ PH PL PT RO RS SG SK SV TH TT VN ZA", "Confirm entry details", "Confirm which visa, waiver or permit applies. Identify the exact island and administering agency. U.S. Fish and Wildlife describes different access rules across sites. Confirm permission before planning a landing.", ["https://www.fws.gov/office/pacific-islands-refuges-and-monuments/visit-us"]],
    ["TW XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Identify the exact island and administering agency. U.S. Fish and Wildlife describes different access rules across sites. Confirm permission before planning a landing.", ["https://www.fws.gov/office/pacific-islands-refuges-and-monuments/visit-us"]],
  ],
  "US": [
    ["AT AU BE CH CL CZ DE DK ES FI FR GB GR HR HU IE IL IS IT JP KR LU MT NL NO NZ PL PT QA SE SG TW", "Reviewed entry guidance", "Audit finding. This passport nationality is on the U.S. Visa Waiver Program list. Eligible trips require ESTA approval, and passport, trip and travel-history conditions apply. The UK listing is restricted to qualifying British citizens, and Taiwan passports must include the personal identification number.", ["https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visa-waiver-program.html"]],
    ["CA", "Reviewed entry guidance", "Audit finding. The State Department says Canadian citizens generally do not need a nonimmigrant visa for tourism. Confirm any separate requirements for the chosen purpose and route.", ["https://travel.state.gov/content/travel/en/us-visas/tourism-visit.html"]],
    ["AF", "Confirm entry details", "Confirm the scope of the reported restriction and check the exact travel document, effective date. Confirm whether visa issuance or entry restrictions apply to the passport and visa class. Ask about the travel date, existing visa and any applicable exception.", ["https://travel.state.gov/en/newsroom/visas/2026/suspension-of-visa-issuance-to-foreign-nationals-to-protect-the-security-of-the-united-states.html"]],
    ["BI CU GQ HT LA LY ML SL SO TG VE YE", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Confirm whether visa issuance or entry restrictions apply to the passport and visa class. Ask about the travel date, existing visa and any applicable exception.", ["https://travel.state.gov/en/newsroom/visas/2026/suspension-of-visa-issuance-to-foreign-nationals-to-protect-the-security-of-the-united-states.html"]],
    ["BS PW", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm whether visa issuance or entry restrictions apply to the passport and visa class. Ask about the travel date, existing visa and any applicable exception.", ["https://travel.state.gov/en/newsroom/visas/2026/suspension-of-visa-issuance-to-foreign-nationals-to-protect-the-security-of-the-united-states.html"]],
  ],
  "UZ": [
    ["VN", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Uzbekistan and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "VA": [
    ["BW", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the consular mission serving your place of residence for the document requirements for Vatican City and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
    ["BZ", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Vatican City and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "VI": [
    ["AU CL CZ DE GB JP KR NZ QA SG", "Confirm entry details", "Confirm which visa or electronic authorization applies. Confirm the U.S. or territory-specific entry route, including any separate waiver and transit rules. Check the actual island and routing with CBP.", ["https://www.cbp.gov/travel/international-visitors"]],
    ["BN", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm the U.S. or territory-specific entry route, including any separate waiver and transit rules. Check the actual island and routing with CBP.", ["https://www.cbp.gov/travel/international-visitors"]],
  ],
  "VN": [
    ["CZ", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the effective date. Ask the consular mission serving your place of residence for the document requirements for Vietnam and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "X-ABK": [
    ["MD MO UA", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Verify the legal approach, entry permissions and safety conditions with Georgian authorities. The linked advisory gives regional context.", ["https://travel.state.gov/en/international-travel/travel-advisories/georgia.html"]],
  ],
  "X-ASH": [
    ["VN", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Check the precise marine park zone, landing and activity with Parks Australia before departure.", ["https://parksaustralia.gov.au/"]],
    ["AF AL AR AT BG BH BN BY CH CL CZ DE DO ES FR GB GT HK HU IE IT JO JP KH KR LB MD MO MY NO PH PL PT RO RS SG SK TH UA US UY", "Confirm entry details", "Confirm which visa, waiver or permit applies. Check the precise marine park zone, landing and activity with Parks Australia before departure.", ["https://parksaustralia.gov.au/"]],
    ["BNO BOC BOTC XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Check the precise marine park zone, landing and activity with Parks Australia before departure.", ["https://parksaustralia.gov.au/"]],
  ],
  "X-ATH": [
    ["AF AL AT BN CZ GB JP KR LB MY NZ PL SG VN", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, current fee. Ask the Greek consulate and Mount Athos Pilgrims’ Bureau about admission eligibility, the visitor permit and availability for the proposed date.", ["https://www.mfa.gr/en/"]],
    ["AU BG BH BY BZ DO ES FR GD HK HU IE IT JM JO KH KW MD MO MV NO PH PT RO RS SK SV TH TT US ZA", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the Greek consulate and Mount Athos Pilgrims’ Bureau about admission eligibility, the visitor permit and availability for the proposed date.", ["https://www.mfa.gr/en/"]],
    ["BNO BOC BOTC XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition. Ask the Greek consulate and Mount Athos Pilgrims’ Bureau about admission eligibility, the visitor permit and availability for the proposed date.", ["https://www.mfa.gr/en/"]],
  ],
  "X-CBZ": [
    ["AF AL AT AU BG BH BN BZ CZ DO ES FR GB GD HK HR HU IT JM JO JP KH KR KW LB MD MO MV MY NO NZ PH PL PT RO RS SK SV TH TT VN ZA", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Confirm whether the itinerary uses an authorized crossing or enters the buffer zone itself. Ask UNFICYP about the applicable access process.", ["https://unficyp.unmissions.org/en/unficyp-buffer-zone-permits"]],
    ["BNO BOC BOTC XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition. Confirm whether the itinerary uses an authorized crossing or enters the buffer zone itself. Ask UNFICYP about the applicable access process.", ["https://unficyp.unmissions.org/en/unficyp-buffer-zone-permits"]],
  ],
  "X-CLP": [
    ["AE AF AL AR AT AU BG BH BN BNO BOC BOTC BZ CL CN CZ DE DO ES GB GD GT HK HU IE IT JM JO JP KH KR KW LB MO MV MY NO NZ PH PL PT QA RO RS SG SK SV TH TT UA US UY ZA", "Reviewed entry guidance", "Audit finding. French rules require an application for anchoring, disembarking, landing by aircraft or staying on Clipperton. Check current authorizations and exceptions before organizing a visit.", ["https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000052501317"]],
  ],
  "X-DMZ": [
    ["AL AT AU BG BH BN BY BZ CZ DO ES FR GB GD HK HU IT JM JO JP KH KW LB MD MO MV MY NO NZ PH PL PT RO RS SG SK SV TH TT VN ZA", "Confirm entry details", "Confirm the scope of the reported restriction. Check whether visits at the proposed site are operating and whether an operator can arrange access for the actual passport. Local access can differ from Korea entry rules.", ["https://www.gov.uk/foreign-travel-advice/south-korea"]],
    ["BNO BOC BOTC XK", "Confirm entry details", "Confirm the scope of the reported restriction and check the exact travel document. Check whether visits at the proposed site are operating and whether an operator can arrange access for the actual passport. Local access can differ from Korea entry rules.", ["https://www.gov.uk/foreign-travel-advice/south-korea"]],
    ["HR IE KR", "Confirm entry details", "Confirm which visa, waiver or permit applies. Check whether visits at the proposed site are operating and whether an operator can arrange access for the actual passport. Local access can differ from Korea entry rules.", ["https://www.gov.uk/foreign-travel-advice/south-korea"]],
  ],
  "X-GAL": [
    ["AE AM AR AT AU AZ BO BY CH CL CZ DE FR GB IL JP KR KZ LB MG MY MZ NZ OM PH PL PW QA RO RS SA SG SK TN US VN", "Reviewed entry guidance", "Audit finding. Galápagos National Park publishes the Transit Control Card procedure for visitors traveling via Quito or Guayaquil. Confirm Ecuador entry and the island process separately.", ["https://galapagos.gob.ec/informacion-de-interes-para-la-llegada-a-las-islas/"]],
  ],
  "X-JAN": [
    ["AE AF AL AR AT AU BG BN BNO BOC BOTC BY BZ CL CN CZ DE DO ES FR GB GD GT HK HU IE IT JM JO JP KH KR KW LB MD MO MV MY NZ PH PL PT QA RO RS SG SK SV TH TT UA US UY VN ZA", "Reviewed entry guidance", "Audit finding. The station guidance requires advance Norwegian permission for foreign visitors and publishes the contacts by planned visit duration.", ["https://jan-mayen.no/nyheter/guidelines-for-ship-calls-and-visitors-to-jan-mayen-2023/"]],
  ],
  "X-KUR": [
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction. Confirm whether the route enters through the Kurdistan Region or federal Iraq and which visa is recognized across the full itinerary.", ["https://www.gov.uk/foreign-travel-advice/iraq/entry-requirements"]],
    ["NO", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm whether the route enters through the Kurdistan Region or federal Iraq and which visa is recognized across the full itinerary.", ["https://www.gov.uk/foreign-travel-advice/iraq/entry-requirements"]],
  ],
  "X-PAP": [
    ["AF AL AT AU BG BH BN BNO BOC BOTC BZ CL CZ ES FR GB GD GT HK HU IE IT JM JO JP KH KR KW LB MD MO MV MY NO NZ PH PL PT RO RS SG SK SV TH TT UY VN XK ZA", "Reviewed entry guidance", "Audit finding. India publishes protected and restricted area permit rules. Confirm the exact site or route, current exemptions and any nationality or origin conditions before travel.", ["https://www.mha.gov.in/sites/default/files/2025-09/4merged_16092025.pdf"]],
  ],
  "X-SAL": [
    ["VN", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the current fee. Ask Colombian authorities about route-specific registration or arrival controls for the named destination and trip. Confirm Colombian entry separately.", ["https://www.migracioncolombia.gov.co/"]],
  ],
  "X-SHT": [
    ["BNO", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Check the island individually. St Helena, Ascension and Tristan da Cunha publish distinct procedures.", ["https://www.gov.uk/foreign-travel-advice/st-helena-ascension-and-tristan-da-cunha/entry-requirements"]],
  ],
  "X-SOM": [
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction and check the effective date. Check the exact entry point and travel document with the authority operating the border. Consult the linked advisory for regional context.", ["https://www.gov.uk/foreign-travel-advice/somalia"]],
  ],
  "X-SOS": [
    ["AT CZ FR PL RO SK UA", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Verify the legal approach, entry permissions and safety conditions with Georgian authorities. The linked advisory gives regional context.", ["https://travel.state.gov/en/international-travel/travel-advisories/georgia.html"]],
    ["MD", "Confirm entry details", "Confirm which visa, waiver or permit applies. Verify the legal approach, entry permissions and safety conditions with Georgian authorities. The linked advisory gives regional context.", ["https://travel.state.gov/en/international-travel/travel-advisories/georgia.html"]],
  ],
  "X-TDC": [
    ["AE AG AL AO AR AT AU BB BF BG BI BJ BN BOC BOTC BS BW BY BZ CD CF CG CI CL CM CN CV CZ DE DJ DM DO DZ EG ER ES ET FJ FM FR GA GB GD GE GH GM GN GQ GT GW HK HU ID IE IL IQ IT JM JO JP KE KG KH KI KM KN KR KW KZ LB LC LR LS LY MA MD MG MH ML MO MR MU MV MW MY MZ NA NE NG NO NR NZ PG PH PL PT PW QA RO RS RW SB SC SD SG SK SL SM SN SO SS ST SV SZ TD TG TH TL TN TO TT TV TW TZ UA UG US VC VN VU WS ZA ZM ZW", "Reviewed entry guidance", "Audit finding. Travel to Tristan da Cunha requires advance Island Council permission. Travelers should contact the Administration Office to confirm the proposed itinerary, documents and conditions.", ["https://www.tristandc.com/visitsorganise.php"]],
  ],
  "X-TIB": [
    ["AF AU BY GB IE JP KR LB MD MV NZ RS VN ZA", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition, current fee. Check the Tibet-specific permit, any China visa and itinerary restrictions with the Chinese mission and tour operator. The linked U.S. guidance describes the separate permit.", ["https://travel.state.gov/en/international-travel/planning/safety-tips/kora-pilgrimage-to-mount-kailash.html"]],
    ["AL AT BG BH BN BZ CL CZ DO ES FR GD GT HU IR IT JM JO KH KW MY NO PL PT RO SG SK SV TT US UY", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Check the Tibet-specific permit, any China visa and itinerary restrictions with the Chinese mission and tour operator. The linked U.S. guidance describes the separate permit.", ["https://travel.state.gov/en/international-travel/planning/safety-tips/kora-pilgrimage-to-mount-kailash.html"]],
    ["XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition. Check the Tibet-specific permit, any China visa and itinerary restrictions with the Chinese mission and tour operator. The linked U.S. guidance describes the separate permit.", ["https://travel.state.gov/en/international-travel/planning/safety-tips/kora-pilgrimage-to-mount-kailash.html"]],
  ],
  "X-TRN": [
    ["UA", "Confirm entry details", "Confirm the scope of the reported restriction and check the arrival route or residency condition. Confirm how the route affects Moldova entry and any local controls. Consult Moldovan officials and the linked regional travel advisory.", ["https://www.gov.uk/foreign-travel-advice/moldova/regional-risks"]],
    ["XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Confirm how the route affects Moldova entry and any local controls. Consult Moldovan officials and the linked regional travel advisory.", ["https://www.gov.uk/foreign-travel-advice/moldova/regional-risks"]],
  ],
  "X-UND": [
    ["AF AL AT AU BG BH BN BY BZ CZ DO ES FR GB GD HK HU IT JM JO JP KH KR KW LB MD MO MV MY NO NZ PH PL PT RO RS SG SK SV TH TT VN ZA", "Confirm entry details", "Confirm the scope of the reported restriction. Confirm civilian access and the actual checkpoint with the authority controlling the intended approach. The UN mission explains the area of separation and its role.", ["https://undof.unmissions.org/en/undof-mandate"]],
    ["BNO BOC BOTC XK", "Confirm entry details", "Confirm the scope of the reported restriction and check the exact travel document. Confirm civilian access and the actual checkpoint with the authority controlling the intended approach. The UN mission explains the area of separation and its role.", ["https://undof.unmissions.org/en/undof-mandate"]],
    ["HR IE", "Confirm entry details", "Confirm which visa, waiver or permit applies. Confirm civilian access and the actual checkpoint with the authority controlling the intended approach. The UN mission explains the area of separation and its role.", ["https://undof.unmissions.org/en/undof-mandate"]],
  ],
  "XK": [
    ["AL AM", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the consular mission serving your place of residence for the document requirements for Kosovo and your itinerary.", ["https://www.gov.uk/government/publications/foreign-embassies-in-the-uk"]],
  ],
  "YE": [
    ["KR", "Confirm entry details", "Confirm the scope of the reported restriction and check the arrival route or residency condition, effective date. Ask the competent authority about the exact visa, route, security conditions and local permits. Use the linked travel advisory for context.", ["https://www.gov.uk/foreign-travel-advice/yemen"]],
    ["AL AT BG HU MD MY PH RO RS SG TH", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. Ask the competent authority about the exact visa, route, security conditions and local permits. Use the linked travel advisory for context.", ["https://www.gov.uk/foreign-travel-advice/yemen"]],
    ["XK", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document, arrival route or residency condition. Ask the competent authority about the exact visa, route, security conditions and local permits. Use the linked travel advisory for context.", ["https://www.gov.uk/foreign-travel-advice/yemen"]],
    ["BN CZ DO ES FR HK KH MO PL PT SK", "Confirm entry details", "Confirm which visa, waiver or permit applies. Ask the competent authority about the exact visa, route, security conditions and local permits. Use the linked travel advisory for context.", ["https://www.gov.uk/foreign-travel-advice/yemen"]],
    ["BNO BOC BOTC", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the exact travel document. Ask the competent authority about the exact visa, route, security conditions and local permits. Use the linked travel advisory for context.", ["https://www.gov.uk/foreign-travel-advice/yemen"]],
    ["IL", "Confirm entry details", "Confirm the scope of the reported restriction. Ask the competent authority about the exact visa, route, security conditions and local permits. Use the linked travel advisory for context.", ["https://www.gov.uk/foreign-travel-advice/yemen"]],
  ],
  "ZA": [
    ["ID IN MD UA", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the arrival route or residency condition. The South African ETA portal limits eligible passports and ports. Confirm this exact passport and port before applying or relying on the imported label.", ["https://eta.dha.gov.za/registration-warning"]],
    ["AF AM AZ BH BI CG FJ FM HT KM LB MN NI SD SY TD TJ TM UZ VN YE", "Confirm entry details", "Confirm which visa or electronic authorization applies. The South African ETA portal limits eligible passports and ports. Confirm this exact passport and port before applying or relying on the imported label.", ["https://eta.dha.gov.za/registration-warning"]],
    ["PS", "Confirm entry details", "Confirm which visa or electronic authorization applies and check the exact travel document. The South African ETA portal limits eligible passports and ports. Confirm this exact passport and port before applying or relying on the imported label.", ["https://eta.dha.gov.za/registration-warning"]],
    ["CN MX", "Confirm entry details", "Confirm which visa, waiver or permit applies and check the arrival route or residency condition. The South African ETA portal limits eligible passports and ports. Confirm this exact passport and port before applying or relying on the imported label.", ["https://eta.dha.gov.za/registration-warning"]],
    ["AL DZ", "Confirm entry details", "Confirm which visa, waiver or permit applies. The South African ETA portal limits eligible passports and ports. Confirm this exact passport and port before applying or relying on the imported label.", ["https://eta.dha.gov.za/registration-warning"]],
  ],
};

export const auditFindings = Object.fromEntries(Object.entries(auditGroups).map(([destination, groups]) =>
  [destination, Object.fromEntries(groups.flatMap(([passports, heading, text, urls]) =>
    passports.split(' ').map(passport => [passport, { heading, text, url: urls[0], more: urls.slice(1) }])))]));
