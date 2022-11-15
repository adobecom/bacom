import { getLibs } from '../../scripts/utils.js';

/**
 * @param {Element} el
 */
const init = async (el) => {
  const { createTag } = await import(`${getLibs()}/utils/utils.js`);

  const rows = Array.from(el?.querySelectorAll(':scope > div'));
  const headers = Array.from(rows.shift().children);

  const headersRow = createTag('tr');
  headers.forEach((cell) => {
    headersRow.appendChild(createTag('th', { scope: 'col' }, cell));
  });
  const thead = createTag('thead', {}, headersRow);

  const tbody = createTag('tbody');
  rows?.forEach((row, idx) => {
    const bodyRow = createTag('tr');
    const cells = Array.from(row?.querySelectorAll(':scope > div'));
    const headerCell = cells.shift();

    if (idx === rows.length - 1 && headerCell.textContent === '') {
      bodyRow.classList.add('cta-row');
    }
    bodyRow.appendChild(createTag('th', { class: '', scope: 'row' }, headerCell));
    cells.forEach((cell) => {
      bodyRow.appendChild(createTag('td', {}, cell));
    });
    tbody.appendChild(bodyRow);
  });

  const table = createTag('table');
  table.appendChild(thead);
  table.appendChild(tbody);
  const wrapper = createTag('div', { class: 'comparison-wrapper' }, table);
  el.appendChild(wrapper);
};

export default init;
