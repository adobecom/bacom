const waitForElement = (
  selector,
  {
    options = {
      childList: true,
      subtree: true,
    },
    rootEl = document.body,
    textContent = '',
  } = {},
) => new Promise((resolve) => {
  const el = document.querySelector(selector);

  if (el) {
    resolve(el);
    return;
  }

  const observer = new MutationObserver((mutations, obsv) => {
    mutations.forEach((mutation) => {
      const nodes = [...mutation.addedNodes];
      nodes.some((node) => {
        if (node.matches && node.matches(selector)) {
          if (textContent && node.textContent !== textContent) return false;

          obsv.disconnect();
          resolve(node);
          return true;
        }

        // check for child in added node
        const treeWalker = document.createTreeWalker(node);
        let { currentNode } = treeWalker;
        while (currentNode) {
          if (currentNode.matches && currentNode.matches(selector)) {
            obsv.disconnect();
            resolve(currentNode);
            return true;
          }
          currentNode = treeWalker.nextNode();
        }
        return false;
      });
    });
  });

  observer.observe(rootEl, options);
});

export default waitForElement;
