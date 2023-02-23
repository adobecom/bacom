import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

const { default: init, getCtaBody, libsDecorateCta } = await import('../../../blocks/chat-cta/chat-cta.js');

describe('Chat CTA Initialization', () => {
  before(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    const cta = document.querySelector('.chat-cta');
    sinon.spy(window, 'addEventListener');
    await init(cta);
  });

  it('Adds the correct event listeners', () => {
    expect(window.addEventListener.callCount).to.equal(2);
  });

  it('Adds the correct class to the cta on load', () => {
    const stickyCta = document.querySelector('.cta-chat-sticky');
    expect(stickyCta).to.exist;
  });

  it('Decorates the button correctly for mobile', () => {
    const anchor = document.querySelector('a');
    expect(anchor.classList.contains('con-button')).to.be.true;
    expect(anchor.classList.contains('outline')).to.be.true;
  });

  it('Adds the hidden class on modal loaded', () => {
    expect(document.querySelector('.cta-chat-sticky').classList.contains('cta-hidden')).to.be.false;
    const loaded = new Event('milo:modal:loaded');
    window.dispatchEvent(loaded);
    expect(document.querySelector('.cta-chat-sticky').classList.contains('cta-hidden')).to.be.true;
  });

  it('Removes the hidden class on modal closed', () => {
    expect(document.querySelector('.cta-chat-sticky').classList.contains('cta-hidden')).to.be.true;
    const closed = new Event('milo:modal:closed');
    window.dispatchEvent(closed);
    expect(document.querySelector('.cta-chat-sticky').classList.contains('cta-hidden')).to.be.false;
  });
});

describe('Chat CTA Async Functions', () => {
  before(() => {
    document.body.innerHTML = '<div></div>';
  });

  it('Returns null from the request', async () => {
    const url = '.not-valid';
    const cta = await getCtaBody(url);
    expect(cta).to.be.null;
  });

  it('Requests the CTA and appends it to the body', async () => {
    const url = 'https://main--bacom--adobecom.hlx.page/docs/library/blocks/chat-cta';
    const cta = await getCtaBody(url);
    expect(cta.classList.contains('chat-cta')).to.be.true;
    document.querySelector('div').appendChild(cta);
    expect(!!document.querySelector('.chat-cta')).to.be.true;
  });

  it('Calls the decorate function and fails on decorate', async () => {
    const cta = document.querySelector('.chat-cta');
    const libsPath = 'https://main--milo--adobecom.hlx.live/libs';
    const cssHref = `${window.location.origin}/blocks/chat-cta/chat-cta.css`;
    sinon.spy(console, 'log');

    await libsDecorateCta(cta, cssHref, libsPath);
    const logs = console.log.args[0][0];
    expect(logs).to.equal('Error in using utils');
  });
});
