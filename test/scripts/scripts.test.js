import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { mockFetch } from '../helpers/generalHelpers.js';
import delay from '../helpers/delay.js';

const ogFetch = window.fetch;

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
document.head.innerHTML = await readFile({ path: './mocks/head.html' });

describe('Scripts', () => {
  before(async () => {
    await import('../../scripts/scripts.js');
  });

  // ToDo: Fix this failing test
  it('Registers user into AA University', async () => {
    window.fetch = mockFetch();
    const event = new Event('mktoSubmit');
    window.dispatchEvent(event);
    await delay(200);
    expect(window.fetch.called).to.be.true;
    window.fetch = ogFetch;
  });
});
