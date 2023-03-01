export default async function init(el) {
  const block = el;

  if (el.dataset?.content) {
    const contentUrl = el.dataset.content;
    const resp = await fetch(contentUrl);
    if (!resp.ok) return;
    const text = await resp.text();
    if (text) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const ctaBody = doc.querySelector('.chat-cta > div');
      block.append(ctaBody);
    }
  }

  const cta = block.children[0].children[0];
  cta.classList.add('cta-chat-sticky');

  const a = cta.querySelector('a');
  a.classList.add('con-button', 'outline');

  window.addEventListener('milo:modal:loaded', () => {
    cta.classList.add('cta-hidden');
  });

  window.addEventListener('milo:modal:closed', () => {
    cta.classList.remove('cta-hidden');
  });
}
