import { DA_ORIGIN } from './constants.js';
import { replaceHtml, daFetch } from './daFetch.js';
import { mdToDocDom, docDomToAemHtml } from './converters.js';
import { JSDOM } from 'jsdom';

// Run from the root of the project for local testing: node --env-file=.env .github/workflows/import/index.js
const EXTS = ['json', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'pdf'];

const toOrg = 'adobecom';
const toRepo = 'da-bacom';
const importFrom = "https://main--bacom--adobecom.aem.live"
const liveDomain = "https://business.adobe.com";
const excludedFiles = ["/redirects.json", "/metadata.json", "/metadata-seo.json", "/redirects_fancy.json"];
const LINK_SELECTORS = [
  'a[href*="/fragments/"]',
  'a[href*=".mp4"]',
  'a[href*=".pdf"]',
  'a[href*=".svg"]',
  'img[alt*=".mp4"]',
];
// For any case where we need to find SVGs outside of any elements // in their text.
const LINK_SELECTOR_REGEX = /https:\/\/[^"'\s]+\.svg/g;

export function calculateTime(startTime) {
  const totalTime = Date.now() - startTime;
  return `${String((totalTime / 1000) / 60).substring(0, 4)}`;
}

async function importMedia(pageUrl, text) {
  // Determine commmon prefixes
  const aemLessOrigin = pageUrl.origin.split('.')[0];
  const prefixes = [aemLessOrigin];
  if (liveDomain) prefixes.push(liveDomain);

  const dom = new JSDOM(text)
  const results = dom.window.document.body.querySelectorAll(LINK_SELECTORS.join(', '));

  // TODO clean this up to be ready to be contributed to the DA-Importer
  // const pattern = /https:\/\/[^"'\s]+\.(?:svg|mp4|pdf)/g;
  // const results = text.match(pattern) ?
  const matches = text.match(LINK_SELECTOR_REGEX)?.map((svgUrl) => {
    const a = dom.window.document.createElement('a');
    a.href = svgUrl;
    return a;
  }) || [];

  const linkedMedia = [...results, ...matches].reduce((acc, a) => {
    let href = a.getAttribute('href') || a.getAttribute('alt');
    // Don't add any off origin content.
    const isSameDomain = prefixes.some((prefix) => href.startsWith(prefix));
    if (!isSameDomain) return acc;

    href = href.replace('.hlx.', '.aem.');

    [href] = href.match(/^[^?#| ]+/);

    const url = new URL(href);

    // Check if its already in our URL list
    const found = acc.some((existing) => existing.pathname === url.pathname);
    if (found) return acc;

    // Mine the page URL for where to send the file
    const { toOrg, toRepo } = pageUrl;

    url.toOrg = toOrg;
    url.toRepo = toRepo;

    acc.push(url);
    return acc;
  }, []);

  for (const mediaUrl of linkedMedia) {
    // This would be something such as
    // '/assets/videos/customer-success-stories/media_12c330631cac835def2ef03bc64ae94ee23cff8ef.mp4'
    console.log(`Importing media: ${mediaUrl.href}`);
    try {
      await importUrl(mediaUrl);
    } catch (error) {
      await slackNotification(
        `Failed importing media /${toOrg}/${toRepo}/main${mediaUrl.href}. Error: ${error.message}`
      );
    }
  }
}

async function saveAllToDa(url, blob) {
  const { destPath, editPath, route } = url;

  url.daHref = `https://da.live${route}#/${toOrg}/${toRepo}${editPath}`;

  const body = new FormData();
  body.append('data', blob);
  const opts = { method: 'PUT', body };

  // Convert underscores to hyphens
  const formattedPath = destPath.replaceAll('media_', 'media-');

  try {
    const resp = await daFetch(`${DA_ORIGIN}/source/${toOrg}/${toRepo}${formattedPath}`, opts);
    return resp.status;
  } catch {
    console.log(`Couldn't save ${destPath}`);
    return 500;
  }
}

async function previewOrPublish({path, action}) {
  const previewUrl = `https://admin.hlx.page/${action}/${toOrg}/${toRepo}/main${path}`;
  const opts = { method: 'POST' };
  const resp = await fetch(previewUrl, opts);
  if (!resp.ok){
    console.log(`Posting to ${action} failed. ${action}/${toOrg}/${toRepo}/main${path}`);
    await slackNotification(
      `Failed ${action}/${toOrg}/${toRepo}/main${path}. Error: ${resp.status} ${resp.statusText}`
    );
  } else {
    console.log(`Posted to ${action} successfully ${action}/${toOrg}/${toRepo}/main${path}`);
  }
}

const slackNotification = (text) => {
  return fetch(process.env.ROLLING_IMPORT_SLACK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })
};

// If an image in metadata starts with new line
// we'll need to remove the new line to prevent losing the reference to the img
// IMPORTANT: This currently not used as we only found this occuring on one page.
// It's still left in to enable in case we find more cases of this.
function safeguardMetadataImages(dom) {
  const metadata = dom.window.document.querySelector('.metadata')
  if (metadata) {
    metadata.querySelectorAll('div').forEach(row => {
      const metadataKey = row.querySelector('div:first-child')?.textContent.trim().toLowerCase();
      if (metadataKey === 'image') row.querySelectorAll('br')?.forEach(br => br.remove());
    });
  }
  const cardMetadata = dom.window.document.querySelector('.card-metadata')
  if (cardMetadata) {
    cardMetadata.querySelectorAll('div').forEach(row => {
      const metadataKey = row.querySelector('div:first-child')?.textContent.trim().toLowerCase();
      if (metadataKey === 'cardImage') row.querySelectorAll('br')?.forEach(br => br.remove());
    });
  }
}

async function importUrl(url) {
  // Exclude auto publishing files from Sharepoint
  if(excludedFiles.some((excludedFile => url.pathname === excludedFile))) {
    console.log(`Stopped processing ${url.pathname}`);
    return
  }

  console.log("Started path: ", url.href);
  const [fromRepo, fromOrg] = url.hostname.split('.')[0].split('--').slice(1).slice(-2);
  if (!(fromRepo || fromOrg)) {
    console.log(liveDomain, url.origin === liveDomain);
    if (url.origin !== liveDomain) {
      url.status = '403';
      url.error = 'URL is not from AEM.';
      return;
    }
  }
  
  url.fromRepo ??= fromRepo;
  url.fromOrg ??= fromOrg;
  
  const { pathname, href } = url;
  if (href.endsWith('.xml') || href.endsWith('.html') || href.includes('query-index')) {
    url.status = 'error';
    url.error = 'DA does not support XML, HTML, or query index files.';
    return;
  }
  

  const isExt = EXTS.some((ext) => href.endsWith(`.${ext}`));
  const path = href.endsWith('/') ? `${pathname}index` : pathname;
  const srcPath = isExt ? path : `${path}.md`;
  url.destPath = isExt ? path : `${path}.html`;
  url.editPath = href.endsWith('.json') ? path.replace('.json', '') : path;

  if (isExt) {
    url.route = url.destPath.endsWith('json') ? '/sheet' : '/media';
  } else {
    url.route = '/edit';
  }

  try {
    const resp = await fetch(`${url.origin}${srcPath}`);
    console.log("fetched resource from AEM at:", `${url.origin}${srcPath}`)
    if (resp.redirected && !(srcPath.endsWith('.mp4') || srcPath.endsWith('.png') || srcPath.endsWith('.jpg'))) {
      url.status = 'redir';
      console.log("Skipped importing redirected resource")
      return
    }
    if (!resp.ok && resp.status !== 304) {
      url.status = 'error';
      console.log(`Failed Status ${resp.status} /${toOrg}/${toRepo}/main${path}. Error: ${resp.status} ${resp.statusText}`)
      await slackNotification(
        `Failed Status ${resp.status} /${toOrg}/${toRepo}/main${path}. Error: ${resp.status} ${resp.statusText}`
      );
      return
    }
    let content = isExt ? await resp.blob() : await resp.text();
    if (!isExt) {
      const dom = mdToDocDom(content)
      // safeguardMetadataImages(dom);
      const aemHtml = docDomToAemHtml(dom)
      // Difference to nexter: "findFragments" alternative, since we always import on publish
      // we always import fragments when they are published, we don't need to discover them here
      // nexter uses "findFragments" to discover mp4/svg/pdf files though
      await importMedia(url, aemHtml) 
      let html = replaceHtml(aemHtml, url.fromOrg, url.fromRepo);
      content = new Blob([html], { type: 'text/html' });
    }
    url.status = await saveAllToDa(url, content);
    console.log("imported resource to DA " + url.daHref);
    await previewOrPublish({path: pathname, action: 'preview'});
    await previewOrPublish({path: pathname, action: 'live'});
    console.log(`Resource: https://main--${toRepo}--${toOrg}.aem.live${url.pathname}`);
  } catch (e) {
    await slackNotification(`Resource: https://main--${toRepo}--${toOrg}.aem.live${url.pathname} failed to publish. Error: ${e.message}`);
    console.log("Failed to import resource to DA " + toOrg + "/" + toRepo + " | destination: " + url.pathname + " | error: " + e.message);
    if (!url.status) url.status = 'error';
    throw e;
  }
}

importUrl(new URL(importFrom + process.env.AEM_PATH.replace(".md", "")));
