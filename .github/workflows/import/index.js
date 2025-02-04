import { DA_ORIGIN } from './constants.js';
import { replaceHtml, daFetch } from './daFetch.js';
import { mdToDocDom, docDomToAemHtml } from './converters.js';

// Run from the root of the project for local testing: node --env-file=.env .github/workflows/import/index.js
const EXTS = ['json', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'pdf'];

const toOrg = 'adobecom';
const toRepo = 'da-bacom';
const importFrom = "https://main--bacom--adobecom.aem.live"

export function calculateTime(startTime) {
  const totalTime = Date.now() - startTime;
  return `${String((totalTime / 1000) / 60).substring(0, 4)}`;
}

async function saveAllToDa(url, blob) {
  console.log("Starting DA import")
  const { destPath, editPath, route } = url;

  url.daHref = `https://da.live${route}#/${toOrg}/${toRepo}${editPath}`;

  const body = new FormData();
  body.append('data', blob);
  const opts = { method: 'PUT', body };

  try {
    const resp = await daFetch(`${DA_ORIGIN}/source/${toOrg}/${toRepo}${destPath}`, opts);
    return resp.status;
  } catch {
    console.log(`Couldn't save ${destPath}`);
    return 500;
  }
}

async function previewOrPublish({path, action}) {
  const previewUrl = `https://admin.hlx.page/${action}/${toOrg}/${toRepo}/main/${path}`;
  const opts = { method: 'POST' };
  const resp = await fetch(previewUrl, opts);
  if (!resp.ok) throw new Error(`Failed to post to preview: ${resp.statusText}`)
  console.log(`Posted to ${action} successfully ${action}/${toOrg}/${toRepo}/main/${path}`);
}

async function importUrl(url) {
  console.log("Started path: ", process.env.AEM_PATH);
  const [fromRepo, fromOrg] = url.hostname.split('.')[0].split('--').slice(1).slice(-2);
  if (!(fromRepo || fromOrg)) {
    url.status = '403';
    url.error = 'URL is not from AEM.';
    return;
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
      let html = replaceHtml(aemHtml, url.fromOrg, url.fromRepo);
      content = new Blob([html], { type: 'text/html' });
    }
    url.status = await saveAllToDa(url, content);
    console.log("imported resource to DA " + url.daHref);
    await previewOrPublish({path: pathname, action: 'preview'});
    await previewOrPublish({path: pathname, action: 'live'});
    console.log(`Resource: https://main--${toRepo}--${toOrg}.aem.live${url.pathname}`);
  } catch (e) {
    console.log("Failed to import resource to DA " + toOrg + "/" + toRepo + " | destination: " + url.pathname, + " | error: " + e.message);
    if (!url.status) url.status = 'error';
  }
}

importUrl(new URL(importFrom + process.env.AEM_PATH.replace(".md", "")));
