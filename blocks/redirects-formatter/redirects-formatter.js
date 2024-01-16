import { getLibs } from '../../scripts/utils.js';

export const SELECT_ALL_REGIONS = 'Select All Regions';
export const DESELECT_ALL_REGIONS = 'De-select All Regions';

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
        // eslint-disable-next-line no-console
        console.warn(e);
        return;
      }
      try {
        to = new URL(urlPair[1]);
      } catch (e) {
        // eslint-disable-next-line no-console
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
  const { createTag } = await import(`${getLibs()}/utils/utils.js`);

  const xlPath = './locale-config.json';
  const resp = await fetch(xlPath);
  if (!resp.ok) return;
  const { data } = await resp.json();

  const redirectsContainer = createTag('section', { class: 'redirects-container' });

  // Header
  const header = createTag('h1');
  header.innerText = 'Redirect Formatting Tool';

  // Checkboxes
  const checkBoxesHeader = createTag('p', { class: 'cb-label' });
  checkBoxesHeader.innerText = 'Select Locales';
  const checkBoxes = await createLocaleCheckboxes(data);
  const checkBoxesContainer = createTag('div', { class: 'checkbox-container' }, checkBoxes);
  const selectAllCB = createTag('button', { class: 'select-all-cb' });
  selectAllCB.innerText = SELECT_ALL_REGIONS;
  const checkBoxesArea = createTag('section', { class: 'cb-area' }, [checkBoxesHeader, selectAllCB, checkBoxesContainer]);

  // Text input area
  const inputAreaContainer = createTag('section', { class: 'input-container' });
  const textAreaInput = createTag('textarea', { class: 'redirects-text-area', id: 'redirects-input', name: 'redirects-input' });
  const taiLabel = createTag('label', { class: 'io-label', for: 'redirects-input' });
  taiLabel.innerText = 'Place urls here';
  const submitButton = createTag('button', { class: 'process-redirects' });
  submitButton.innerText = 'Process Redirects';
  inputAreaContainer.append(taiLabel, submitButton, textAreaInput);

  // Text output Area
  const outputAreaContainer = createTag('section', { class: 'output-container' });
  const textAreaOutput = createTag('textarea', { class: 'redirects-text-area', id: 'redirects-output', name: 'redirects-output' });
  textAreaOutput.setAttribute('readonly', 'true');
  const taoLabel = createTag('label', { class: 'io-label', for: 'redirects-output' });
  taoLabel.innerText = 'Localized results appear here';
  const copyButton = createTag('button', { class: 'copy' });
  copyButton.innerText = 'Copy to clipboard';
  outputAreaContainer.append(taoLabel, copyButton, textAreaOutput);

  // Event listeners
  selectAllCB.addEventListener('click', () => {
    const allNotSelected = selectAllCB.innerText === SELECT_ALL_REGIONS;

    document.querySelectorAll('.locale-checkbox').forEach((cb) => {
      cb.checked = allNotSelected;
    });

    selectAllCB.innerText = allNotSelected ? DESELECT_ALL_REGIONS : SELECT_ALL_REGIONS;
  });

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

  copyButton.addEventListener('click', () => {
    if (!navigator?.clipboard) return;
    const redirects = textAreaOutput.value;
    navigator.clipboard.writeText(redirects).then(
      () => {
        copyButton.innerText = 'Copied';
        setTimeout(() => {
          copyButton.innerText = 'Copy to clipbaord';
        }, 1500);
      },
      () => {
        copyButton.innerText = 'Error!';
        setTimeout(() => {
          copyButton.innerText = 'Copy to clipbaord';
        }, 1500);
      },
    );
  });

  redirectsContainer.append(checkBoxesArea, inputAreaContainer, outputAreaContainer);
  el.append(header, redirectsContainer);
}
