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

import { setLibs } from './utils.js';

const LIBS = '/libs';
const STYLES = ['/styles/styles.css', '/styles/faas.css'];
const CONFIG = {
  imsClientId: 'bacom',
  local: {
    pdfViewerClientId: '3b685312b5784de6943647df19f1f492',
    pdfViewerReportSuite: 'adbadobedxqa',
  },
  stage: {
    edgeConfigId: '7d1ba912-10b6-4384-a8ff-4bfb1178e869',
    pdfViewerClientId: '3b685312b5784de6943647df19f1f492',
    pdfViewerReportSuite: 'adbadobedxqa',
  },
  live: {
    pdfViewerClientId: '23bd4fff42fc4b4da38b3d89492a0abc',
    pdfViewerReportSuite: 'adbadobedxqa',
  },
  prod: {
    edgeConfigId: '65acfd54-d9fe-405c-ba04-8342d6782ab0',
    pdfViewerClientId: '4520c0edfbf147158758d71d18765fec',
    pdfViewerReportSuite: 'adbadobenonacdcprod,adbadobedxprod,adbadobeprototype',
  },
  locales: {
    // Americas
    ar: { ietf: 'es-AR', tk: 'oln4yqj.css' },
    br: { ietf: 'pt-BR', tk: 'inq1xob.css' },
    ca: { ietf: 'en-CA', tk: 'pps7abe.css' },
    ca_fr: { ietf: 'fr-CA', tk: 'vrk5vyv.css' },
    cl: { ietf: 'es-CL', tk: 'oln4yqj.css' },
    co: { ietf: 'es-CO', tk: 'oln4yqj.css' },
    la: { ietf: 'es-LA', tk: 'oln4yqj.css' },
    mx: { ietf: 'es-MX', tk: 'oln4yqj.css' },
    pe: { ietf: 'es-PE', tk: 'oln4yqj.css' },
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    // EMEA
    africa: { ietf: 'en', tk: 'pps7abe.css' },
    be_fr: { ietf: 'fr-BE', tk: 'vrk5vyv.css' },
    be_en: { ietf: 'en-BE', tk: 'pps7abe.css' },
    be_nl: { ietf: 'nl-BE', tk: 'cya6bri.css' },
    cy_en: { ietf: 'en-CY', tk: 'pps7abe.css' },
    dk: { ietf: 'da-DK', tk: 'aaz7dvd.css' },
    de: { ietf: 'de-DE', tk: 'vin7zsi.css' },
    ee: { ietf: 'et-EE', tk: 'aaz7dvd.css' },
    es: { ietf: 'es-ES', tk: 'oln4yqj.css' },
    fr: { ietf: 'fr-FR', tk: 'vrk5vyv.css' },
    gr_en: { ietf: 'en-GR', tk: 'pps7abe.css' },
    ie: { ietf: 'en-GB', tk: 'pps7abe.css' },
    il_en: { ietf: 'en-IL', tk: 'pps7abe.css' },
    it: { ietf: 'it-IT', tk: 'bbf5pok.css' },
    lv: { ietf: 'lv-LV', tk: 'aaz7dvd.css' },
    lt: { ietf: 'lt-LT', tk: 'aaz7dvd.css' },
    lu_de: { ietf: 'de-LU', tk: 'vin7zsi.css' },
    lu_en: { ietf: 'en-LU', tk: 'pps7abe.css' },
    lu_fr: { ietf: 'fr-LU', tk: 'vrk5vyv.css' },
    hu: { ietf: 'hu-HU', tk: 'aaz7dvd.css' },
    mt: { ietf: 'en-MT', tk: 'pps7abe.css' },
    mena_en: { ietf: 'en', tk: 'pps7abe.css' },
    nl: { ietf: 'nl-NL', tk: 'cya6bri.css' },
    no: { ietf: 'no-NO', tk: 'aaz7dvd.css' },
    pl: { ietf: 'pl-PL', tk: 'aaz7dvd.css' },
    pt: { ietf: 'pt-PT', tk: 'inq1xob.css' },
    ro: { ietf: 'ro-RO', tk: 'aaz7dvd.css' },
    sa_en: { ietf: 'en', tk: 'pps7abe.css' },
    ch_de: { ietf: 'de-CH', tk: 'vin7zsi.css' },
    si: { ietf: 'sl-SI', tk: 'aaz7dvd.css' },
    sk: { ietf: 'sk-SK', tk: 'aaz7dvd.css' },
    ch_fr: { ietf: 'fr-CH', tk: 'vrk5vyv.css' },
    fi: { ietf: 'fi-FI', tk: 'aaz7dvd.css' },
    se: { ietf: 'sv-SE', tk: 'fpk1pcd.css' },
    ch_it: { ietf: 'it-CH', tk: 'bbf5pok.css' },
    tr: { ietf: 'tr-TR', tk: 'aaz7dvd.css' },
    ae_en: { ietf: 'en', tk: 'pps7abe.css' },
    uk: { ietf: 'en-GB', tk: 'pps7abe.css' },
    at: { ietf: 'de-AT', tk: 'vin7zsi.css' },
    cz: { ietf: 'cs-CZ', tk: 'aaz7dvd.css' },
    bg: { ietf: 'bg-BG', tk: 'aaz7dvd.css' },
    ru: { ietf: 'ru-RU', tk: 'aaz7dvd.css' },
    ua: { ietf: 'uk-UA', tk: 'aaz7dvd.css' },
    il_he: { ietf: 'he', tk: 'nwq1mna.css', dir: 'rtl' },
    ae_ar: { ietf: 'ar', tk: 'nwq1mna.css', dir: 'rtl' },
    mena_ar: { ietf: 'ar', tk: 'dis2dpj.css', dir: 'rtl' },
    sa_ar: { ietf: 'ar', tk: 'nwq1mna.css', dir: 'rtl' },
    // Asia Pacific
    au: { ietf: 'en-AU', tk: 'pps7abe.css' },
    hk_en: { ietf: 'en-HK', tk: 'pps7abe.css' },
    in: { ietf: 'en-GB', tk: 'pps7abe.css' },
    id_id: { ietf: 'id', tk: 'czc0mun.css' },
    id_en: { ietf: 'en', tk: 'pps7abe.css' },
    my_ms: { ietf: 'ms', tk: 'sxj4tvo.css' },
    my_en: { ietf: 'en-GB', tk: 'pps7abe.css' },
    nz: { ietf: 'en-GB', tk: 'pps7abe.css' },
    ph_en: { ietf: 'en', tk: 'pps7abe.css' },
    ph_fil: { ietf: 'fil-PH', tk: 'ict8rmp.css' },
    sg: { ietf: 'en-SG', tk: 'pps7abe.css' },
    th_en: { ietf: 'en', tk: 'pps7abe.css' },
    in_hi: { ietf: 'hi', tk: 'aaa8deh.css' },
    th_th: { ietf: 'th', tk: 'aaz7dvd.css' },
    cn: { ietf: 'zh-CN', tk: 'puu3xkp' },
    hk_zh: { ietf: 'zh-HK', tk: 'jay0ecd' },
    tw: { ietf: 'zh-TW', tk: 'jay0ecd' },
    jp: { ietf: 'ja-JP', tk: 'dvg6awq' },
    kr: { ietf: 'ko-KR', tk: 'qjs5sfm' },
    vn_en: { ietf: 'en', tk: 'pps7abe.css' },
    vn_vi: { ietf: 'vi-VN', tk: 'jii8bki.css' },
    // Langstore Support.
    langstore: { ietf: 'en-US', tk: 'hah7vzn.css' },
  },
  geoRouting: 'on',
  productionDomain: 'business.adobe.com',
  prodDomains: ['business.adobe.com', 'www.adobe.com'],
  autoBlocks: [
    { iframe: 'https://adobe-ideacloud.forgedx.com' },
    { iframe: 'https://adobe.ideacloud.com' },
  ],
  htmlExclude: [
    /business\.adobe\.com\/(\w\w(_\w\w)?\/)?blog(\/.*)?/,
  ],
  useDotHtml: true,
};

