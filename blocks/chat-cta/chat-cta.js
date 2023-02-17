export async function getBlockBody(url, libsPath) {
  const { decorateAutoBlock, getConfig } = await import(`${libsPath}/utils/utils.js`);
  const { default: loadIcons } = await import(`${libsPath}/features/icons.js`);
  const config = getConfig();
  const parser = new DOMParser();

  const cta = await fetch(url)
    .then((resp) => resp.text())
    .then((text) => parser.parseFromString(text, 'text/html'))
    .then((doc) => doc.querySelector('.chat-cta'))
    .catch((err) => console.log(err, 'Failed to load cta'));

  if (!cta) {
    return null;
  }

  cta.classList.add('cta-loaded', 'section');

  document.querySelector('main').appendChild(cta);
  const domIcons = cta.querySelectorAll('span.icon');
  loadIcons(domIcons, config);
  const fragment = cta.querySelector('a');
  decorateAutoBlock(fragment);
  return cta;
}

const init = async (el) => {
  if (el === null) {
    return;
  }

  const cta = el.children[0].children[0];
  cta.classList.add('cta-chat-sticky');

  const a = cta.querySelector('a');
  a.classList.add('con-button', 'outline');

  window.addEventListener('milo:modal:loaded', () => {
    cta.classList.add('cta-hidden');
  });

  window.addEventListener('milo:modal:closed', () => {
    cta.classList.remove('cta-hidden');
  });
};

export default init;
