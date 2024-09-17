import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

const { default: init, isCurrentPage } = await import('../../../blocks/tree-view/tree-view.js');

window.lana = { log: () => {} };

describe('Tree View', () => {
  describe('simple', () => {
    beforeEach(async () => {
      document.body.innerHTML = await readFile({ path: './mocks/simple.html' });
    });

    it('adds styles', async () => {
      await init(document.querySelector('.tree-view'));
      expect(document.querySelector('.tree-view.tree-view-simple')).to.exist;
    });

    it('has current page', async () => {
      await init(document.querySelector('.tree-view'));
      expect(document.querySelector('.tree-view a.current-page')).to.exist;
    });

    it('does not show current page styles with anchors', async () => {
      const block = document.querySelector('.tree-view.anchors');
      await init(block);
      expect(block.querySelector('a.current-page')).to.not.exist;
    });

    it('changes focus on click of anchor link', async () => {
      const block = document.querySelector('.tree-view.anchors');
      await init(block);
      block.querySelector('a').click();
      expect(document.activeElement).to.equal(document.querySelector('#heading'));
    });
  });

  it('isCurrentPage catches error', () => {
    sinon.stub(window.lana, 'log');
    isCurrentPage('/relative-link');
    expect(window.lana.log.args[0][0]).to.contain('Tree View error:');
    window.lana.log.restore();
  });

  describe('accordion', () => {
    const down = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    const up = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    const right = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    const left = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    const esc = new KeyboardEvent('keydown', { key: 'Escape' });
    let li;
    let menuitem1;
    let menuitem2;
    let menuitem3;
    let link1;
    let link2;
    let lastLink;

    before(async () => {
      document.body.innerHTML = await readFile({ path: './mocks/accordion.html' });
      await init(document.querySelector('.tree-view'));

      li = document.querySelector('ul > li');
      menuitem1 = document.querySelector('#menuitem1 button');
      menuitem2 = document.querySelector('#menuitem2 button');
      menuitem3 = document.querySelector('#menuitem3 button');
      link1 = document.querySelector('#link1');
      link2 = document.querySelector('#link2');
      lastLink = document.querySelector('#last-link');
    });

    it('adds styles', () => {
      expect(document.querySelector('.tree-view.tree-view-accordion')).to.exist;
    });

    it('starts closed', () => {
      expect(li.querySelector('ul').getAttribute('hidden')).to.exist;
      expect(li.getAttribute('aria-expanded')).to.equal('false');
    });

    it('toggles section on click', () => {
      menuitem1.click();
      expect(li.querySelector('ul').getAttribute('hidden')).to.not.exist;
      expect(li.getAttribute('aria-expanded')).to.equal('true');

      menuitem1.click();
      expect(li.querySelector('ul').getAttribute('hidden')).to.exist;
      expect(li.getAttribute('aria-expanded')).to.equal('false');
    });

    describe('keyboard navigation', () => {
      it('down arrow moves focus to next menuitem when on menu', () => {
        document.querySelector('button').dispatchEvent(down);
        expect(document.activeElement).to.equal(document.querySelector('ul > li:nth-child(2) button'));
      });

      it('down arrow wraps when closed', () => {
        document.querySelector('ul > li:last-child button').dispatchEvent(down);
        expect(document.activeElement).to.equal(document.querySelector('button'));
      });

      it('down arrow moves focus to next link when open', () => {
        menuitem1.click();
        link1.dispatchEvent(down);
        expect(document.activeElement).to.equal(link2);
        menuitem1.click();
      });

      it('down arrow wraps when open', () => {
        menuitem3.click();
        lastLink.dispatchEvent(down);
        expect(document.activeElement).to.equal(menuitem1);
        menuitem3.click();
      });

      it('up arrow moves focus to previous menu item when closed', () => {
        document.querySelector('ul > li:last-child button').dispatchEvent(up);
        expect(document.activeElement).to.equal(document.querySelector('ul > li:nth-last-child(2) button'));
      });

      it('up arrow wraps when closed', () => {
        document.querySelector('button').dispatchEvent(up);
        expect(document.activeElement).to.equal(document.querySelector('ul > li:last-child button'));
      });

      it('up arrow moves focus to previous link when open', () => {
        menuitem1.click();
        link2.dispatchEvent(up);
        expect(document.activeElement).to.equal(link1);
        menuitem1.click();
      });

      it('up arrow moves focus from first link to menuitem when open', () => {
        menuitem1.click();
        link1.dispatchEvent(up);
        expect(document.activeElement).to.equal(menuitem1);
        menuitem1.click();
      });

      it('up arrow moves focus from menuitem to last link when open', () => {
        menuitem1.click();
        menuitem2.dispatchEvent(up);
        expect(document.activeElement).to.equal(document.querySelector('#link4'));
        menuitem1.click();
      });

      it('right arrow moves focus to next menuitem from menu', () => {
        menuitem1.dispatchEvent(right);
        expect(document.activeElement).to.equal(menuitem2);
      });

      it('right arrow moves focus to next menuitem from link', () => {
        link1.dispatchEvent(right);
        expect(document.activeElement).to.equal(menuitem2);
      });

      it('right arrow wraps', () => {
        lastLink.dispatchEvent(right);
        expect(document.activeElement).to.equal(menuitem1);
      });

      it('left arrow moves focus to previous menuitem from menu', () => {
        menuitem2.dispatchEvent(left);
        expect(document.activeElement).to.equal(menuitem1);
      });

      it('left arrow moves focus to previous menuitem from link', () => {
        document.querySelector('#link5').dispatchEvent(left);
        expect(document.activeElement).to.equal(menuitem1);
      });

      it('left arrow wraps from menu', () => {
        menuitem1.dispatchEvent(left);
        expect(document.activeElement).to.equal(menuitem3);
      });

      it('left arrow wraps from link', () => {
        link1.dispatchEvent(left);
        expect(document.activeElement).to.equal(menuitem3);
      });

      it('closes on escape on menuitem', () => {
        menuitem1.click();
        menuitem1.dispatchEvent(esc);
        expect(document.querySelector('#menuitem1').getAttribute('aria-expanded')).to.equal('false');
        menuitem1.dispatchEvent(esc);
        expect(document.querySelector('#menuitem1').getAttribute('aria-expanded')).to.equal('false');
      });

      it('closes on escape on link', () => {
        menuitem1.click();
        link1.dispatchEvent(esc);
        expect(document.querySelector('#menuitem1').getAttribute('aria-expanded')).to.equal('false');
        link1.dispatchEvent(esc);
        expect(document.querySelector('#menuitem1').getAttribute('aria-expanded')).to.equal('false');
      });
    });
  });
});
