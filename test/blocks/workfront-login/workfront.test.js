import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import waitForElement from '../../helpers/waitForElement.js';
import { createTag, replaceKey, getConfig } from './mocks/workfront-utils.js';
import { createSubdomainForm, createProofForm, location } from '../../../blocks/workfront-login/workfront-login.js';

const config = getConfig();

const delay = (timeOut, cb) => new Promise((resolve) => {
  setTimeout(() => {
    resolve((cb && cb()) || null);
  }, timeOut);
});

describe('Workfront Login', () => {
  describe('Subdomain Form', () => {
    let fetch;

    before(() => {
      fetch = sinon.stub(window, 'fetch');
    });

    beforeEach(() => {
      document.body.innerHTML = '<div class="workfront-login"></div>';
    });

    after(() => {
      sinon.restore();
    });

    it('shows error if submitted with no input', async () => {
      const form = await createSubdomainForm(createTag, replaceKey, config);
      document.querySelector('.workfront-login').append(form);

      const button = document.querySelector('button');
      button.click();
      await delay(10);

      const error = await waitForElement('.error-wrapper.show');
      expect(error).to.exist;
    });

    it('redirects page if input is valid', async () => {
      sinon.stub(location, 'redirect');
      fetch.resolves({ ok: true });

      const form = await createSubdomainForm(createTag, replaceKey, config);
      document.querySelector('.workfront-login').append(form);
      document.querySelector('input').value = 'adobe';

      const button = document.querySelector('button');
      button.click();
      await delay(10);

      expect(location.redirect.called).is.true;
      location.redirect.restore();
    });

    it('shows error if bad response', async () => {
      fetch.resolves({ ok: false });

      const form = await createSubdomainForm(createTag, replaceKey, config);
      document.querySelector('.workfront-login').append(form);
      document.querySelector('input').value = 'adobe';

      const button = document.querySelector('button');
      button.click();
      await delay(10);

      const error = await waitForElement('.error-wrapper.show');
      expect(error).to.exist;
    });

    it('redirects page if error with no code', async () => {
      sinon.stub(location, 'redirect');
      fetch.rejects({});

      const form = await createSubdomainForm(createTag, replaceKey, config);
      document.querySelector('.workfront-login').append(form);
      document.querySelector('input').value = 'error';

      const button = document.querySelector('button');
      button.click();
      await delay(10);

      expect(location.redirect.called).is.true;
      location.redirect.restore();
    });

    it('shows error if input is invalid', async () => {
      fetch.rejects({ code: '404' });

      const form = await createSubdomainForm(createTag, replaceKey, config);
      document.querySelector('.workfront-login').append(form);
      document.querySelector('input').value = 'invalid';

      const button = document.querySelector('button');
      button.click();
      await delay(10);

      const error = await waitForElement('.error-wrapper.show');
      expect(error).to.exist;
    });
  });

  describe('Proof Form', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div class="workfront-login proof"></div>';
    });

    it('has a secure form action', async () => {
      const form = await createProofForm(createTag, replaceKey, config);

      const action = form.getAttribute('action');
      expect(action.includes('https://')).to.be.true;
    });

    it('has the correct http method', async () => {
      const form = await createProofForm(createTag, replaceKey, config);

      const method = form.getAttribute('method');
      expect(method.toLowerCase()).to.equal('post');
    });
  });
});
