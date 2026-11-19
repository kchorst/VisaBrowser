"""End-to-end acceptance for the v0.4.x mobile-first user journeys.

Runs in CI against the actual site JS and real Chromium, serving on the GitHub
Pages subpath. Test data is deterministic and intentionally independent of
Wikipedia network availability.
"""
from datetime import datetime
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from subprocess import check_output
from tempfile import TemporaryDirectory
from threading import Thread
import json
import os
import re
import shutil

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
STAMP = '2026-11-17T12:00:00+00:00'


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def add_traveler(page, name, passport, issuer=None):
    first = page.get_by_role('heading', name='Your first traveler').is_visible()
    if first:
        assert page.get_by_role('button', name='Add Another Traveler').count() == 0
        form = page.get_by_role('form', name='First traveler details')
        expect(form.get_by_label('Traveler name or initials')).to_be_visible()
        expect(form.get_by_label('Passport country')).to_be_visible()
        assert form.get_by_label('Traveler name or initials').is_editable()
    else:
        page.get_by_role('button', name='Add Another Traveler').click()
        form = page.get_by_role('dialog')
    form.get_by_label('Traveler name or initials').fill(name)
    form.get_by_label('Passport country').select_option(passport)
    if issuer:
        form.locator('.optional-documents summary').click()
        form.get_by_label('Issuing country or area').select_option(issuer)
        form.get_by_role('button', name='Add visa or permit').click()
    form.get_by_role('button', name='Save first traveler' if first else 'Save traveler').click()
    expect(page.get_by_role('heading', name='Travelers', exact=True)).to_be_visible()
    expect(page.get_by_role('button', name='Add Another Traveler')).to_be_visible()
    page.get_by_role('button', name='Continue').click()


