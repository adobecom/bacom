import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import init from '../../../blocks/faas-decode/faas-decode.js';
import { setLibs } from '../../../scripts/utils.js';
import waitForElement from '../../helpers/waitForElement.js';

describe('FaaS Decode', () => {
  before(() => {
    sinon.spy(console, 'log');
    setLibs('/libs');
  });

  after(() => {
    sinon.restore();
  });

  it('shows error if no url', async () => {
    document.body.innerHTML = '<div class="faas-decode"><div><div><a href="/404"></a></div></div></div>';
    const el = document.querySelector('.faas-decode');
    await init(el);
    expect(console.log.args[0][0]).to.include('Error fetching data from url:');
  });

  it('creates a table', async () => {
    document.body.innerHTML = '<div class="faas-decode"><div><div><a href="/test/blocks/faas-decode/mocks/query-index.json"></a></div></div></div>';
    const el = document.querySelector('.faas-decode');
    await init(el);
    const table = await waitForElement('table');
    expect(table).to.exist;
  });

  it('shows error if no form data', async () => {
    document.body.innerHTML = '<div class="faas-decode"><div><div><a href="/test/blocks/faas-decode/mocks/query-index.json"></a></div></div></div>';
    const el = document.querySelector('.faas-decode');
    await init(el);
    const table = await waitForElement('table');
    expect(table.querySelector('tbody tr:nth-child(3) td:nth-child(3)').textContent).to.equal('Form data error');
  });
});
