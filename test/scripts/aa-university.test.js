import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { mockFetch } from '../helpers/generalHelpers.js';
import registerAAUniversity from '../../scripts/aa-university.js';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });

const ogFetch = window.fetch;

describe('AA University', async () => {
  it('Registers user into AA University', () => {
    window.fetch = mockFetch();
    registerAAUniversity();
    expect(window.fetch.called).to.be.true;
    window.fetch = ogFetch;
  });

  // ToDo: Fix this test
  it('Catches registration error', () => {
    const mockRes = ({ status = 400, ok = false } = {}) => new Promise((reject) => {
      reject({
        status,
        ok,
      });
    });

    const mockFetchReject = () => sinon.stub().callsFake(() => mockRes());
    window.fetch = mockFetchReject();
    registerAAUniversity();
    expect(window.fetch.called).to.be.true;
    window.fetch = ogFetch;
  });
});
