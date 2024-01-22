import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { mockFetch } from '../helpers/generalHelpers.js';

const ogFetch = window.fetch;

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
document.head.innerHTML = await readFile({ path: './mocks/head.html' });

describe('Scripts', async () => {
  before(async () => {
    await import('../../scripts/scripts.js');
  });

  it('Registers user into AA University', async () => {
    window.fetch = mockFetch();
    window.dispatchEvent(new Event('mktoSubmit'));
    expect(window.fetch.called).to.be.true;
    window.fetch = ogFetch;
  });
});
