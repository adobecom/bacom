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
const LINK_SELECTORS = [
  'a[href*="/fragments/"]',
  'a[href*=".mp4"]',
  'a[href*=".pdf"]',
  'a[href*=".svg"]',
  'img[alt*=".mp4"]',
];

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
  const linkedMedia = [...results].reduce((acc, a) => {
    let href = a.getAttribute('href') || a.getAttribute('alt');

    // Don't add any off origin content.
    const isSameDomain = prefixes.some((prefix) => href.startsWith(prefix));
    if (!isSameDomain) return acc;

    href = href.replace('.hlx.', '.aem.');

    // Match the URL and remove extras
    href = href.match(/^[^?#| ]+/)[0];

    // Convert relative to current project origin
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
    await importUrl(mediaUrl);
  }
}

async function saveAllToDa(url, blob) {
  console.log("Saving the document itself to DA")
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
  if (!resp.ok) throw new Error(`Failed to post to preview: ${resp.statusText}`)
  console.log(`Posted to ${action} successfully ${action}/${toOrg}/${toRepo}/main${path}`);
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

async function importUrl(url) {
  // Exclude auto publishing redirects for bacom https://jira.corp.adobe.com/browse/MWPW-173107
  if(url.pathname.includes("redirects.json")) {
    console.log("Stopped processing redirects.json");
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
      throw new Error('redir');
    }
    if (!resp.ok && resp.status !== 304) {
      url.status = 'error';
      throw new Error('error');
    }
    let content = isExt ? await resp.blob() : await resp.text();
    if (!isExt) {
      const aemHtml = docDomToAemHtml(mdToDocDom(content))
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
    console.log("Failed to import resource to DA " + toOrg + "/" + toRepo + " | destination: " + url.pathname, + " | error: " + e.message);
    if (!url.status) url.status = 'error';
    throw e;
  }
}

importUrl(new URL(importFrom + process.env.AEM_PATH.replace(".md", "")));
