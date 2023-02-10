const init = async (el) => {
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