def fixture(browser, base):
    sample = json.loads(check_output(
        ['node', '--input-type=module', '-e',
         "import {sample} from './tests/fixtures.js'; console.log(JSON.stringify(sample))"], cwd=ROOT))
    places = {'US': 'United States', 'RW': 'Rwanda', 'ZZ': 'Unsupported passport',
              **{code: f'Destination {code}' for code in ['A', 'B', 'C', 'D', 'E']},
              'AW': 'Aruba'}
    catalog = {'generated': STAMP, 'overdueDays': 14,
               'passports': ['US', 'RW', 'ZZ'],
               'homeCountries': ['US', 'RW'],
               'sources': {key: {'lastSuccess': STAMP} for key in sample},
               'destinations': [key for key in places if key not in ['US', 'RW', 'ZZ']]}
    context = browser.new_context(viewport={'width': 390, 'height': 844},
                                  is_mobile=True, has_touch=True, service_workers='block',
                                  permissions=['clipboard-read', 'clipboard-write'])
    context.route('**/data/index.json', lambda route: route.fulfill(json=catalog))
    context.route('**/data/places.json', lambda route: route.fulfill(json=places))
    for passport in ['US', 'RW']:
        context.route(f'**/data/passports/{passport}.json',
                      partial(lambda code, route: route.fulfill(json=sample[code]), passport))
    page = context.new_page()
    failures = []
    page.on('pageerror', lambda error: failures.append(str(error)))
    page.clock.set_fixed_time(datetime.fromisoformat(STAMP))
    page.goto(base)

    # First-time setup and the four focus actions.
    expect(page.get_by_role('heading', name='Your first traveler')).to_be_visible()
    add_traveler(page, 'Alex', 'US')
    expect(page.get_by_role('heading', name='Plan your trip')).to_be_visible()
    for action in ['View Country', 'Browse Countries', 'Check Group Req',
                   'Search Multiple', 'Saved Searches']:
        expect(page.get_by_role('button', name=action, exact=True)).to_be_visible()
    page.get_by_role('button', name='Edit travelers').click()
    add_traveler(page, 'Aline', 'RW', 'US')
    expect(page.get_by_role('heading', name='Plan your trip')).to_be_visible()
    expect(page.locator('.dashboard-actions button').first).to_have_text('Check Group Req')

    # Browse Countries (not only Group Req) starts with every category collapsed.
    page.get_by_role('button', name='Browse Countries').click()
    expect(page.locator('.country-section')).to_have_count(4)
    assert all(section.locator('.country-list').is_hidden()
               for section in page.locator('.country-section').all())
    page.get_by_label('Filter requirements').select_option('review')
    assert page.locator('.country-list li:visible').count() == 0
    page.get_by_role('button', name='Show countries').first.click()
    assert page.locator('.country-list li:visible').count() > 0
    page.get_by_role('button', name='Hide countries').click()
    assert page.locator('.country-list li:visible').count() == 0
    expect(page.get_by_role('button', name='Show countries')).to_have_attribute('aria-expanded', 'false')
    page.goto(base + '#home')

    # Title is a Home link; a new screen starts at the top rather than
    # inheriting the previous screen's scroll position.
    page.goto(base + '#countries')
    page.set_viewport_size({'width': 390, 'height': 440})
    page.get_by_label('Filter requirements').select_option('all')
    for toggle in page.locator('.country-section .country-toggle').all():
        toggle.click()
    page.evaluate('window.scrollTo(0, 900)')
    assert page.evaluate('window.scrollY') > 0
    page.locator('.brand-home').click()
    expect(page.get_by_role('heading', name='Plan your trip')).to_be_visible()
    page.wait_for_function('window.scrollY === 0')
    page.get_by_role('button', name='Browse Countries').click()
    expect(page.get_by_role('heading', name='Browse Countries')).to_be_visible()
    page.wait_for_function('window.scrollY === 0')
    page.set_viewport_size({'width': 390, 'height': 844})
    page.locator('.brand-home').click()
    expect(page.get_by_role('heading', name='Plan your trip')).to_be_visible()

    # Browse categories and live filters; group mode has counts and collapsed lists.
    page.get_by_role('button', name='Check Group Req').click()
    expect(page.get_by_role('heading', name='Check Group Requirements')).to_be_visible()
    expect(page.locator('.country-section')).to_have_count(4)
    assert all(item.locator('.country-list').is_hidden()
               for item in page.locator('.country-section').all())
    expect(page.get_by_text(re.compile(r'Visa-Free \(1\)'))).to_be_visible()
    page.get_by_label('Search destinations').fill('Destination B')
    expect(page.get_by_text(re.compile(r'eVisa / Authorization \(1\)'))).to_be_visible()
    page.get_by_label('Filter requirements').select_option('authorization')
    page.get_by_role('button', name='Show countries').click()
    page.get_by_role('button', name='Destination B').click()
    expect(page.get_by_role('heading', name='Destination B')).to_be_visible()
    expect(page.get_by_text('Group Summary', exact=False)).to_be_visible()
    page.get_by_role('navigation', name='Breadcrumb').get_by_role('link', name='Check Group Req').click()
    expect(page.get_by_role('dialog', name='Save these requirements before leaving?')).to_be_visible()
    page.get_by_role('dialog').get_by_role('button', name='Cancel').click()
    expect(page.get_by_role('heading', name='Destination B')).to_be_visible()
    page.go_back()
    page.get_by_role('dialog').get_by_role('button', name='Discard').click()
    expect(page.get_by_label('Search destinations')).to_have_value('Destination B')
    expect(page.get_by_label('Filter requirements')).to_have_value('authorization')

    # View Country: per-traveler detail and conservative NO ISSUES.
    page.goto(base + '#view')
    page.get_by_label('Destination').fill('Destination A')
    expect(page.get_by_role('heading', name='Destination A')).to_be_visible()
    expect(page.get_by_text('NO ISSUES', exact=False)).to_have_count(1)
    expect(page.get_by_text('Important Travel Requirements & Disclaimer')).to_be_visible()
    expect(page.get_by_text('VisaBrowser provides general entry guidance', exact=False)).to_be_hidden()
    page.get_by_role('button', name='Copy', exact=True).click()
    report = page.evaluate('navigator.clipboard.readText()')
    assert 'Aline' in report and 'Alex' in report
    assert 'country=A' in report and 'Important Travel Requirements & Disclaimer' in report
    assert 'passport validity and blank pages' in report.lower()

    # Leaving an unsaved country for the itinerary prompts before navigation.
    page.goto(base + '#multi')
    expect(page.get_by_role('dialog', name='Save these requirements before leaving?')).to_be_visible()
    page.get_by_role('dialog').get_by_role('button', name='Discard').click()
    destination = page.get_by_label('Destinations — type or paste a country list')
    destination.fill('Destination A, Destination C, Destination B')
    expect(page.locator('.itinerary-stop strong')).to_have_text(
        ['1. Destination A', '2. Destination C', '3. Destination B'])
    page.get_by_role('button', name='Move Destination B up').click()
    expect(page.locator('.itinerary-stop strong')).to_have_text(
        ['1. Destination A', '2. Destination B', '3. Destination C'])
    page.get_by_role('button', name='Search Requirements', exact=True).click()
    expect(page.locator('.country-result')).to_have_count(3)
    expect(page.locator('.country-result').first).not_to_have_attribute('open', '')
    first_card = page.locator('.itinerary-country').first
    expect(first_card.get_by_text('Show visa requirements')).to_be_visible()
    # Travel-Prep is visible even while visa requirements are still collapsed.
    expect(first_card.get_by_role('link', name='Travel-Prep')).to_have_attribute(
        'href', 'https://kchorst.github.io/Travel-Prep/#country=A')
    first_card.locator('.country-result summary').click()
    expect(first_card.get_by_text('Hide visa requirements')).to_be_visible()
    first_card.locator('.country-result summary').click()
    expect(first_card.get_by_text('Show visa requirements')).to_be_visible()
    page.get_by_role('button', name='Copy Itinerary').click()
    report = page.evaluate('navigator.clipboard.readText()')
    assert report.index('Destination A') < report.index('Destination B') < report.index('Destination C')
    page.get_by_role('button', name='Clear All').click()
    page.get_by_role('dialog').get_by_role('button', name='Clear All').click()
    expect(page.locator('.itinerary-stop')).to_have_count(0)

    # Every collection has an explicit count/toggle. Long lists start hidden.
    destination.fill('Destination A, Destination B, Destination C, Destination D, Destination E, Aruba')
    expect(page.get_by_role('heading', name='Destinations in order (6)')).to_be_visible()
    assert page.locator('.itinerary-stop').first.is_hidden()
    page.get_by_role('button', name='Show destinations in order').click()
    expect(page.locator('.itinerary-stop').first).to_be_visible()
    page.get_by_role('button', name='Search Requirements').click()
    expect(page.get_by_role('heading', name='Destination results (6)')).to_be_visible()
    assert page.locator('.country-result').first.is_hidden()
    page.get_by_role('button', name='Show destination results').click()
    expect(page.locator('.country-result').first).to_be_visible()
    page.get_by_role('button', name='Hide destination results').click()
    assert page.locator('.country-result').first.is_hidden()
    page.get_by_role('button', name='Clear All').click()
    page.get_by_role('dialog').get_by_role('button', name='Clear All').click()

    # Itinerary searches are not auto-saved; explicit Save Search stores the order.
    page.goto(base + '#multi')
    assert not json.loads(page.evaluate(
        "localStorage.getItem('visabrowser.v1')"))['saved']
    destination = page.get_by_label('Destinations — type or paste a country list')
    destination.fill('Destination A, Destination C')
    page.get_by_role('button', name='Search Requirements', exact=True).click()
    page.once('dialog', lambda dialog: dialog.accept('Autumn Itinerary'))
    page.get_by_role('button', name='Save Search').click()
    expect(page.get_by_role('heading', name='Autumn Itinerary')).to_be_visible()
    expect(page.locator('.country-result')).to_have_count(2)
    # Saved searches keep each Travel-Prep link outside collapsed requirements.
    expect(page.locator('.itinerary-country').first.get_by_role('link', name='Travel-Prep')).to_have_attribute(
        'href', 'https://kchorst.github.io/Travel-Prep/#country=A')
    stored = json.loads(page.evaluate("localStorage.getItem('visabrowser.v1')"))['saved']
    assert stored[0]['itinerary'] == ['A', 'C']
    page.once('dialog', lambda dialog: dialog.accept())
    page.get_by_role('button', name='Refresh Results').click()
    expect(page.get_by_role('heading', name='Autumn Itinerary')).to_be_visible()

    # Save exact original snapshot. The saved record is the only persisted search.
    page.goto(base + '#destination/D/view')
    expect(page.get_by_role('heading', name='Destination D')).to_be_visible()
    page.once('dialog', lambda dialog: dialog.accept('Europe Trip 2027'))
    page.get_by_role('button', name='Save destination').click()
    expect(page.get_by_text('This is the original saved result', exact=False)).to_be_visible()
    assert 'Europe Trip 2027' in json.loads(page.evaluate(
        "localStorage.getItem('visabrowser.v1')"))['saved'][-1]['name']
    sample['RW']['rules']['D'].pop('exceptions')
    sample['RW']['lastSuccess'] = '2026-11-18T12:00:00+00:00'
    catalog['sources']['RW']['lastSuccess'] = sample['RW']['lastSuccess']
    page.reload()
    expect(page.get_by_text('Pending verification', exact=True).first).to_be_visible()
    page.once('dialog', lambda dialog: dialog.accept())
    page.get_by_role('button', name='Refresh Results').click()
    expect(page.get_by_text('Requirement changed', exact=False)).to_be_visible()

    # Offline refresh fails without erasing the previous saved result.
    record_before = json.loads(page.evaluate(
        "localStorage.getItem('visabrowser.v1')"))['saved'][-1]['result']
    context.set_offline(True)
    dialogs = []
    def handle_dialog(dialog):
        dialogs.append(dialog.message)
        dialog.accept()
    page.on('dialog', handle_dialog)
    page.get_by_role('button', name='Refresh Results').click()
    record_after = json.loads(page.evaluate(
        "localStorage.getItem('visabrowser.v1')"))['saved'][-1]['result']
    assert record_after == record_before
    assert any('Original saved results were preserved' in message for message in dialogs)
    page.remove_listener('dialog', handle_dialog)
    context.set_offline(False)

    # Browser-scoped persistence and mobile viewport.
    page.goto(base + '#saved')
    expect(page.get_by_text('Europe Trip 2027')).to_be_visible()
    page.reload()
    expect(page.get_by_text('Europe Trip 2027')).to_be_visible()

    # Traveler updates mark saved snapshots Needs Refresh; refreshing applies new passport.
    page.goto(base + '#passengers')
    page.get_by_role('button', name='Edit Aline').click()
    page.get_by_role('dialog').get_by_label('Passport country').select_option('US')
    page.get_by_role('dialog').get_by_role('button', name='Save traveler').click()
    page.goto(base + '#saved')
    expect(page.get_by_text('Needs Refresh').first).to_be_visible()
    page.get_by_role('button', name='Open', exact=True).first.click()
    page.once('dialog', lambda dialog: dialog.accept())
    page.get_by_role('button', name='Refresh Results').click()
    page.wait_for_function(
        "() => JSON.parse(localStorage.getItem('visabrowser.v1')).saved.at(-1).passengers[1].passport === 'US'",
        timeout=15000)
    expect(page.get_by_role('heading', name='Aline')).to_be_visible()
    expect(page.get_by_text('United States passport', exact=True)).to_have_count(2)

    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Mobile horizontal overflow'
    assert not failures, failures
    context.close()


