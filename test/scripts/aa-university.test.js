import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { mockFetch } from '../helpers/generalHelpers.js';
import registerAAUniversity from '../../scripts/aa-university.js';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });

const ogFetch = window.fetch;
const ogLana = window.lana;

describe('AA University', async () => {
  it('Registers user into AA University', () => {
    window.fetch = mockFetch();
    registerAAUniversity();
    expect(window.fetch.called).to.be.true;
    window.fetch = ogFetch;
  });

  it('Catches registration error', () => {
    const mockRes = () => new Promise(() => { throw new Error('Fetch rejected'); });
    const mockFetchReject = () => sinon.stub().callsFake(() => mockRes());
    window.fetch = mockFetchReject();
    window.lana = { log: sinon.stub() };

    registerAAUniversity();
    expect(window.fetch.called).to.be.true;

    window.fetch = ogFetch;
    window.lana = ogLana;
  });
});
