function decorateChatbot(chatbot) {
  if (!chatbot || document.querySelector('.close-sticky-section')) return;

  if (document.querySelector('.sticky-bottom')) {
    chatbot.style.display = 'none';
    document.addEventListener('milo:sticky:closed', () => {
      chatbot.style.display = '';
    });
  }
}

export default function observeChatbot() {
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.id === 'hb_chatbot-root') {
            decorateChatbot(node);
            observer.disconnect();
          }
        });
      }
    });
  });
  observer.observe(document.body, { childList: true });
}
