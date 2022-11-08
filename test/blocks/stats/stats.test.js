/* eslint-disable no-unused-expressions */
/* global describe it */

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
});
