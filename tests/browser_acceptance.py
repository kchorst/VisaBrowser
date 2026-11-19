"""End-to-end acceptance for the v0.4.0 mobile-first user journeys.

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
    page.get_by_role('button', name='Add Another Traveler').click()
    form = page.get_by_role('dialog')
    form.get_by_label('Name').fill(name)
    form.get_by_label('Passport').select_option(passport)
    if issuer:
        form.get_by_label('Issuing country or area').select_option(issuer)
        form.get_by_role('button', name='Add visa or permit').click()
    form.get_by_role('button', name='Save passenger').click()


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
    expect(page.get_by_role('heading', name='Travelers')).to_be_visible()
    add_traveler(page, 'Alex', 'US')
    expect(page.get_by_role('heading', name='Plan your trip')).to_be_visible()
    for action in ['View Country', 'Browse Countries', 'Check Group Req',
                   'Search Multiple', 'Saved Searches']:
        expect(page.get_by_role('button', name=action, exact=True)).to_be_visible()
    page.get_by_role('button', name='Edit travelers').click()
    add_traveler(page, 'Aline', 'RW', 'US')
    expect(page.get_by_role('heading', name='Plan your trip')).to_be_visible()
    expect(page.locator('.dashboard-actions button').first).to_have_text('Check Group Req')

    # Browse categories and live filters; group mode has counts and collapsed lists.
    page.get_by_role('button', name='Check Group Req').click()
    expect(page.get_by_role('heading', name='Check Group Requirements')).to_be_visible()
    expect(page.locator('.country-section')).to_have_count(4)
    assert all(item.get_attribute('open') is None for item in page.locator('.country-section').all())
    expect(page.get_by_text(re.compile(r'Visa-Free \(1\)'))).to_be_visible()
    page.get_by_label('Search destinations').fill('Destination B')
    expect(page.get_by_text(re.compile(r'eVisa / Authorization \(1\)'))).to_be_visible()
    page.get_by_label('Filter requirements').select_option('authorization')
    page.locator('.country-section summary').click()
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
    destination = page.get_by_label('Add destinations')
    for name in ['Destination A', 'Destination C', 'Destination B']:
        destination.fill(name)
        page.get_by_role('button', name='Add Country').click()
    expect(page.locator('.itinerary-stop strong')).to_have_text(
        ['1. Destination A', '2. Destination C', '3. Destination B'])
    page.get_by_role('button', name='Move Destination B up').click()
    expect(page.locator('.itinerary-stop strong')).to_have_text(
        ['1. Destination A', '2. Destination B', '3. Destination C'])
    page.get_by_role('button', name='Search', exact=True).click()
    expect(page.locator('.country-result')).to_have_count(3)
    expect(page.locator('.country-result').first).not_to_have_attribute('open', '')
    page.locator('.country-result summary').first.click()
    expect(page.get_by_role('link', name='Open in Travel-Prep').first).to_have_attribute(
        'href', 'https://kchorst.github.io/Travel-Prep/#country=A')
    page.get_by_role('button', name='Copy Itinerary').click()
    report = page.evaluate('navigator.clipboard.readText()')
    assert report.index('Destination A') < report.index('Destination B') < report.index('Destination C')
    page.get_by_role('button', name='Clear All').click()
    page.get_by_role('dialog').get_by_role('button', name='Clear All').click()
    expect(page.locator('.itinerary-stop')).to_have_count(0)

    # Itinerary searches are not auto-saved; explicit Save Search stores the order.
    page.goto(base + '#multi')
    assert not json.loads(page.evaluate(
        "localStorage.getItem('visabrowser.v1')"))['saved']
    destination = page.get_by_label('Add destinations')
    for country in ['Destination A', 'Destination C']:
        destination.fill(country)
        page.get_by_role('button', name='Add Country').click()
    page.get_by_role('button', name='Search', exact=True).click()
    page.once('dialog', lambda dialog: dialog.accept('Autumn Itinerary'))
    page.get_by_role('button', name='Save Search').click()
    expect(page.get_by_role('heading', name='Autumn Itinerary')).to_be_visible()
    expect(page.locator('.country-result')).to_have_count(2)
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
        "localStorage.getItem('visabrowser.v1')"))['saved'][0]['result']
    assert record_after == record_before
    assert any('Original saved results were preserved' in message for message in dialogs)
    context.set_offline(False)

    # Browser-scoped persistence and mobile viewport.
    page.goto(base + '#saved')
    expect(page.get_by_text('Europe Trip 2027')).to_be_visible()
    page.reload()
    expect(page.get_by_text('Europe Trip 2027')).to_be_visible()
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
    expect(page.get_by_role('button', name='Add Another Traveler')).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.get_by_role('button', name='Save offline').click()
    expect(page.locator('#offline-status')).to_contain_text('Saved offline', timeout=60000)
    context.set_offline(True)
    page.reload()
    expect(page.get_by_role('heading', name='Travelers')).to_be_visible()
    expect(page.locator('#offline-status')).to_contain_text('Offline')
    context.set_offline(False)
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
                production(browser, base)
            finally:
                browser.close()
                server.shutdown()
    print('Mobile-first VisaBrowser v0.4.0 acceptance walkthroughs passed.')


if __name__ == '__main__':
    run()
