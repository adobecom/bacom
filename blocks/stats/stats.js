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
* Stats for Customer Stories
*/

import { getLibs } from '../../scripts/utils.js';

async function decorateRow(row, module) {
  const { decorateLinkAnalytics } = module;
  const headers = row.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (!headers) return;
  headers.forEach((header) => {
    const sizes = ['xl', 'l', 'm', 's', 'xs', 'xs'];
    const expr = header.localName;
    const size = parseInt(expr[1], 10);
    header.classList.add(`heading-${sizes[size - 1]}`);
  });
  decorateLinkAnalytics(row, headers);
}

export default async function init(el) {
  const { createTag } = await import(`${getLibs()}/utils/utils.js`);
  const module = await import(`${getLibs()}/martech/attributes.js`);

  module.decorateBlockAnalytics(el);
  const firstRow = el.querySelector(':scope > div');
  const image = firstRow.querySelector(':scope picture');
  if (image || firstRow.innerText.trim() !== '') {
    firstRow.classList.add('stats-intro');
  } else {
    firstRow.remove();
  }
  const rows = el.querySelectorAll(':scope > div:not([class])');
  if (rows.length) {
    const stats = createTag('div', { class: 'stats-wrapper' });
    const solutions = createTag('div', { class: 'solutions-wrapper' });
    let statCount = 0;
    let solutionCount = 0;
    rows.forEach((row, i) => {
      const rowType = ((rows.length - 1) === i) ? 'solution' : 'stat';
      row.classList.add(rowType);
      decorateRow(row, module);
      if (rowType === 'stat') {
        stats.append(row);
        statCount += 1;
      } else {
        solutions.append(row);
        solutionCount += 1;
      }
    });
    const container = createTag('div', { class: 'stats-container' });
    stats.classList.add(`count-${statCount}`);
    solutions.classList.add(`count-${solutionCount}`);
    container.appendChild(stats);
    container.appendChild(solutions);
    el.insertAdjacentElement('beforeend', container);
  }
}
