import { getLibs } from '../../scripts/utils.js';

async function createLocaleCheckboxes(prefixGroup) {
  const { createTag } = await import(`${getLibs()}/utils/utils.js`);

  return Object.keys(prefixGroup).map((key) => {
    const { prefix } = prefixGroup[key];
    const currLocale = prefix === '' ? 'en' : prefix;
    if (currLocale === 'langstore') return;
    const checkbox = createTag('input', { class: 'locale-checkbox', type: 'checkbox', id: `${currLocale}`, name: `${currLocale}` });
    const label = createTag('label', { class: 'locale-label', for: `${currLocale}` });
    label.innerText = `${currLocale}`;

    // eslint-disable-next-line consistent-return
    return createTag('div', { class: 'checkbox-wrapper' }, [checkbox, label]);
  });
}

export function parseUrlString(input) {
  const pairs = input.split('\n');

  return pairs.reduce((rdx, pairString) => {
    const pair = pairString.split('\t');
    rdx.push(pair);
    return rdx;
  }, []);
}

export function generateRedirectList(urls, locales) {
  return urls.reduce((rdx, urlPair) => {
    locales.forEach((locale) => {
      let from;
      let to;
      try {
        from = new URL(urlPair[0]);
      } catch (e) {
        console.warn(e);
        return;
      }
      try {
        to = new URL(urlPair[1]);
      } catch (e) {
        console.warn(e);
        return;
      }
      const fromPath = from.pathname.split('.html')[0];
      rdx.push([`/${locale}${fromPath}`, `${to.origin}/${locale}${to.pathname}`]);
    });
    return rdx;
  }, []);
}

export function stringifyListForExcel(urls) {
  return urls.reduce((rdx, url) => {
    // eslint-disable-next-line no-param-reassign
    rdx += `${url[0]}\t${url[1]}\n`;
    return rdx;
  }, '');
}

export default async function init(el) {
  const { createTag, getConfig } = await import(`${getLibs()}/utils/utils.js`);
  const config = getConfig();
  console.log(config);
  const xlPath = './locale-config.json';
  const resp = await fetch(xlPath);
  if (!resp.ok) return;
  const { data } = await resp.json();
  console.log(data);

  const checkBoxes = await createLocaleCheckboxes(data);
  const checkBoxesContainer = createTag('div', { class: 'checkbox-container' }, checkBoxes);

  const redirectsContainer = createTag('section', { class: 'redirects-container' });
  const textAreaInput = createTag('textarea', { class: 'redirects-input', id: 'redirects-input', name: 'redirects-input' });
  const taiLabel = createTag('label', { class: 'io-label', for: 'redirects-input' });
  taiLabel.innerText = 'Place urls here';
  const textAreaOutput = createTag('textarea', { class: 'redirects-input', id: 'redirects-output', name: 'redirects-output' });
  const taoLabel = createTag('label', { class: 'io-label', for: 'redirects-output' });
  taoLabel.innerText = 'Localized results appear here';
  const ioContainer = createTag('div', { class: 'io-container' });
  const submitButton = createTag('button', { class: 'process=redirects' });
  submitButton.innerText = 'Process Redirects';
  submitButton.addEventListener('click', () => {
    const locales = [...document.querySelectorAll("[type='checkbox']")].reduce((rdx, cb) => {
      if (cb.checked) {
        rdx.push(cb.id);
      }
      return rdx;
    }, []);

    const parsedInput = parseUrlString(textAreaInput.value);
    const redirList = generateRedirectList(parsedInput, locales);
    const outputString = stringifyListForExcel(redirList);

    textAreaOutput.value = outputString;
  });

  ioContainer.append(taiLabel, textAreaInput, taoLabel, textAreaOutput);
  redirectsContainer.append(ioContainer, submitButton);

  el.append(checkBoxesContainer, redirectsContainer);
}
