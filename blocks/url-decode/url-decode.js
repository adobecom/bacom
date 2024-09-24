import { LIBS } from '../../scripts/scripts.js';

const { createTag, getConfig, parseEncodedConfig } = await import(`${LIBS}/utils/utils.js`);
const { decodeCompressedString } = await import(`${LIBS}/blocks/caas/utils.js`);

const URL_COLUMN = 'caas-url';
const DEFAULT_LOCALE = 'us';

/* c8 ignore next */
const delay = (milliseconds) => new Promise((resolve) => { setTimeout(resolve, milliseconds); });

export const loadQueryIndex = async (url, callback = null) => {
  const queryData = [];
  const response = await fetch(url);

  if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);

  const json = await response.json();
  const { total, offset, limit, data } = json[':type'] === 'multi-sheet' ? json.sitemap : json;

  if (!Array.isArray(data)) throw new Error(`Invalid data format: ${url}`);

  queryData.push(...data);
  const remaining = total - offset - limit;
  callback?.(total - remaining, total);

  /* c8 ignore next 7 */
  if (remaining > 0) {
    const nextUrl = new URL(url);
    nextUrl.searchParams.set('limit', limit);
    nextUrl.searchParams.set('offset', offset + limit);
    await delay(500);
    queryData.push(...await loadQueryIndex(nextUrl.toString(), callback));
  }

  return queryData;
};

const sortByHeader = (data, header, invert) => {
  data.sort((a, b) => a[header].toString().localeCompare(b[header].toString()) * (invert ? -1 : 1));
};

export const createTable = (data, sortColumn = '', invert = false) => {
  const headersRow = createTag('tr');
  const headers = Object.keys(data[0]);

  if (sortColumn && headers.includes(sortColumn)) {
    sortByHeader(data, sortColumn, invert);
  }

  headers.forEach((header) => {
    const th = createTag('th', { scope: 'col' }, header);
    const sorted = header === sortColumn;
    if (sorted) {
      th.classList.add('sorted');
      th.classList.add(invert ? 'sorted-desc' : 'sorted-asc');
    }
    th.addEventListener('click', () => {
      const table = createTable(data, header, sorted && !invert);
      document.querySelector('.table').replaceWith(table);
    });
    headersRow.append(th);
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

  const table = createTag('table', null, [thead, tbody]);

  return createTag('div', { class: 'table' }, table);
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

async function validateUrls(data, configColumn) {
  return Promise.all(data.map(async (page) => {
    const pageUrl = new URL(page.path, window.location.origin);
    if (!window.location.pathname.includes('.html')) {
      pageUrl.pathname = pageUrl.pathname.replace('.html', '');
    }

    const path = createTag('a', { href: pageUrl.href, target: '_blank' }, pageUrl.pathname);
    const configs = await decodeUrls(page[configColumn]);
    const count = configs.length;

    if (configs.length === 0) return { path, valid: true, message: 'No links Found', count };

    for (const [i, config] of configs.entries()) {
      if (!config) return { path, valid: false, message: `Could not decode link ${i + 1}`, count };

      if (Object.keys(config).length === 0) return { path, valid: false, message: 'Empty link', count };
    }

    return { path, valid: true, message: 'Valid link(s) found', count };
  }));
}

async function generateReport(el, configColumn) {
  const report = el.querySelector('.report');
  const locale = el.querySelector('select#locale').value;
  const queryIndex = new URL(`${locale}/query-index.json`, window.location.origin);

  const queryLink = createTag('a', { href: queryIndex.href, target: '_blank' }, queryIndex.href);
  report.replaceChildren(createTag('p', null, ['Fetching data from ', queryLink]));

  let data = [];

  try {
    data = await loadQueryIndex(queryIndex.href, (offset, total) => {
      report.replaceChildren(createTag('p', null, ['Fetching data from ', queryLink, ` (${offset} of ${total})`]));
    });
  } catch (e) {
    /* c8 ignore next 4 */
    window.lana?.log(`Error fetching data from url: ${queryIndex.href}`, { tags: 'info,url-decode' });
    report.append(createTag('p', { class: 'error' }, 'Error fetching data'));
    return;
  }

  const isColumnMissing = !Object.keys(data[0]).includes(configColumn);
  const decodedReports = await validateUrls(data, configColumn);
  const results = decodedReports.reduce((acc, { valid, count }) => {
    acc.count += count;
    if (valid) {
      acc.valid += 1;
    } else {
      acc.invalid += 1;
    }
    return acc;
  }, { valid: 0, invalid: 0, count: 0 });
  const table = createTable(decodedReports);
  const summary = createTag('p', null, `Valid Pages: ${results.valid}, Invalid Pages: ${results.invalid}, Total Link Count: ${results.count}`);
  const error = createTag('p', { class: 'error' }, isColumnMissing ? 'Error: Update query index to include the "caas-url" column.' : '');
  const downloadData = encodeURIComponent(data.map((row) => Object.values(row).join(',')).join('\n'));
  const download = createTag('a', {
    href: `data:text/csv;charset=utf-8,${downloadData}`,
    download: `data-${locale || DEFAULT_LOCALE}.csv`,
  }, 'Download CSV');
  const ribbon = createTag('div', { class: 'ribbon' }, [summary, error, download]);

  report.append(ribbon, table);
}

function onSubmit(el) {
  return () => {
    const url = new URL(window.location.href);
    const title = document.title.split(' - ')[0];
    const locale = el.querySelector('select#locale').value || DEFAULT_LOCALE;

    url.searchParams.set('locale', locale);
    document.title = `${title} - ${locale}`;
    window.history.pushState({}, '', url);
    generateReport(el, URL_COLUMN);
  };
}

function updateResults(el) {
  const urlParams = new URLSearchParams(window.location.search);
  const queryLocale = urlParams.get('locale');
  const selectLocale = el.querySelector('select#locale');

  /* c8 ignore next 4 */
  if (queryLocale) {
    selectLocale.value = queryLocale === DEFAULT_LOCALE ? '' : queryLocale;
    generateReport(el, URL_COLUMN);
  }
}

export default async function init(el) {
  const config = getConfig();

  const selectLabel = createTag('label', { for: 'locale' }, 'Select a locale:');
  const selectLocale = createTag('select', { name: 'locale', id: 'locale' });

  for (const locale of Object.keys(config.locales)) {
    const option = createTag('option', { value: locale }, locale || DEFAULT_LOCALE);
    selectLocale.append(option);
  }

  const locale = createTag('div', { class: 'locale' }, [selectLabel, selectLocale]);
  const submit = createTag('button', { type: 'submit' }, 'Create Report');
  const options = createTag('div', { class: 'options' }, [locale, submit]);

  const report = createTag('div', { class: 'report' });

  el.replaceChildren(options, report);

  submit.addEventListener('click', onSubmit(el));
  window.addEventListener('popstate', () => { updateResults(el); });

  updateResults(el);
}
