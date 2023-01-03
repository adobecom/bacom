export default function init(el) {
  const parentEl = el.parentElement;

  const blockBlockSelector = el.innerText.trim();
  console.log(blockBlockSelector);

  el.remove();

  const textBlock = parentEl.querySelector(`.${blockBlockSelector}`);
  const nextblock = parentEl.querySelector(`:scope > div:not(.${blockBlockSelector})`);

  const allNodes = parentEl.querySelectorAll(':scope > div');
  console.log(allNodes);

  if (allNodes.length > 2) return;

  allNodes.forEach((node, index, elements) => {
    if (node.classList.contains(blockBlockSelector) && index === 0) {
      //block on the left hand side
      node.classList.add('left-third');
      elements[1].classList.add('left-fill');
    } else if (node.classList.contains(blockBlockSelector) && index === 1) {
      //block on left 
      node.classList.add('right-third');
      elements[0].classList.add('right-fill');
    }
  })

  parentEl.classList.add('grid-third-layout');
  
}
