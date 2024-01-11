import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { setLibs } from '../../../scripts/utils.js';

const {
  default: init,
  parseUrlString,
  generateRedirectList,
  stringifyListForExcel,
  SELECT_ALL_REGIONS,
  DESELECT_ALL_REGIONS,
} = await import('../../../blocks/redirects-formatter/redirects-formatter.js');
const { default: textAreaString } = await import('./mocks/textAreaValues.js');

setLibs('libs');

describe('Redirects Formatter', () => {
  beforeEach(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/redirects-formatter.html' });
  });

  it('correctly parses values from the input', () => {
    const parsedInput = parseUrlString(textAreaString);
    const firstPair = parsedInput[0];
    const lastPair = parsedInput[2];
    expect(firstPair[0]).to.equal('https://business.adobe.com/products/experience-manager/sites/experience-fragments.html');
    expect(firstPair[1]).to.equal('https://business.adobe.com/products/experience-manager/sites/omnichannel-experiences.html');
    expect(lastPair[0]).to.equal('https://business.adobe.com/products/experience-manager/sites/out-of-the-box-components.html');
    expect(lastPair[1]).to.equal('https://business.adobe.com/products/experience-manager/sites/developer-tools.html');
  });

  it('outputs localized urls', () => {
    const parsedInput = parseUrlString(textAreaString);
    const locales = ['ar', 'au', 'uk'];

    const redir = generateRedirectList(parsedInput, locales);
    expect(redir[0][0]).to.equal('/ar/products/experience-manager/sites/experience-fragments');
    expect(redir.length).to.equal(9);
  });

  it('provides a string formatted for pasting into excel', () => {
    const parsedInput = parseUrlString(textAreaString);
    const locales = ['ar', 'au', 'uk'];
    const redir = generateRedirectList(parsedInput, locales);
    const stringList = stringifyListForExcel(redir);

    expect(typeof stringList).to.equal('string');
    expect(stringList.substring(0, 4)).to.equal('/ar/');
    expect(stringList.substring((stringList.length - 6), stringList.length)).to.equal('.html\n');
  });

  it('selects/deselects all the checkboxes on click', async () => {
    const block = document.querySelector('.redirects-formatter');

    sinon.stub(window, 'fetch');
    const fetchText = await readFile({ path: './mocks/locale-config.json' });
    const res = new window.Response(fetchText, { status: 200 });
    window.fetch.returns(Promise.resolve(res));

    await init(block);

    const checkBoxes = document.querySelectorAll('.locale-checkbox');
    expect([...checkBoxes].every((cb) => !cb.checked)).to.be.true;

    const selectAllButton = block.querySelector('button');
    selectAllButton.click();

    expect([...checkBoxes].every((cb) => cb.checked)).to.be.true;
    expect(selectAllButton.innerText).to.equal(DESELECT_ALL_REGIONS);

    selectAllButton.click();
    expect([...checkBoxes].every((cb) => !cb.checked)).to.be.true;
    expect(selectAllButton.innerText).to.equal(SELECT_ALL_REGIONS);
  });
});