const eagerLoad = (img) => {
  img?.setAttribute('loading', 'eager');
  img?.setAttribute('fetchpriority', 'high');
};

(async function loadLCPImage() {
  const marquee = document.querySelector('.marquee.split');
  if (marquee) {
    marquee.querySelectorAll('img').forEach(eagerLoad);
  } else {
    eagerLoad(document.querySelector('img'));
  }
}());

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

const miloLibs = setLibs(LIBS);

(function loadStyles() {
  const paths = [`${miloLibs}/styles/styles.css`];
  if (STYLES) {
    paths.push(...(Array.isArray(STYLES) ? STYLES : [STYLES]));
  }
  paths.forEach((path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  });
}());

(async function loadPage() {
  const { loadArea, loadLana, setConfig, createTag } = await import(`${miloLibs}/utils/utils.js`);
  const metaCta = document.querySelector('meta[name="chat-cta"]');
  if (metaCta && !document.querySelector('.chat-cta')) {
    const isMetaCtaDisabled = metaCta?.content === 'off';
    if (!isMetaCtaDisabled) {
      const chatDiv = createTag('div', { class: 'chat-cta meta-cta', 'data-content': metaCta.content });
      const lastSection = document.body.querySelector('main > div:last-of-type');
      if (lastSection) lastSection.insertAdjacentElement('beforeend', chatDiv);
    }
  }
  setConfig({ ...CONFIG, miloLibs });
  loadLana({ clientId: 'bacom' });
  await loadArea();
}());
