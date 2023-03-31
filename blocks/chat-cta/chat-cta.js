export default async function init(el) {
  const block = el;
  const contentUrl = el.dataset?.content;

  if (contentUrl) {
    const resp = await fetch(contentUrl);
    if (!resp.ok) return;
    const text = await resp.text();
    if (text) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const ctaBody = doc.querySelector('.chat-cta > div');
      if (!ctaBody) return;
      block.append(ctaBody);
      const link = ctaBody.querySelector('a');
      const { pathname, hash } = new URL(link.href, window.location.origin);
      link.dataset.modalPath = pathname;
      link.dataset.modalHash = hash;
      link.href = hash;
      link.className = 'modal link-block';
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
