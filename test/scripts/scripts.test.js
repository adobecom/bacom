import { readFile, setViewport } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs, LIBS, getLCPImages } from '../../scripts/scripts.js';

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

const marqueeByDeviceBody = await readFile({ path: './mocks/marquee-by-device.html' });
const heroMarqueeByDeviceBody = await readFile({ path: './mocks/hero-marquee-by-device.html' });

describe('getLCPImages', () => {
  it('Gets background image from marquee', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/marquee.html' });
    await setViewport({ width: 1400, height: 700 });
    const lcpImages = getLCPImages(document);
    expect(lcpImages[0]).to.equal(document.querySelector('#correct-image'));
  });

  it('Gets foreground image from marquee if no background for width', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/marquee-foreground.html' });
    await setViewport({ width: 400, height: 200 });
    const lcpImages = getLCPImages(document);
    expect(lcpImages[0]).to.equal(document.querySelector('#mobile-image'));
  });

  it('Gets mobile background image from marquee', async () => {
    document.body.innerHTML = marqueeByDeviceBody;
    await setViewport({ width: 400, height: 200 });
    const lcpImages = getLCPImages(document);
    expect(lcpImages[0]).to.equal(document.querySelector('#mobile-image'));
  });

  it('Gets tablet background image from marquee', async () => {
    document.body.innerHTML = marqueeByDeviceBody;
    await setViewport({ width: 900, height: 400 });
    const lcpImages = getLCPImages(document);
    expect(lcpImages[0]).to.equal(document.querySelector('#tablet-image'));
  });

  it('Gets desktop background image from marquee', async () => {
    document.body.innerHTML = marqueeByDeviceBody;
    await setViewport({ width: 1400, height: 700 });
    const lcpImages = getLCPImages(document);
    expect(lcpImages[0]).to.equal(document.querySelector('#desktop-image'));
  });

  it('Gets mobile background image from hero marquee', async () => {
    document.body.innerHTML = heroMarqueeByDeviceBody;
    await setViewport({ width: 400, height: 200 });
    const lcpImages = getLCPImages(document);
    expect(lcpImages[0]).to.equal(document.querySelector('#mobile-image'));
  });

  it('Gets tablet background image from hero marquee', async () => {
    document.body.innerHTML = heroMarqueeByDeviceBody;
    await setViewport({ width: 900, height: 400 });
    const lcpImages = getLCPImages(document);
    expect(lcpImages[0]).to.equal(document.querySelector('#tablet-image'));
  });

  it('Gets desktop foreground image from hero marquee', async () => {
    document.body.innerHTML = heroMarqueeByDeviceBody;
    await setViewport({ width: 1400, height: 700 });
    const lcpImages = getLCPImages(document);
    expect(lcpImages[0]).to.equal(document.querySelector('#desktop-image'));
  });

  it('Gets background image from section', async () => {
    document.body.innerHTML = await readFile({ path: './mocks/section.html' });
    const lcpImages = getLCPImages(document);
    expect(lcpImages[0]).to.equal(document.querySelector('#correct-image'));
  });
});
