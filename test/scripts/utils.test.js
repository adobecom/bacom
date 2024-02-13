import { expect } from '@esm-bundle/chai';
import { setLibs } from '../../scripts/utils.js';

describe('Libs', () => {
  it('Sets default Libs', () => {
    const libs = setLibs('/libs');
    expect(libs).to.equal('https://main--milo--adobecom.hlx.live/libs');
  });

  it('Does not support milolibs query param on prod', () => {
    const location = {
      hostname: 'business.adobe.com',
      search: '?milolibs=foo',
    };
    const libs = setLibs('/libs', location);
    expect(libs).to.equal('/libs');
  });

  it('Supports milolibs query param', () => {
    const location = {
      hostname: 'localhost',
      search: '?milolibs=foo',
    };
    const libs = setLibs('/libs', location);
    expect(libs).to.equal('https://foo--milo--adobecom.hlx.live/libs');
  });

  it('Supports milo stage libs with stage as host', () => {
    const location = {
      hostname: 'business.stage.adobe.com',
      search: '',
    };
    const libs = setLibs('/libs', location);
    expect(libs).to.equal('https://www.stage.adobe.com/libs');
  });

  it('Does not support milo stage libs on non prod stage hosts', () => {
    const location = {
      hostname: 'stage--bacom--adobecom.hlx.live',
      search: '',
    };
    const libs = setLibs('/libs', location);
    expect(libs).to.equal('https://main--milo--adobecom.hlx.live/libs');
  });

  it('Supports local milolibs query param', () => {
    const location = {
      hostname: 'localhost',
      search: '?milolibs=local',
    };
    const libs = setLibs('/libs', location);
    expect(libs).to.equal('http://localhost:6456/libs');
  });

  it('Supports forked milolibs query param', () => {
    const location = {
      hostname: 'localhost',
      search: '?milolibs=awesome--milo--forkedowner',
    };
    const libs = setLibs('/libs', location);
    expect(libs).to.equal('https://awesome--milo--forkedowner.hlx.live/libs');
  });
});
