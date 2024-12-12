import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const { default: init } = await import('../../../blocks/cta-widget/cta-widget.js');

describe('CTA Widget', () => {
  before(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    await init(document.querySelector('.cta-widget'));
  });

  it('Toggles body on click', () => {
    const cta = document.querySelector('.cta-widget');
    const body = document.querySelector('.cta-widget-body');
    const curtain = document.querySelector('.cta-curtain');
    cta.click();
    expect(body.classList.contains('hidden')).to.be.false;
    expect(curtain.classList.contains('hidden')).to.be.false;
    expect(cta.classList.contains('hidden')).to.be.true;

    const close = document.querySelector('.widget-close');
    close.click();
    expect(body.classList.contains('hidden')).to.be.true;
    expect(curtain.classList.contains('hidden')).to.be.true;
    expect(cta.classList.contains('hidden')).to.be.false;
  });

  it('Decorates the button correctly for mobile', () => {
    const anchor = document.querySelector('a');
    expect(anchor.classList.contains('con-button')).to.be.true;
    expect(anchor.classList.contains('outline')).to.be.true;
  });
});
