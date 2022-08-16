/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// This can be changed to 'https://milo.adobe.com/libs'
// if you don't have your /libs mapped to the milo origin.
const PROD_LIBS = '/libs';

const config = {
  imsClientId: 'bacom',
  projectRoot: `${window.location.origin}`,
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
    cn: { ietf: 'zh-CN', tk: 'puu3xkp' },
  },
};

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

function getMiloLibs() {
  const { hostname } = window.location;
  if (!hostname.includes('hlx.page')
    && !hostname.includes('hlx.live')
    && !hostname.includes('localhost')) return PROD_LIBS;
  const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
  return branch === 'local' ? 'http://localhost:6456/libs' : `https://${branch}.milo.pink/libs`;
}
config.miloLibs = getMiloLibs();

(async function loadStyle() {
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', `${config.miloLibs}/styles/styles.css`);
  document.head.appendChild(link);
}());

const {
  createTag,
  decorateArea,
  decorateNavs,
  getMetadata,
  loadLCP,
  loadArea,
  loadDelayed,
  loadTemplate,
  setConfig,
} = await import(`${config.miloLibs}/utils/utils.js`);

function fixFeaturedTemplate() {
  const template = getMetadata('template');
  if (template && template === 'Template sidebar') {
    document.head.querySelector('meta[content="Template sidebar"]').setAttribute('content', 'featured-story');
  }
}

(async function loadPage() {
  fixFeaturedTemplate();
  setConfig(config);

  if (decorateArea) {
    const blocks = decorateArea();
    const navs = decorateNavs();
    await loadLCP({ blocks });
    import(`${config.miloLibs}/utils/fonts.js`);
    loadTemplate();
    await loadArea({ blocks: [...navs, ...blocks] });
  } else {
    await loadArea();
  }
  const { default: loadModals } = await import(`${config.miloLibs}/blocks/modals/modals.js`);
  loadModals();
  loadDelayed();
}());
