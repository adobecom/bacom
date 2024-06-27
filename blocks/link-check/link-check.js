import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs();
const { createTag } = await import(`${miloLibs}/utils/utils.js`);

const { html, render, useState, useEffect } = await import(`${miloLibs}/deps/htm-preact.js`);
const { Input } = await import(`${miloLibs}/ui/controls/formControls.js`);

const DEFAULT_ENTRY = '/be_en/resources/webinars/experience-makers-live';
const mdLinkRegex = /\[(.*?)\]\(.*?\)/g;

const getLinks = (content) => content.match(mdLinkRegex);

const LinkCheck = ({ title, queryEntry }) => {
  const [entry, setEntry] = useState(queryEntry);

  useEffect(() => {
    window.history.pushState({}, '', `?entry=${entry}`);

    const { hostname } = window.location;
    const pageHost = hostname.includes('local') ? 'http://localhost:3000' : `https://${hostname}`;
    const pageUrl = `${pageHost}${entry}.md`;
    const liveUrl = `https://main--bacom--adobecom.hlx.live${entry}.md`;
    const compareLinks = document.querySelector('.compare-links');
    const compareMarkdown = document.querySelector('.compare-markdown');

    compareMarkdown.innerHTML = '';
    compareLinks.innerHTML = '';

    Promise.all([fetch(pageUrl), fetch(liveUrl)])
      .then((responses) => Promise.all(responses.map((response) => response.text())))
      .then((texts) => {
        const pageLinks = getLinks(texts[0]);
        const liveLinks = getLinks(texts[1]);

        const pageTitle = createTag('h3', {}, `Links: ${pageLinks.length}`);
        const liveTitle = createTag('h3', {}, `Links: ${liveLinks.length}`);

        const pageLinkList = createTag('ul', {}, pageLinks.map((link) => createTag('li', {}, link)));
        const liveLinkList = createTag('ul', {}, liveLinks.map((link) => createTag('li', {}, link)));

        const pageCompare = createTag('div', { class: 'comparison' }, [pageTitle, pageLinkList]);
        const liveCompare = createTag('div', { class: 'comparison' }, [liveTitle, liveLinkList]);

        compareLinks.appendChild(pageCompare);
        compareLinks.appendChild(liveCompare);

        const pageMarkdown = createTag('div', { class: 'comparison' }, createTag('pre', {}, texts[0]));
        const liveMarkdown = createTag('div', { class: 'comparison' }, createTag('pre', {}, texts[1]));

        compareMarkdown.appendChild(pageMarkdown);
        compareMarkdown.appendChild(liveMarkdown);
      })
      .catch((error) => console.error('Error:', error, pageUrl, liveUrl));
  }, [entry]);

  return html`
    <h1>${title}</h1>
    <${Input} label="Entry" name="id" type="text" value=${entry} onChange=${(newValue) => setEntry(newValue)} isRequired="true" />
    <div class="comparisons compare-titles">
      <div class="comparison"><h2>Page</h2></div>
      <div class="comparison"><h2>Live</h2></div>
    </div>
    <div class="comparisons compare-links"></div>
    <div class="comparisons compare-markdown"></div>
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
