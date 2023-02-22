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

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */
/**
 * The decision engine for where to get Milo's libs from.
 */
export const [setLibs, getLibs] = (() => {
  let libs;
  return [
    (prodLibs) => {
      const { hostname } = window.location;
      if (!hostname.includes('hlx.page')
        && !hostname.includes('hlx.live')
        && !hostname.includes('localhost')) {
        libs = prodLibs;
      } else {
        const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
        if (branch === 'local') {
          libs = 'http://localhost:6456/libs';
        } else if (branch.indexOf('--') > -1) {
          libs = `https://${branch}.hlx.live/libs`;
        } else {
          libs = `https://${branch}--milo--adobecom.hlx.live/libs`;
        }
      }
      return libs;
    }, () => libs,
  ];
})();

/**
 *
 */
export async function loadChatCTA() {
  const { hostname } = window.location;
  const branch = hostname.includes('localhost') ? 'http://localhost:3000' : 'https://main--bacom--adobecom.hlx.page';
  const metaCta = document.querySelector('meta[name="chat-cta"]');
  const ctaPresent = !!document.querySelector('.chat-cta');
  const ctaExperienceUrl = metaCta.content;

  if (ctaPresent) {
    return;
  }

  if (!metaCta) {
    return;
  }

  if (!metaCta?.content || metaCta?.content === 'off') {
    return;
  }

  const { default: init, getCtaBody, libsDecorateCta } = await import('../blocks/chat-cta/chat-cta.js');
  if (!document.querySelector(`[href="${branch}/blocks/chat-cta/chat-cta.css"]`)) {
    const link = document.createElement('link');
    const href = `${branch}/blocks/chat-cta/chat-cta.css`;
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    document.head.appendChild(link);
  }

  const libsPath = getLibs();
  const ctaBody = await getCtaBody(ctaExperienceUrl);
  await libsDecorateCta(ctaBody, libsPath);
  init(ctaBody);
  document.querySelector('main').appendChild(ctaBody);
}
