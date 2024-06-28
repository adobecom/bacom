import { LIBS } from '../../scripts/scripts.js';

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
  const { createTag } = await import(`${LIBS}/utils/utils.js`);
  const module = await import(`${LIBS}/martech/attributes.js`);

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
