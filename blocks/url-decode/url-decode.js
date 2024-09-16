import { LIBS } from '../../scripts/scripts.js';

const { createTag, getConfig, parseEncodedConfig } = await import(`${LIBS}/utils/utils.js`);
const { decodeCompressedString } = await import(`${LIBS}/blocks/caas/utils.js`);

const URL_COLUMN = 'caas-url';

/* c8 ignore next */
const delay = (milliseconds) => new Promise((resolve) => { setTimeout(resolve, milliseconds); });

export const loadQueryIndex = async (url) => {
  const queryData = [];
  const response = await fetch(url);

  if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);

  const json = await response.json();
  const { total, offset, limit, data } = json[':type'] === 'multi-sheet' ? json.sitemap : json;

  if (!Array.isArray(data)) throw new Error(`Invalid data format: ${url}`);

  queryData.push(...data);
  const remaining = total - offset - limit;

  /* c8 ignore next 7 */
  if (remaining > 0) {
    const nextUrl = new URL(url);
    nextUrl.searchParams.set('limit', limit);
    nextUrl.searchParams.set('offset', offset + limit);
    await delay(500);
    queryData.push(...await loadQueryIndex(nextUrl.toString()));
  }

  return queryData;
};

export const createTable = (data) => {
  const headersRow = createTag('tr');
  const headers = Object.keys(data[0]);
  headers.forEach((header) => {
    headersRow.append(createTag('th', { scope: 'col' }, header));
  });

  const thead = createTag('thead', null, headersRow);
  const tbody = createTag('tbody');

  data.forEach((row) => {
    const bodyRow = createTag('tr');
    headers.forEach((header) => {
      bodyRow.append(createTag('td', null, row[header]));
    });
    tbody.append(bodyRow);
  });

  const downloadData = encodeURIComponent(data.map((row) => Object.values(row).join(',')).join('\n'));
  const download = createTag('a', { href: `data:text/csv;charset=utf-8,${downloadData}`, download: 'data.csv' }, 'Download CSV');

  const table = createTag('table', null, [thead, tbody]);

  return createTag('div', null, [download, table]);
};

const sortValidLinks = (a, b) => {
  if (a.validLink === b.validLink) {
    return 0;
  } if (a.validLink === 'Yes') {
    return -1;
  }
  return 1;
};

async function fetchConfig(el, configColumn) {
  const report = el.querySelector('.report');
  const locale = el.querySelector('select#locale').value;
  const queryIndex = new URL(`${locale}/query-index.json`, window.location.origin);

  const indexLink = createTag('p', null, [
    'Fetching data from ',
    createTag('a', { href: queryIndex.href }, queryIndex.href),
  ]);
  report.replaceChildren(indexLink);

  let data = [];

  try {
    data = await loadQueryIndex(queryIndex.href);
  } catch (e) {
    /* c8 ignore next 4 */
    window.lana?.log(`Error fetching data from url: ${queryIndex.href}`, { tags: 'info,url-decode' });
    report.append(createTag('p', { class: 'error' }, 'Error fetching data'));
    return;
  }

  const decodedReports = data.map(async (page) => {
    const path = createTag('a', { href: page.path }, page.path);
    const encodedConfig = page[configColumn]?.split('#')[1] ?? '';

    if (!encodedConfig) return { path, validLink: 'No Config Found' };

    try {
      if (encodedConfig.startsWith('~~')) {
        const state = await decodeCompressedString(encodedConfig.substring(2));
        const validLink = Object.keys(state).length > 0;

        return { path, validLink: validLink ? 'Yes' : 'Empty Compressed Config' };
      }

      const state = parseEncodedConfig(encodedConfig);
      const validLink = Object.keys(state).length > 0;

      return { path, validLink: validLink ? 'Yes' : 'Empty Config' };
    } catch (e) {
      return { path, validLink: 'Could not decode link' };
    }
  });

  // const sortedData = reportData.sort(sortValidLinks);
  const reportData = await Promise.all(decodedReports);
  const sortedData = reportData.sort(sortValidLinks);

  const table = createTable(sortedData);
  report.append(table);
}

export default async function init(el) {
  const config = getConfig();

  const selectLabel = createTag('label', { for: 'locale' }, 'Select a locale:');
  const selectLocale = createTag('select', { name: 'locale', id: 'locale' });

  for (const locale of Object.keys(config.locales)) {
    const option = createTag('option', { value: locale }, locale || 'us');
    selectLocale.append(option);
  }

  const locale = createTag('div', { class: 'locale' }, [selectLabel, selectLocale]);
  const submit = createTag('button', { type: 'submit' }, 'Fetch Index');
  const options = createTag('div', { class: 'options' }, [locale, submit]);

  const report = createTag('div', { class: 'report' });

  el.replaceChildren(options, report);

  submit.addEventListener('click', async () => fetchConfig(el, URL_COLUMN));
}