def production(browser, base):
    context = browser.new_context(viewport={'width': 320, 'height': 740},
                                  is_mobile=True, has_touch=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(base)
    expect(page.get_by_text('VisaBrowser', exact=True).first).to_be_visible()
    expect(page.get_by_role('heading', name='Your first traveler')).to_be_visible()
    expect(page.get_by_label('Traveler name or initials')).to_be_visible()
    assert page.get_by_role('button', name='Add Another Traveler').count() == 0
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.get_by_role('button', name='Save offline').click()
    expect(page.locator('#offline-status')).to_contain_text('Saved offline', timeout=60000)
    context.set_offline(True)
    page.reload()
    expect(page.get_by_role('heading', name='Your first traveler')).to_be_visible()
    expect(page.locator('#offline-status')).to_contain_text('Offline')
    context.set_offline(False)
    assert not errors, errors
    context.close()



def deep_link_first_visit(browser, base):
    # Fresh browser, linked destination, no saved travelers: do not lose context.
    context = browser.new_context(viewport={'width': 360, 'height': 740},
                                  is_mobile=True, has_touch=True, service_workers='block')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(base + '#country=jp')
    expect(page.get_by_role('heading', name='Your first traveler')).to_be_visible()
    expect(page.get_by_text('Destination: Japan')).to_be_visible()
    assert page.get_by_role('button', name='Add Another Traveler').count() == 0
    form = page.get_by_role('form', name='First traveler details')
    expect(form.get_by_label('Traveler name or initials')).to_be_visible()
    form.get_by_label('Traveler name or initials').fill('Visitor')
    form.get_by_label('Passport country').select_option('US')
    form.get_by_role('button', name='Save first traveler').click()
    expect(page.get_by_role('heading', name='Japan')).to_be_visible()
    expect(page.get_by_role('heading', name='Visitor')).to_be_visible()
    assert page.evaluate('location.hash') == '#country=jp'
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert not errors, errors
    context.close()


def real_country_journeys(browser, base):
    """User-specified countries on the shipped data, beyond synthetic fixtures.

    The rules are intentionally not hard-coded: changing source data may change
    visa status, but navigation, snapshots, group ordering, and warnings must
    remain usable.
    """
    context = browser.new_context(
        viewport={'width': 360, 'height': 780}, is_mobile=True,
        has_touch=True, service_workers='block',
        permissions=['clipboard-read', 'clipboard-write'])
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(base)
    add_traveler(page, 'Sam', 'US')
    expect(page.locator('.dashboard-actions button').first).to_have_text('View Country')

    # Reproduce the five-country input provided during Windows acceptance.
    page.get_by_role('button', name='Search Multiple').click()
    example = page.get_by_label('Destinations — type or paste a country list')
    example.fill('mozambique, BRAZIL, cape verde, Portugal, china')
    expect(page.locator('.itinerary-stop strong')).to_have_text(
        ['1. Mozambique', '2. Brazil', '3. Cape Verde', '4. Portugal', '5. China'])
    assert page.get_by_role('button', name='Add Country').count() == 0
    search = page.get_by_role('button', name='Search Requirements')
    expect(search).to_be_enabled()
    search.click()
    expect(page.locator('.country-result')).to_have_count(5)
    page.get_by_role('button', name='Clear All').click()
    page.get_by_role('dialog').get_by_role('button', name='Clear All').click()
    page.goto(base + '#home')

    # Other apps can deep-link with the same #country=ISO format as Travel-Prep.
    page.goto(base + '#country=jp')
    expect(page.get_by_role('heading', name='Japan')).to_be_visible()
    expect(page.get_by_role('heading', name='Sam')).to_be_visible()
    page.goto(base + '#country=ZZZ')
    page.get_by_role('dialog').get_by_role('button', name='Discard').click()
    expect(page.get_by_role('heading', name='View Country')).to_be_visible()
    expect(page.get_by_text('The linked country was not found.')).to_be_visible()
    page.goto(base + '#home')

    # One U.S. passport visiting Japan.
    page.get_by_role('button', name='View Country', exact=True).click()
    page.get_by_label('Destination').fill('Japan')
    expect(page.get_by_role('heading', name='Japan')).to_be_visible()
    expect(page.get_by_role('heading', name='Sam')).to_be_visible()
    expect(page.get_by_text('Important Travel Requirements & Disclaimer')).to_be_visible()
    page.get_by_role('button', name='Copy', exact=True).click()
    report = page.evaluate('navigator.clipboard.readText()')
    assert 'Sam' in report and 'country=JP' in report
    assert 'passport validity and blank pages' in report.lower()

    # Mixed U.S./Canadian passports. Group mode is the primary dashboard path.
    page.goto(base + '#home')
    page.get_by_role('dialog').get_by_role('button', name='Discard').click()
    page.get_by_role('button', name='Edit travelers').click()
    add_traveler(page, 'Pat', 'CA')
    expect(page.locator('.dashboard-actions button').first).to_have_text('Check Group Req')
    page.get_by_role('button', name='Check Group Req').click()
    expect(page.get_by_role('heading', name='Check Group Requirements')).to_be_visible()
    assert all(item.locator('.country-list').is_hidden()
               for item in page.locator('.country-section').all())
    page.goto(base + '#destination/JP/group')
    expect(page.get_by_text('Group Summary', exact=False)).to_be_visible()
    assert page.locator('details').filter(has_text='Group Summary').first.get_attribute('open') is not None
    expect(page.get_by_role('heading', name='Sam')).to_be_visible()
    expect(page.get_by_role('heading', name='Pat')).to_be_visible()

    # Browse visa-free destinations with an alphabetic filter.
    page.goto(base + '#countries')
    page.get_by_role('dialog').get_by_role('button', name='Discard').click()
    page.get_by_label('Filter requirements').select_option('free')
    expect(page.locator('.country-section h2')).to_contain_text('Visa-Free')
    page.get_by_label('Search destinations').fill('Japan')
    expect(page.locator('.country-section h2')).to_contain_text('(1)')

    # France -> Italy -> Croatia itinerary, in exactly the selected order.
    page.goto(base + '#multi')
    picker = page.get_by_label('Destinations — type or paste a country list')
    picker.fill('France, Italy, Croatia')
    expect(page.locator('.itinerary-stop strong')).to_have_text(
        ['1. France', '2. Italy', '3. Croatia'])
    page.get_by_role('button', name='Search Requirements', exact=True).click()
    page.get_by_role('button', name='Copy Itinerary').click()
    report = page.evaluate('navigator.clipboard.readText()')
    assert report.index('France') < report.index('Italy') < report.index('Croatia')
    assert all('country=' + code in report for code in ['FR', 'IT', 'HR'])
    page.once('dialog', lambda dialog: dialog.accept('Europe Trip 2027'))
    page.get_by_role('button', name='Save Search').click()
    expect(page.get_by_role('heading', name='Europe Trip 2027')).to_be_visible()
    expect(page.locator('.country-result')).to_have_count(3)

    # Reopen a saved itinerary; changing a traveler's permit flags Needs Refresh.
    page.goto(base + '#saved')
    expect(page.get_by_text('Europe Trip 2027')).to_be_visible()
    page.get_by_role('button', name='Open').first.click()
    expect(page.get_by_role('heading', name='Europe Trip 2027')).to_be_visible()
    page.goto(base + '#passengers')
    page.get_by_role('button', name='Edit Pat').click()
    editor = page.get_by_role('dialog')
    editor.locator('.optional-documents summary').click()
    editor.get_by_label('Issuing country or area').select_option('US')
    editor.get_by_label('Visa or permit type').select_option('permit')
    editor.get_by_role('button', name='Add visa or permit').click()
    editor.get_by_role('button', name='Save traveler').click()
    page.goto(base + '#saved')
    expect(page.get_by_text('Needs Refresh').first).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (
        'Shipped country workflows overflow the mobile viewport')
    assert not errors, errors
    context.close()


def run():
    with TemporaryDirectory() as folder, sync_playwright() as playwright:
        shutil.copytree(ROOT / 'site', Path(folder) / 'VisaBrowser')
        with ThreadingHTTPServer(('127.0.0.1', 0),
                                 partial(QuietHandler, directory=folder)) as server:
            thread = Thread(target=server.serve_forever, daemon=True)
            thread.start()
            browser = playwright.chromium.launch(
                executable_path=os.environ.get('VISABROWSER_CHROMIUM'))
            try:
                base = f'http://127.0.0.1:{server.server_port}/VisaBrowser/'
                fixture(browser, base)
                deep_link_first_visit(browser, base)
                real_country_journeys(browser, base)
                production(browser, base)
            finally:
                browser.close()
                server.shutdown()
    print('Mobile-first VisaBrowser v0.4.x acceptance walkthroughs passed.')


if __name__ == '__main__':
    run()
