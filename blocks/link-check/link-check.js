import { setLibs } from '../../scripts/utils.js';

const miloLibs = setLibs();
const { createTag } = await import(`${miloLibs}/utils/utils.js`);

const { html, render, useState, useEffect } = await import(`${miloLibs}/deps/htm-preact.js`);
const { Input } = await import(`${miloLibs}/ui/controls/formControls.js`);

const DEFAULT_ENTRY = '/be_en/resources/webinars/experience-makers-live';
const mdLinkRegex = /\[(.*?)\]\(.*?\)/g;

const getLinks = (content) => content.match(mdLinkRegex);

const syncScroll = (event) => {
  const { target } = event;
  const { scrollTop } = target;
  const parentEl = target.closest('.comparison');
  const nextEl = parentEl.nextElementSibling || parentEl.previousElementSibling;
  const scrollEl = nextEl?.querySelector('pre') || nextEl?.querySelector('ul');
  if (scrollEl) scrollEl.scrollTop = scrollTop;
};

const LinkCheck = ({ el, title, queryEntry }) => {
  const [entry, setEntry] = useState(queryEntry);

  useEffect(() => {
    window.history.pushState({}, '', `?entry=${entry}`);
    const { hostname } = window.location;
    const pageHost = hostname.includes('local') ? 'http://localhost:3000' : `https://${hostname}`;
    const pageUrl = `${pageHost}${entry.trim()}`;
    const liveUrl = `https://main--bacom--adobecom.hlx.live${entry.trim()}`;
    const pageMdUrl = pageUrl.endsWith('.md') ? pageUrl : `${pageUrl}.md`;
    const liveMdUrl = liveUrl.endsWith('.md') ? liveUrl : `${liveUrl}.md`;
    const compareUrl = el.querySelector('.compare-url');
    const compareLinks = el.querySelector('.compare-links');
    const compareMarkdown = el.querySelector('.compare-markdown');

    const pageLink = createTag('a', { href: pageUrl, target: '_blank' }, pageUrl);
    const liveLink = createTag('a', { href: liveUrl, target: '_blank' }, liveUrl);

    compareUrl.replaceChildren(pageLink, liveLink);
    compareLinks.replaceChildren();
    compareMarkdown.replaceChildren();

    Promise.all([fetch(pageMdUrl), fetch(liveMdUrl)])
      .then((responses) => Promise.all(responses.map((response) => response.text())))
      .then((texts) => {
        const pageLinks = getLinks(texts[0]);
        const liveLinks = getLinks(texts[1]);

        const pageLinkTitle = createTag('h3', {}, `Links: ${pageLinks.length}`);
        const liveLinkTitle = createTag('h3', {}, `Links: ${liveLinks.length}`);

        const pageLinkList = createTag('ul', {}, pageLinks.map((link) => createTag('li', { class: liveLinks.includes(link) ? 'match' : 'mismatch' }, link)));
        const liveLinkList = createTag('ul', {}, liveLinks.map((link) => createTag('li', { class: pageLinks.includes(link) ? 'match' : 'mismatch' }, link)));

        const pageCompare = createTag('div', { class: 'comparison' }, [pageLinkTitle, pageLinkList]);
        const liveCompare = createTag('div', { class: 'comparison' }, [liveLinkTitle, liveLinkList]);

        pageLinkList.addEventListener('scroll', syncScroll);
        liveLinkList.addEventListener('scroll', syncScroll);

        compareLinks.replaceChildren(pageCompare, liveCompare);
        el.appendChild(compareLinks);

        const pageContentTitle = createTag('h3', {}, `Markdown: ${texts[0].length}`);
        const liveContentTitle = createTag('h3', {}, `Markdown: ${texts[1].length}`);

        const pageMdLink = createTag('a', { href: pageMdUrl, target: '_blank' }, pageMdUrl);
        const liveMdLink = createTag('a', { href: liveMdUrl, target: '_blank' }, liveMdUrl);

        const pageContent = createTag('pre', {}, texts[0]);
        const liveContent = createTag('pre', {}, texts[1]);

        pageContent.addEventListener('scroll', syncScroll);
        liveContent.addEventListener('scroll', syncScroll);

        const pageMarkdown = createTag('div', { class: 'comparison' }, [pageContentTitle, pageMdLink, pageContent]);
        const liveMarkdown = createTag('div', { class: 'comparison' }, [liveContentTitle, liveMdLink, liveContent]);

        compareMarkdown.replaceChildren(pageMarkdown, liveMarkdown);
        el.appendChild(compareMarkdown);
      })
      .catch((error) => console.error('Error:', error, pageMdUrl, liveMdUrl));
  }, [entry]);

  return html`
    <h1>${title}</h1>
    <${Input} label="Entry" name="id" type="text" value=${entry} onChange=${(newValue) => setEntry(newValue)} isRequired="true" />
    <div class="comparisons">
      <div class="comparison"><h2>Page</h2></div>
      <div class="comparison"><h2>Live</h2></div>
    </div>
    <div class="comparisons compare-url"></div>
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
    <${LinkCheck} el=${el} title=${title} queryEntry=${entry} />
  `;

  render(app, el);
}
