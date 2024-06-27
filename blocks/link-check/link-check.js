import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs();
const { createTag } = await import(`${miloLibs}/utils/utils.js`);

const { html, render, useState, useEffect } = await import(`${miloLibs}/deps/htm-preact.js`);
const { Input } = await import(`${miloLibs}/ui/controls/formControls.js`);

const DEFAULT_ENTRY = '/be_en/resources/webinars/experience-makers-live';

const LinkCheck = ({ title, queryEntry }) => {
  const [entry, setEntry] = useState(queryEntry);

  useEffect(() => {
    window.history.pushState({}, '', `?entry=${entry}`);

    const pageUrl = `https://main--bacom--adobecom.hlx.page${entry}.md`;
    const liveUrl = `https://main--bacom--adobecom.hlx.live${entry}.md`;

    const pageIframe = createTag('iframe', { src: pageUrl, style: 'width: 100%; height: 100vh;' });
    const liveIframe = createTag('iframe', { src: liveUrl, style: 'width: 100%; height: 100vh;' });

    const pageTitle = createTag('h2', {}, 'Page');
    const liveTitle = createTag('h2', {}, 'Live');

    const pageCompare = createTag('div', { class: 'comparison' }, [pageTitle, pageIframe]);
    const liveCompare = createTag('div', { class: 'comparison' }, [liveTitle, liveIframe]);

    const comparisons = document.querySelector('.comparisons');
    comparisons.innerHTML = '';
    comparisons.appendChild(pageCompare);
    comparisons.appendChild(liveCompare);
  }, [entry]);

  return html`
    <h1>${title}</h1>
    <${Input} label="Entry" name="id" type="text" value=${entry} onChange=${(newValue) => setEntry(newValue)} isRequired="true" />
    <div class="comparisons" style="display: flex;"></div>
  `;
};

export default async function init(el) {
  const children = Array.from(el.querySelectorAll(':scope > div'));
  const title = children[0].textContent.trim();
  el.innerHTML = '';
  // get entry from query string
  const urlParams = new URLSearchParams(window.location.search);
  const entry = urlParams.get('entry') || DEFAULT_ENTRY;

  const app = html`
    <${LinkCheck} title=${title} queryEntry=${entry} />
  `;

  render(app, el);
}
