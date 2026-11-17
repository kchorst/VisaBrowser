from datetime import datetime
import json
import os
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import shutil
from subprocess import check_output
from tempfile import TemporaryDirectory
from threading import Thread

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
STAMP = '2026-11-17T12:00:00+00:00'
NEW_STAMP = '2026-11-24T12:00:00+00:00'


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def visit(page, name):
    page.get_by_role('button', name='Countries', exact=True).click()
    page.get_by_role('searchbox', name='Search destinations').fill(name)
    page.locator('.country-list').get_by_role('button', name=re.compile(r'^' + re.escape(name) + r'(?:\s+\d+ pending verification)?$')).click()
    expect(page.get_by_role('heading', name=name, exact=True)).to_be_visible()


def add(page, name, passport, issuer=None):
    page.get_by_role('button', name='Add passenger', exact=True).click()
    dlg = page.get_by_role('dialog')
    dlg.get_by_label('Name').fill(name)
    dlg.get_by_label('Passport').select_option(passport)
    if issuer:
        dlg.get_by_label('Issuing country or area').select_option(issuer)
        dlg.get_by_role('button', name='Add visa or permit').click()
    dlg.get_by_role('button', name='Save passenger').click()


def section(page, heading):
    return page.locator('main section').filter(has=page.get_by_role('heading', name=heading, exact=True))


