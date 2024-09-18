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
      if (row[header] instanceof HTMLElement) {
        bodyRow.append(createTag('td', null, row[header]));
      } else {
        bodyRow.append(createTag('td', null, String(row[header])));
      }
    });
    tbody.append(bodyRow);
  });

  const downloadData = encodeURIComponent(data.map((row) => Object.values(row).join(',')).join('\n'));
  const download = createTag('a', { href: `data:text/csv;charset=utf-8,${downloadData}`, download: 'data.csv' }, 'Download CSV');

  const table = createTag('table', null, [thead, tbody]);

  return createTag('div', null, [download, table]);
};

export async function decodeUrl(url) {
  const encodedConfig = url.split('#')[1];
  if (!encodedConfig) return null;

  if (encodedConfig.startsWith('~~')) {
    const config = await decodeCompressedString(encodedConfig.substring(2));
    return config;
  }

  const config = parseEncodedConfig(encodedConfig);
  return config;
}

async function decodeUrls(data) {
  let encodedLinks = [];

  try {
    const parsed = JSON.parse(data);
    if (parsed) {
      encodedLinks = Array.isArray(parsed) ? parsed : [encodedLinks];
    }
  } catch (e) {
    if (data) encodedLinks = [data];
  }

  const decodedLinks = [];
  for (const link of encodedLinks) {
    try {
      const decodedLink = await decodeUrl(link);
      decodedLinks.push(decodedLink);
    } catch (e) {
      decodedLinks.push(null);
    }
  }

  return decodedLinks;
}

async function validateDecodedUrls(data, configColumn) {
  return Promise.all(data.map(async (page) => {
    const pageUrl = new URL(page.path, window.location.origin);
    if (!window.location.pathname.includes('.html')) {
      pageUrl.pathname = pageUrl.pathname.replace('.html', '');
    }

    const path = createTag('a', { href: pageUrl.href, target: '_blank' }, pageUrl.pathname);
    const configs = await decodeUrls(page[configColumn]);
    const count = configs.length;

    if (configs.length === 0) return { path, validation: 'No Config Found', count };

    for (const [i, config] of configs.entries()) {
      if (!config) return { path, validation: `Could not decode link ${i + 1}`, count };

      if (Object.keys(config).length === 0) return { path, validation: 'Empty Config', count };
    }

    return { path, validation: 'Valid', count };
  }));
}

async function generateReport(el, configColumn) {
  const report = el.querySelector('.report');
  const locale = el.querySelector('select#locale').value;
  const queryIndex = new URL(`${locale}/query-index.json`, window.location.origin);

  const indexLink = createTag('p', null, [
    'Fetching data from ',
    createTag('a', { href: queryIndex.href, target: '_blank' }, queryIndex.href),
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

  const decodedReports = await validateDecodedUrls(data, configColumn);

  const table = createTable(decodedReports);
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

  submit.addEventListener('click', async () => generateReport(el, URL_COLUMN));
}
