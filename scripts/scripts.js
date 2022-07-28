import { getMiloLibs, getMiloBlocks } from './milo.js';

const ROOT = '';

const MILO_LIBS = getMiloLibs();
const MILO_BLOCKS = await getMiloBlocks();

// Replace or add if you want your own styles.
const STYLES = `${MILO_LIBS}/styles/styles.css`;

const {
  decorateArea,
  decorateNavs,
  loadArea,
  loadLCP,
  loadStyle,
  loadDelayed,
} = await import(`${MILO_LIBS}/utils/utils.js`);

async function loadBlock(block) {
  const { status } = block.dataset;
  if (!status === 'loaded') return block;
  block.dataset.status = 'loading';
  const name = block.classList[0];
  const base = MILO_BLOCKS.includes(name) ? MILO_LIBS : ROOT;
  const styleLoaded = new Promise((resolve) => {
    loadStyle(`${base}/blocks/${name}/${name}.css`, resolve);
  });
  const scriptLoaded = new Promise((resolve) => {
    (async () => {
      try {
        const { default: init } = await import(`${base}/blocks/${name}/${name}.js`);
        await init(block);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(`Failed loading ${name}`, err);
      }
      resolve();
    })();
  });
  await Promise.all([styleLoaded, scriptLoaded]);
  delete block.dataset.status;
  const section = block.closest('.section[data-status]');
  if (section) {
    const decoratedBlock = section.querySelector(':scope > [data-status]');
    if (!decoratedBlock) { delete section.dataset.status; }
  }
  return block;
}

(async function loadPage() {
  await loadStyle(STYLES);
  await loadStyle(`${MILO_LIBS}/styles/variables.css`);
  const blocks = decorateArea();
  const navs = decorateNavs();
  await loadLCP({ blocks, loader: loadBlock });
  await loadArea({ blocks: [...navs, ...blocks], loader: loadBlock });
  const { default: loadModals } = await import(`${MILO_LIBS}/blocks/modals/modals.js`);
  loadModals();
  loadDelayed();
}());
