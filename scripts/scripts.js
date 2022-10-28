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

import { rewriteUrl, setLibs } from './utils.js';

const LIBS = '/libs';
const STYLES = '/styles/styles.css';
const CONFIG = {
  imsClientId: 'bacom',
  pdfViewerClientIdStage: '3b685312b5784de6943647df19f1f492',
  pdfViewerReportSuiteQA: 'adbadobedxqa',
  stage: { edgeConfigId: '7d1ba912-10b6-4384-a8ff-4bfb1178e869' },
  prod: { edgeConfigId: '65acfd54-d9fe-405c-ba04-8342d6782ab0' },
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
    kr: { ietf: 'ko-KR', tk: 'zfo3ouc' },
  },
};

// Default to loading the first image as eager.
(async function loadLCPImage() {
  const lcpImg = document.querySelector('img');
  if (lcpImg) {
    lcpImg.setAttribute('loading', 'eager');
  }
}());

// Temp Fix - Rewrite URLs for PDF and HTML
// https://github.com/adobe/helix-html-pipeline/issues/165
(async function rewriteUrls() {
  const links = document.querySelectorAll('a');
  links.forEach((a) => {
    a.href = rewriteUrl(a.href);
  });
}());

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

const miloLibs = setLibs(LIBS);

(function loadStyles() {
  const paths = [`${miloLibs}/styles/styles.css`];
  if (STYLES) { paths.push(STYLES); }
  paths.forEach((path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  });
}());

(async function loadPage() {
  const { loadArea, loadDelayed, setConfig } = await import(`${miloLibs}/utils/utils.js`);
  setConfig({ ...CONFIG, miloLibs });
  await loadArea();
  loadDelayed();
}());
