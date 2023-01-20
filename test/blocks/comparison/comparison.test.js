import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import init from '../../../blocks/comparison/comparison.js';
import { setLibs } from '../../../scripts/utils.js';

setLibs('/libs');
document.body.innerHTML = await readFile({ path: './mocks/body.html' });
describe('Comparison Table', () => {
  it('Verify Comparison Table Exists', async () => {
    const comparison = document.querySelector('.comparison');

    await init(comparison);

    expect(comparison.querySelector('table')).to.exist;
    expect(comparison.querySelector('thead tr th')).to.exist;
    expect(comparison.querySelector('tbody tr th')).to.exist;
  });

  it('Verify CTA Row Exists', async () => {
    const comparison = document.querySelector('.comparison');

    await init(comparison);

    expect(comparison.querySelector('.cta-row')).to.exist;
  });
});
