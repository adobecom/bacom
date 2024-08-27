function decorateChatbot() {
  const chatbot = document.getElementById('hb_chatbot-root');

  if (!chatbot || document.querySelector('.close-sticky-section')) return false;

  if (document.querySelector('.sticky-bottom')) {
    chatbot.style.display = 'none';
    document.addEventListener('milo:sticky:closed', () => {
      chatbot.style.display = '';
    });
  }

  return true;
}

function handleAlloySendEvent() {
  console.log('alloy');
  if (decorateChatbot()) {
    console.log('chatbot decorated');
    window.removeEventListener('alloy_sendEvent', handleAlloySendEvent);
  }
}

export default function observeChatbot() {
  window.addEventListener('alloy_sendEvent', handleAlloySendEvent);
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.id === 'hb_chatbot-root') {
            console.log('Chatbot loaded');
            observer.disconnect();
            // decorateChatbot();
          }
        });
      }
    });
  });
  observer.observe(document.body, { childList: true });
}
