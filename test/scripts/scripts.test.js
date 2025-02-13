import { expect } from '@esm-bundle/chai';
import { setLibs, LIBS } from '../../scripts/scripts.js';

describe('Libs', () => {
  const tests = [
    ['https://business.adobe.com', '/libs'],
    ['https://business.adobe.com?milolibs=foo', '/libs'],
    ['https://business.stage.adobe.com', 'https://main--milo--adobecom.aem.live/libs'],
    ['https://business.stage.adobe.com?milolibs=foo', 'https://foo--milo--adobecom.aem.live/libs'],
    ['https://business.stage.adobe.com?milolibs=awesome--milo--forkedowner', 'https://awesome--milo--forkedowner.aem.live/libs'],
    ['https://main--bacom--adobecom.aem.page/', 'https://main--milo--adobecom.aem.live/libs'],
    ['https://main--bacom--adobecom.aem.page/?milolibs=foo', 'https://foo--milo--adobecom.aem.live/libs'],
    ['https://main--bacom--adobecom.aem.page/?milolibs=local', 'http://localhost:6456/libs'],
    ['https://main--bacom--adobecom.aem.page/?milolibs=awesome--milo--forkedowner', 'https://awesome--milo--forkedowner.aem.live/libs'],
    ['https://main--bacom--adobecom.aem.live/', 'https://main--milo--adobecom.aem.live/libs'],
    ['https://main--bacom--adobecom.aem.live/?milolibs=foo', 'https://foo--milo--adobecom.aem.live/libs'],
    ['https://main--bacom--adobecom.aem.live/?milolibs=local', 'http://localhost:6456/libs'],
    ['https://main--bacom--adobecom.aem.live/?milolibs=awesome--milo--forkedowner', 'https://awesome--milo--forkedowner.aem.live/libs'],
    ['http://localhost:3000', 'https://main--milo--adobecom.aem.live/libs'],
    ['http://localhost:3000?milolibs=foo', 'https://foo--milo--adobecom.aem.live/libs'],
    ['http://localhost:3000?milolibs=local', 'http://localhost:6456/libs'],
    ['http://localhost:3000?milolibs=awesome--milo--forkedowner', 'https://awesome--milo--forkedowner.aem.live/libs'],
  ];

  tests.forEach(([url, expected]) => {
    it(`Sets libs for ${url}`, () => {
      const location = new URL(url);
      const libs = setLibs(location);
      expect(libs).to.equal(expected);
    });
  });

  it('Sets LIBS', () => {
    expect(LIBS).to.equal('https://main--milo--adobecom.aem.live/libs');
  });
});
