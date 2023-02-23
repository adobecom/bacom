import { expect } from '@esm-bundle/chai';
import { setLibs } from '../../../scripts/utils.js';

const { default: init } = await import('../../../blocks/stats/stats.js');

setLibs('libs');

describe('Stats', () => {
  it('Allows intro', async () => {
    document.body.innerHTML = '<div class="stats"><div>Intro</div><div>Stat 1</div><div>Stat 2</div></div>';

    await init(document.querySelector('.stats'));
    expect(document.querySelector('.stats-intro')).to.exist;
  });

  it('Decorates headers', async () => {
    document.body.innerHTML = '<div class="stats"><div></div><div><h1>Heading 1</h1><h2>Heading 2</h2><h3Heading 3</h3><h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6</h6></div></div>';
    const headingClasses = {
      h1: 'xl',
      h2: 'l',
      h3: 'm',
      h4: 's',
      h5: 'xs',
      h6: 'xs',
    };
    await init(document.querySelector('.stats'));
    [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].forEach((heading) => {
      expect(heading.className.includes(headingClasses[heading.localName])).to.be.true;
    });
  });
});
