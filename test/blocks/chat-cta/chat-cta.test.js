import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

const { default: init } = await import('../../../blocks/chat-cta/chat-cta.js');

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