def workflows(browser, base):
    data = json.loads(check_output(
        ['node', '--input-type=module', '-e',
         "import {sample} from './tests/fixtures.js'; console.log(JSON.stringify(sample))"], cwd=ROOT))
    places = {'US': 'United States', 'RW': 'Rwanda', 'ZZ': 'Unsupported passport',
              **{code: f'Destination {code}' for code in ['A', 'B', 'C', 'D', 'E']},
              'AW': 'Aruba', 'BAN': 'Entry ban', 'BOTH': 'Two visa options', 'CONFLICT': 'Conflict'}
    catalog = {'overdueDays': 14, 'passports': ['US', 'RW', 'ZZ'],
               'sources': {code: {'lastSuccess': STAMP} for code in data},
               'destinations': [code for code in places if code not in ['US', 'RW', 'ZZ']]}
    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True,
                                  has_touch=True, service_workers='block', timezone_id='America/Los_Angeles')
    context.route('**/data/index.json', lambda route: route.fulfill(json=catalog))
    context.route('**/data/places.json', lambda route: route.fulfill(json=places))
    for code in ['US', 'RW']:
        context.route(f'**/data/passports/{code}.json', partial(
            lambda passport, route: route.fulfill(json=data[passport]), code))
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.clock.set_fixed_time(datetime.fromisoformat(STAMP))
    page.goto(base)
    version = json.loads((ROOT / 'package.json').read_text())['version']
    expect(page.get_by_text(f'v{version}')).to_be_visible()
    expect(page.get_by_text('Six months from today is May 17, 2027.')).to_be_visible()
    page.get_by_role('button', name='Dismiss passport reminder').click()
    expect(page.get_by_label('Passport reminder')).to_be_hidden()
    visit(page, 'Destination A')
    expect(page.get_by_role('button', name='Add passengers')).to_be_visible()
    page.get_by_role('button', name='Add passengers').click()
    add(page, 'Alex', 'US')
    expect(page.get_by_role('heading', name='Destination A')).to_be_visible()
    page.get_by_role('button', name='Passengers', exact=True).click()
    add(page, 'Aline', 'RW', 'US')

    visit(page, 'Destination A')
    expect(page.get_by_text('Visa-free for everyone', exact=True)).to_be_visible()
    expect(page.get_by_text('0 issues', exact=True)).to_be_visible()
    expect(page.get_by_label('What United States document')).to_have_count(0)
    page.close()
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.clock.set_fixed_time(datetime.fromisoformat(STAMP))
    page.goto(base)
    expect(page.get_by_role('heading', name='Alex')).to_be_visible()
    expect(page.get_by_role('heading', name='Aline')).to_be_visible()
    expect(page.get_by_label('Passport reminder')).to_be_visible()

    visit(page, 'Destination B')
    expect(page.get_by_text('1 issue', exact=True)).to_be_visible()
    for fragment in ['Issue', 'Apply for e-visa before travel', 'Fee unknown', 'Stay limit unknown']:
        expect(section(page, 'Aline').get_by_text(fragment, exact=True)).to_be_visible()
    expect(section(page, 'Alex').get_by_text('Issue', exact=True)).to_have_count(0)

    visit(page, 'Destination C')
    expect(page.get_by_text('E-visa or visa on arrival for everyone', exact=True)).to_be_visible()
    expect(section(page, 'Alex').get_by_text('Apply for e-visa before travel')).to_be_visible()
    expect(section(page, 'Aline').get_by_text('Visa on arrival*', exact=True)).to_be_visible()
    expect(section(page, 'Aline').get_by_text('Harbor International Airport.', exact=False)).to_be_visible()
    expect(page.get_by_text('0 issues', exact=True)).to_be_visible()

    visit(page, 'Destination D')
    expect(page.get_by_text('1 visa-free · 1 pending verification')).to_be_visible()
    expect(page.get_by_text('0 issues', exact=True)).to_be_visible()
    page.get_by_label('What United States document').select_option('visa')
    expect(section(page, 'Aline').get_by_text('Visa required before travel', exact=True)).to_be_visible()
    expect(page.get_by_text('1 issue', exact=True)).to_be_visible()
    page.get_by_role('button', name='Passengers', exact=True).click()
    page.get_by_role('button', name='Edit Aline').click()
    page.get_by_role('button', name='Clear answers for United States document').click()
    page.get_by_role('button', name='Save passenger').click()
    visit(page, 'Destination D')
    page.get_by_label('What United States document').select_option('permit')
    expect(page.get_by_text('Visa-free for everyone', exact=True)).to_be_visible()

    page.get_by_role('button', name='Save destination').click()
    expect(page.get_by_role('heading', name='Saved passengers')).to_be_visible()
    visit(page, 'Destination E')
    expect(page.get_by_text('2 issues', exact=True)).to_be_visible()
    for person in ['Alex', 'Aline']:
        expect(section(page, person).get_by_text('Issue', exact=True)).to_be_visible()
    visit(page, 'Aruba')
    expect(section(page, 'Alex').get_by_text('Tourist registration')).to_be_visible()
    expect(page.get_by_role('link', name='Open Travel-Prep')).to_have_attribute(
        'href', 'https://kchorst.github.io/Travel-Prep/#country=AW')
    visit(page, 'Conflict')
    section(page, 'Alex').get_by_text('Source notes').click()
    expect(section(page, 'Alex').get_by_text('Visa required', exact=True)).to_be_visible()
    expect(section(page, 'Alex').get_by_text('Visa not required', exact=True)).to_be_visible()
    visit(page, 'Entry ban')
    expect(section(page, 'Alex').get_by_text('Entry not permitted')).to_be_visible()
    visit(page, 'Two visa options')
    expect(section(page, 'Alex').get_by_text('Visa on arrival or E-visa', exact=True)).to_be_visible()

    page.get_by_role('button', name='Passengers', exact=True).click()
    page.get_by_role('button', name='Remove Aline').click()
    page.get_by_role('button', name='Remove passenger', exact=True).click()
    add(page, 'Casey', 'ZZ')
    visit(page, 'Destination A')
    expect(section(page, 'Casey').get_by_text('No usable Wikipedia', exact=False)).to_be_visible()
    page.get_by_role('button', name='Passengers', exact=True).click()
    page.get_by_role('button', name='Clear selection', exact=True).click()
    expect(page.get_by_text('0 selected', exact=True)).to_be_visible()
    expect(page.get_by_role('heading', name='Alex', exact=True)).to_be_visible()

    del data['RW']['rules']['D']['exceptions']
    data['RW']['lastSuccess'] = NEW_STAMP
    catalog['sources']['RW']['lastSuccess'] = NEW_STAMP
    page.get_by_role('button', name='Saved destinations', exact=True).click()
    page.get_by_role('button', name='Open saved Destination D').click()
    page.get_by_role('button', name='Recalculate', exact=True).click()
    expect(section(page, 'Aline').get_by_text(
        'Requirement changed from Visa-free to Visa required before travel')).to_be_visible()
    expect(section(page, 'Alex').get_by_text('Requirement changed', exact=False)).to_have_count(0)

    catalog['sources']['RW']['error'] = 'The table is missing required columns'
    page.get_by_role('button', name='Recalculate').click()
    expect(page.get_by_text('Update delayed', exact=True)).to_be_visible()
    expect(section(page, 'Aline').get_by_text('Visa required before travel', exact=True)).to_be_visible()
    page.get_by_role('button', name='Edit saved passenger Aline').click()
    page.get_by_role('dialog').get_by_label('Name').fill('Aline Revised')
    page.get_by_role('button', name='Save passenger').click()
    expect(page.get_by_role('heading', name='Aline Revised')).to_be_visible()
    page.get_by_role('button', name='Delete saved destination').click()
    page.get_by_role('dialog').get_by_role('button', name='Delete', exact=True).click()
    expect(page.get_by_text('Open a destination comparison and choose Save destination.')).to_be_visible()
    assert not errors, errors
    context.close()


