import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';
import sinon from 'sinon';
import init, { loadQueryIndex, createTable, decodeUrl } from '../../../blocks/url-decode/url-decode.js';
import waitForElement from '../../helpers/waitForElement.js';

import { LIBS } from '../../../scripts/scripts.js';

const { utf8ToB64 } = await import(`${LIBS}/utils/utils.js`);
const queryIndex = await readFile({ path: './mocks/query-index.json' });
const getCell = (row, index) => row.querySelector(`td:nth-child(${index})`).textContent;

window.lana = { log: () => { } };

const QUERY_INEDX_LENGTH = 6;

describe('URL Decode', () => {
  before(() => {
    sinon.stub(window.lana, 'log');
    sinon.stub(window, 'fetch').callsFake(() => Promise.resolve({ ok: true, json: () => JSON.parse(queryIndex) }));
  });

  after(() => {
    sinon.restore();
  });

  beforeEach(async () => {
    const url = new URL(window.location);
    url.searchParams.delete('locale');
    window.history.replaceState({}, '', url);
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

    expect(data.length).to.equal(QUERY_INEDX_LENGTH);
  });

  it('creates a table', async () => {
    const table = createTable([
      { path: 'path1', validLink: 'Yes' },
      { path: 'path2', validLink: 'No' },
    ]);

    expect(table).to.exist;
    expect(table.querySelectorAll('tr')).to.have.length(3);
  });

  it('decodes base64 url', async () => {
    const url = `/tools/test#${utf8ToB64(JSON.stringify({ test: 'test' }))}`;
    const data = await decodeUrl(url);

    expect(data).to.deep.equal({ test: 'test' });
  });

  it('decodes compressed URL', async () => {
    const url = 'https://main--milo--adobecom.hlx.page/tools/caas#~~H4sIAAAAAAAAE3VVTY/bNhD9Lzw7Wafb9qCb7V0jBrxZN/aihyIoxuRIIkxxVHJor1L0vxek9ek4N+kNOR9v3gz/FaCUZk0WzFf8J6DnHTiovMj++jYTqrFQabk6LNbktvqMz2e07EWWg/E4E2DBNKylX5ExKKOfL1ChyIQYGQ8O5GlT1Q6912RHt9WWCi0PULTxIDCtKFh2zRZs0Z88Ep0qcKeNJLvHGOkaYoy/WT+ySHBqz42JuZRg8g8l6qLk1nLQbHAhZUzoqI3mZotnNCL7fSZkX8qSbeeidroC14ixeah0wJLjW3Cvv/eYZdAWncjEp1/m8xd4/1MrLlsTWj40NQ58yCsXIhMSwGft70Pw8ULwTNUKnGp9MyxSOJGJvz2aXMyEoi/EW/jebAlUz6bSHo4Gl2AtuqGZykHOT8f+H62qSdtI6OVy+QiKjvhRUvUgS12hgw9Q64ehShFvnLUjW6Ftu4Dv0gSFKmbZltRCQ405GHMEeXoewomZyBE4uMnNXBtGlxTYnknAMmijdmBj+5KAKmAte/OWJLSsGMx5hBdaikyQ66FJHL9K/E6gfUmX56rmpueoCMypm7++i5koEVTvptQKVwwbNf0fCo/AEzBuLKM7g+mdantDkQFbBCiw00H3/4CRdQMNhSScmEeoI0SgXsjhXQVb4puxI2uaWNuyHaee9jYhcjcXaii0TbQurK7SRx8HClRifOTZRrUN8hssfwSwrDnFtnfsbU0tkDo1GN88Hkqs8HG4aEBiSUahe3PmqhGHPhj2O3S7ROBvM+ERnCzXGk3XGo+SrALXDBX20J6Ck9iBHIlZklPjwfElXRIOqsApvCZidE/6rFWUycjSce3XSVv3ba922ojkstPqCNvcnNmnEifQgTiu+MTGYCDHUYILL3/AnvAO+EJK53rUzGTAHIKJQ6m6e1fDtfM7qkM9uXDFv4JVVO2hqo0e7fp0IA75nhxP0HW7EyZgl9FtCR3+QxnXsFMIPbozabcjMiL7NJ/PbwwpSxTZ4xW/vh83jhN4E67VjijhcvLi20wwFP4qzp/v1HhGxKOuQI47/azjyhE9djtRHOcgLrj4xKGPS04hgzb+gO/8Wrf7T7V9mgmOqX5GUNoW7csnysdoiCpJmjtQnMpIxkwEj9voOnrrgwaPr2d0BpqttqdBU6P3MzDTnQUUPLqNzSkO1X//AxGj3OyCCAAA';
    const data = await decodeUrl(url);

    expect(data).to.not.be.empty;
    expect(data).to.have.property('tagsUrl', 'www.adobe.com/chimera-api/tags');
  });

  it('shows report data', async () => {
    const el = document.querySelector('.url-decode');
    const submit = el.querySelectorAll('button[type="submit"]');

    expect(submit).to.have.length(1);
    submit[0].click();

    const table = await waitForElement('table');
    expect(table).to.exist;

    expect(window.location.search).to.include('locale=us');
    const rows = table.querySelectorAll('tr');

    expect(rows).to.have.length(QUERY_INEDX_LENGTH + 1);
    expect(rows[0].querySelector('th').textContent).to.equal('path');
    expect(rows[0].querySelector('th:nth-child(2)').textContent).to.equal('valid');
    expect(rows[0].querySelector('th:nth-child(3)').textContent).to.equal('message');
    expect(rows[0].querySelector('th:nth-child(4)').textContent).to.equal('count');

    expect(getCell(rows[1], 3)).to.equal('Valid link(s) found');
    expect(getCell(rows[1], 4)).to.equal('1');
    expect(getCell(rows[2], 3)).to.equal('Could not decode link 1');
    expect(getCell(rows[2], 4)).to.equal('1');
    expect(getCell(rows[3], 3)).to.equal('Valid link(s) found');
    expect(getCell(rows[3], 4)).to.equal('1');
    expect(getCell(rows[4], 3)).to.equal('No links Found');
    expect(getCell(rows[4], 4)).to.equal('0');
    expect(getCell(rows[5], 3)).to.equal('No links Found');
    expect(getCell(rows[5], 4)).to.equal('0');
    expect(getCell(rows[6], 3)).to.equal('No links Found');
    expect(getCell(rows[6], 4)).to.equal('0');
  });

  it('sorts report data', async () => {
    const el = document.querySelector('.url-decode');
    const submit = el.querySelectorAll('button[type="submit"]');

    expect(submit).to.have.length(1);
    submit[0].click();

    const table = await waitForElement('table');
    expect(table).to.exist;

    const header = el.querySelector('th:nth-child(3)');
    header.click();

    const sortedRows = el.querySelectorAll('table tr');

    expect(getCell(sortedRows[1], 3)).to.equal('Could not decode link 1');
    expect(getCell(sortedRows[2], 3)).to.equal('No links Found');

    const sortHeader = el.querySelector('th:nth-child(3)');
    sortHeader.click();

    const reversedRows = el.querySelectorAll('table tr');

    expect(getCell(reversedRows[1], 3)).to.equal('Valid link(s) found');
    expect(getCell(reversedRows[2], 3)).to.equal('Valid link(s) found');
  });
});
