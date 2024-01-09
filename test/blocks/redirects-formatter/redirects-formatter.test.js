import { expect } from '@esm-bundle/chai';

const { parseUrlString, generateRedirectList, stringifyListForExcel } = await import('../../../blocks/redirects-formatter/redirects-formatter.js');
const { default: textAreaString } = await import('./mocks/textAreaValues.js');

describe('Redirects Formatter', () => {
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
    console.log(redir);
    expect(redir[0][0]).to.equal('/ar/products/experience-manager/sites/experience-fragments');
    expect(redir.length).to.equal(9);
  });

  it('provides a string formatted for pasting into excel', () => {
    const parsedInput = parseUrlString(textAreaString);
    const locales = ['ar', 'au', 'uk'];
    const redir = generateRedirectList(parsedInput, locales);
    const stringList = stringifyListForExcel(redir);
    console.log(`${stringList}`);
  });
});