def production(browser, base, site):
    context = browser.new_context(viewport={'width': 320, 'height': 740}, is_mobile=True, has_touch=True)
    page = context.new_page()
    catalog_path = site / 'data/index.json'
    manifest_path = site / 'data/offline-manifest.json'
    catalog_bytes, manifest_bytes = catalog_path.read_bytes(), manifest_path.read_bytes()
    original_date = json.loads(catalog_bytes)['generated']
    page.clock.set_fixed_time(datetime.fromisoformat(original_date))
    page.goto(base)
    add(page, 'Alex', 'US')
    add(page, 'Aline', 'RW', 'US')
    add(page, 'Bia', 'BR')
    add(page, 'Noa', 'IL')
    page.get_by_role('button', name='Multi-search', exact=True).click()
    page.get_by_label('Destinations to compare').fill('Iran, New Zealand, Japan, China')
    page.get_by_role('button', name='Check destinations').click()
    checked = page.get_by_role('region', name='Destination results')
    iran = checked.locator('section').filter(has=page.get_by_role('heading', name='Iran', exact=True))
    expect(iran.get_by_text('Noa · Pending verification', exact=True)).to_be_visible()
    expect(iran.get_by_text('Search terms:', exact=False).last).to_be_visible()
    expect(checked.get_by_text('Bia · Visa-free · Obtain an NZeTA before travel', exact=True)).to_be_visible()
    expect(checked.get_by_text('The waiver is published through December 31, 2026.', exact=False)).to_be_visible()
    checked.get_by_role('link', name='View details for Japan').click()
    page.get_by_label('Will you travel on a valid ordinary ePassport that meets ICAO standards?').select_option('yes')
    expect(section(page, 'Bia').get_by_text('Visa-free*', exact=True)).to_be_visible()
    page.get_by_role('navigation', name='Breadcrumb').get_by_role('link', name='Multi-search').click()
    page.get_by_role('button', name='Clear list').click()
    page.get_by_role('button', name='Passengers', exact=True).click()
    page.get_by_role('checkbox', name='Include Noa').uncheck()
    page.get_by_role('checkbox', name='Include Aline').uncheck()
    page.get_by_role('button', name='Multi-search', exact=True).click()
    shortlist = page.get_by_label('Destinations to compare')
    shortlist.fill(' brazil , U.S.A., BR, Congo, "Saint Helena, Ascension and Tristan da Cunha" ')
    shortlist.press('Enter')
    results = page.get_by_role('region', name='Destination results')
    expect(results.get_by_role('heading', name='Destination results')).to_be_focused()
    expect(page.get_by_role('button', name='Check destinations')).to_be_disabled()
    expect(results.get_by_role('heading', level=3)).to_have_text([
        'Brazil', 'United States', 'Saint Helena, Ascension and Tristan da Cunha'])
    expect(results.get_by_text('Alex · E-visa', exact=False)).to_be_visible()
    expect(results.get_by_text('Bia · Visa required before travel', exact=False)).to_be_visible()
    expect(results.get_by_text('Aline', exact=False)).to_have_count(0)
    expect(page.get_by_text('Could not match “Congo”', exact=False)).to_be_visible()
    results.get_by_role('link', name='View details for Brazil').click()
    expect(section(page, 'Bia').get_by_text('Citizen entry', exact=True)).to_be_visible()
    page.get_by_role('navigation', name='Breadcrumb').get_by_role('link', name='Multi-search').click()
    expect(results.get_by_role('heading', name='Brazil', exact=True)).to_be_visible()
    page.get_by_role('button', name='Clear list').click()
    expect(shortlist).to_have_value('')
    page.get_by_role('button', name='Countries', exact=True).click()
    expect(page.get_by_role('searchbox', name='Search destinations')).to_be_visible()
    page.get_by_role('button', name='Passengers', exact=True).click()
    page.get_by_role('checkbox', name='Include Bia').uncheck()
    page.get_by_role('checkbox', name='Include Aline').check()
    visit(page, 'Aruba')
    expect(section(page, 'Alex').get_by_text('Visa-free', exact=True)).to_be_visible()
    expect(section(page, 'Aline').get_by_text('Visa required before travel', exact=True)).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth === innerWidth')
    visit(page, 'Rwanda')
    expect(page.get_by_role('link', name='Open Travel-Prep')).to_have_attribute(
        'href', 'https://kchorst.github.io/Travel-Prep/#country=RW')
    expect(section(page, 'Aline').get_by_text('Citizen entry', exact=True)).to_be_visible()
    expect(section(page, 'Aline').get_by_text('Stay limit unknown', exact=True)).to_have_count(0)
    assert 'pending verification' not in page.locator('main').inner_text().lower()
    visit(page, 'Aruba')
    assert page.evaluate('navigator.serviceWorker.ready.then(reg => reg.scope.endsWith("/VisaBrowser/"))')
    page.reload()
    expect(page.get_by_role('heading', name='Aruba', exact=True)).to_be_visible()
    expect(section(page, 'Aline').get_by_text('Visa required before travel', exact=True)).to_be_visible()
    page.get_by_role('button', name='Save offline', exact=True).click()
    expect(page.locator('#offline-status')).to_contain_text('Saved offline', timeout=60000)
    context.set_offline(True)
    page.reload()
    expect(page.get_by_role('heading', name='Aruba', exact=True)).to_be_visible()
    expect(section(page, 'Aline').get_by_text('Visa required before travel', exact=True)).to_be_visible()
    page.get_by_role('button', name='Passengers', exact=True).click()
    add(page, 'First visit with Haiti', 'HT')
    page.get_by_role('button', name='Multi-search', exact=True).click()
    shortlist.fill('Cote d’Ivoire, United States')
    page.get_by_role('button', name='Check destinations').click()
    expect(results.get_by_role('heading', level=3)).to_have_text(['Côte d’Ivoire', 'United States'])
    us = section(page, 'United States')
    expect(us.get_by_text('First visit with Haiti · Pending verification')).to_be_visible()
    expect(us.get_by_text('Search terms:', exact=False).first).to_be_visible()
    results.get_by_role('link', name='View details for United States').click()
    expect(section(page, 'First visit with Haiti').get_by_text('Pending verification', exact=True)).to_be_visible()
    expect(section(page, 'First visit with Haiti').get_by_text('Search terms:', exact=False)).to_be_visible()
    expect(section(page, 'First visit with Haiti').get_by_label('Did you hold a valid U.S. visa', exact=False)).to_be_visible()
    expect(page.locator('#offline-status')).to_contain_text(original_date[:10])

    # Advertise a changed manifest whose hash does not match the delivered shard.
    broken_manifest = json.loads(manifest_bytes)
    broken_manifest['version'] = '1' * 64
    broken_manifest['files']['passports/HT.json'] = '0' * 64
    manifest_path.write_text(json.dumps(broken_manifest), encoding='utf-8')
    try:
        context.set_offline(False)
        page.reload()
        update = page.get_by_role('button', name='Update available')
        expect(update).to_be_visible()
        update.click()
        expect(page.locator('#offline-status')).to_contain_text('Download interrupted', timeout=60000)
        context.set_offline(True)
        page.reload()
        expect(section(page, 'First visit with Haiti').get_by_text('Pending verification', exact=True)).to_be_visible()
        expect(page.locator('#offline-status')).to_contain_text(original_date[:10])
    finally:
        manifest_path.write_bytes(manifest_bytes)
    context.close()


def run():
    with TemporaryDirectory() as folder, sync_playwright() as playwright:
        shutil.copytree(ROOT / 'site', Path(folder) / 'VisaBrowser')
        with ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=folder)) as server:
            thread = Thread(target=server.serve_forever, daemon=True)
            thread.start()
            browser = playwright.chromium.launch(executable_path=os.environ.get('VISABROWSER_CHROMIUM'))
            try:
                base = f'http://127.0.0.1:{server.server_port}/VisaBrowser/'
                workflows(browser, base)
                production(browser, base, Path(folder) / 'VisaBrowser')
            finally:
                browser.close()
                server.shutdown()
    print('Passed six mobile walkthroughs, additional checks, and production subpath/offline smoke test.')


if __name__ == '__main__':
    run()
