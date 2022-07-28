let miloLibs;
let miloBlocks;

export function getMiloLibs() {
  if (miloLibs) return miloLibs;
  const { hostname } = window.location;
  if (!hostname.includes('hlx.page')
    && !hostname.includes('hlx.live')
    && !hostname.includes('localhost')) return '/libs';
  const libsBranch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
  miloLibs = libsBranch === 'local' ? 'http://localhost:6456/libs' : `https://${libsBranch}.milo.pink/libs`;
  return miloLibs;
}

export async function getMiloBlocks() {
  if (miloBlocks) return miloBlocks;
  try {
    const { default: list } = await import(`${getMiloLibs()}/blocks/list.js`);
    return list;
  } catch (e) {
    window.lana.log('Couldn\'t load libs list');
    return [];
  }
}
