import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import sinon from 'sinon';
import init, { loadQueryIndex, createTable } from '../../../blocks/url-decode/url-decode.js';
import waitForElement from '../../helpers/waitForElement.js';

window.lana = { log: () => { } };
const queryIndex = await readFile({ path: './mocks/query-index.json' });

describe('URL Decode', () => {
  before(() => {
    sinon.stub(window.lana, 'log');
    sinon.stub(window, 'fetch').callsFake(() => Promise.resolve({ ok: true, json: () => JSON.parse(queryIndex) }));
  });

  after(() => {
    sinon.restore();
  });

  beforeEach(async () => {
    document.body.innerHTML = '<div class="url-decode"></div>';

    const el = document.querySelector('.url-decode');

    await init(el);
  });

  it('shows list of locales', async () => {
    const el = document.querySelector('.url-decode');
    const select = el.querySelector('select#locale');
    const options = select.querySelectorAll('option');
    expect(select).to.exist;
    expect(options).to.have.length.greaterThan(2);
  });

  it('shows "Fetch Index" button', async () => {
    const el = document.querySelector('.url-decode');
    const button = el.querySelector('button[type="submit"]');
    expect(button).to.exist;
  });

  it('shows report section', async () => {
    const el = document.querySelector('.url-decode');
    const report = el.querySelector('.report');
    expect(report).to.exist;
  });

  it('fetches query index', async () => {
    const data = await loadQueryIndex('https://business.adobe.com/query-index.json');

    expect(data.length).to.equal(4);
  });

  it('creates a table', async () => {
    const table = createTable([
      { path: 'path1', validLink: 'Yes' },
      { path: 'path2', validLink: 'No' },
    ]);

    expect(table).to.exist;
    expect(table.querySelectorAll('tr')).to.have.length(3);
  });

  it('shows report data', async () => {
    const el = document.querySelector('.url-decode');
    const submit = el.querySelector('button[type="submit"]');
    submit.click();

    const table = await waitForElement('table');
    expect(table).to.exist;

    const rows = table.querySelectorAll('tr');

    expect(rows).to.have.length(5);
    expect(rows[0].querySelector('th').textContent).to.equal('path');
    expect(rows[0].querySelector('th:nth-child(2)').textContent).to.equal('validLink');

    expect(rows[1].querySelector('td:nth-child(2)').textContent).to.equal('Yes');
    expect(rows[2].querySelector('td:nth-child(2)').textContent).to.equal('Yes');
    expect(rows[3].querySelector('td:nth-child(2)').textContent).to.equal('Could not decode link');
    expect(rows[4].querySelector('td:nth-child(2)').textContent).to.equal('No Config Found');
  });
});
