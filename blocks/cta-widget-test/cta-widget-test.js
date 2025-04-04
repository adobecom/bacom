import { LIBS } from '../../scripts/scripts.js';

const CLOSE_ICON = `<svg id="close" viewBox="0 0 18 18">
    <path fill="currentcolor" d="M13.2425,3.343,9,7.586,4.7575,3.343a.5.5,0,0,0-.707,0L3.343,4.05a.5.5,0,0,0,0,.707L7.586,9,3.343,13.2425a.5.5,0,0,0,0,.707l.707.7075a.5.5,0,0,0,.707,0L9,10.414l4.2425,4.243a.5.5,0,0,0,.707,0l.7075-.707a.5.5,0,0,0,0-.707L10.414,9l4.243-4.2425a.5.5,0,0,0,0-.707L13.95,3.343a.5.5,0,0,0-.70711-.00039Z"/>
  </svg>`;

export default async function init(el) {
  const { createTag } = await import(`${LIBS}/utils/utils.js`);

  const [widgetDiv, cta1Div, cta2Div] = el.querySelectorAll(':scope > div');
  const widgetSection = createTag('button', { class: 'cta-widget', tabindex: '0' }, widgetDiv.querySelector('div'));
  const ctaSections = [cta1Div.querySelector('div'), cta2Div.querySelector('div')];
  const ctaSection = createTag('section', { class: 'cta-widget-body', tabindex: '0' }, ctaSections);
  const close = createTag('button', {
    class: 'widget-close',
    'aria-label': 'Close',
  }, CLOSE_ICON);
  const curtain = createTag('div', { class: 'cta-curtain' });

  ctaSections.forEach((section) => section.querySelector('a')?.classList.add('con-button', 'outline'));

  ctaSection.classList.add('hidden');
  ctaSection.prepend(close);
  curtain.classList.add('hidden');

  widgetSection.addEventListener('click', () => {
    ctaSection.classList.remove('hidden');
    curtain.classList.remove('hidden');
    widgetSection.classList.add('hidden');
  });

  close.addEventListener('click', () => {
    widgetSection.classList.remove('hidden');
    ctaSection.classList.add('hidden');
    curtain.classList.add('hidden');
  });

  el.after(ctaSection, widgetSection, curtain);
  el.remove();

  const widgetParent = ctaSection.parentElement;

  widgetParent?.classList.add('hide-until-ready');
  window.addEventListener('adobedx.conversations.ready', async () => {
    // The below await is to solve a timing issue witht he dialogue and the above event firing
    await new Promise((resolve) => { setTimeout(resolve, 2500); });
    widgetParent?.classList.remove('hide-until-ready');

    const chatNowButton = document.querySelectorAll('.cta-widget-body .con-button')[0];

    chatNowButton.addEventListener('click', (e) => {
      e.preventDefault();
      const mktoChatbotRoot = document.querySelector('#hb_chatbot-root');
      const mktoChatbotShadowRoot = mktoChatbotRoot.shadowRoot;
      const mktoChatbotButton = mktoChatbotShadowRoot.querySelector('.hb_button');

      widgetParent?.classList.add('hidden');
      mktoChatbotRoot.style.display = 'flex';
      mktoChatbotButton?.click();

      const resetButton = () => {
        const bigChatBox = mktoChatbotShadowRoot.querySelector('.hb_chat');
        if (bigChatBox.classList.contains('hb_shown')) {
          mktoChatbotRoot.style.display = 'none';
          widgetParent.classList.remove('hidden');
        }
      };

      mktoChatbotButton.addEventListener('click', resetButton);
    });
  });
}
