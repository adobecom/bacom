import { getLibs } from '../../scripts/utils.js';

export default async function init(el) {
  const { createTag, parseEncodedConfig } = await import(`${getLibs()}/utils/utils.js`);
  const url = el.querySelector('a')?.href;
  const resp = await fetch(url);

  if (!resp?.ok) {
    window.lana?.log(`Error fetching data from url: ${url}`, { tags: 'info,faas-decode' });
    return;
  }

  const json = await resp.json();
  const { data } = json;
  const theadTr = createTag('tr');
  const pathLabel = createTag('th', null, 'Page Path');
  const titleLabel = createTag('th', null, 'Page Title');
  const templateLabel = createTag('th', null, 'Form Template');
  const typeLabel = createTag('th', null, 'Form Type');
  const subtypeLabel = createTag('th', null, 'Form Subtype');
  const ppiLabel = createTag('th', null, 'Primary Product Interest');
  const internalIDLabel = createTag('th', null, 'Internal Campaign ID');
  const onsightIDLabel = createTag('th', null, 'Onsight Campaign ID');
  const assetLabel = createTag('th', null, 'Last Asset');
  const responseLabel = createTag('th', null, 'Auto Response');
  const submitLabel = createTag('th', null, 'Auto Submit');
  const clearbitLabel = createTag('th', null, 'Clearbit Enabled');
  theadTr.append(
    pathLabel,
    titleLabel,
    templateLabel,
    typeLabel,
    subtypeLabel,
    ppiLabel,
    internalIDLabel,
    onsightIDLabel,
    assetLabel,
    responseLabel,
    submitLabel,
    clearbitLabel,
  );
  const thead = createTag('thead', null, theadTr);
  const table = createTag('table', null, thead);
  const tbody = createTag('tbody');

  data.forEach((page) => {
    const tr = createTag('tr');
    const pathLink = createTag('a', { href: page.path }, page.path);
    const path = createTag('td', null, pathLink);
    const title = createTag('td', null, page.title);
    tr.append(path, title);

    const config = page['faas-url'].split('#')[1];
    const faasData = config ? parseEncodedConfig(config) : null;

    if (faasData) {
      const template = createTag('td', null, faasData.id);
      const type = createTag('td', null, faasData.pjs92 || faasData.p.js[92]);
      const subtype = createTag('td', null, faasData.pjs93 || faasData.p.js[93]);
      const ppi = createTag('td', null, faasData.pjs94 || faasData.p.js[94]);
      const internalID = createTag('td', null, faasData.pjs36 || faasData.p.js[36]);
      const onsightID = createTag('td', null, faasData.pjs39 || faasData.p.js[39]);
      const asset = createTag('td', null, faasData[172] || faasData.p.js[172]);
      const response = createTag('td', null, faasData.ar);
      const submit = createTag('td', null, faasData.as);
      const clearbit = createTag('td', null, faasData.pc5 || faasData.pc[5]);
      tr.append(
        template,
        type,
        subtype,
        ppi,
        internalID,
        onsightID,
        asset,
        response,
        submit,
        clearbit,
      );
    } else {
      const error = createTag('td', null, 'Form data error');
      tr.append(error);
    }

    tbody.append(tr);
  });

  table.append(tbody);
  el.querySelector(':scope > div > div').append(table);
}
