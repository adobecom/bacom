const grid12Col = 'grid-12-columns';

function getLayoutSizes(el) {
  console.log(el.innerText);
  const layoutSizeString = el.innerText.trim();
  const layoutSizes = layoutSizeString.split(',');

  const layoutSum = layoutSizes.reduce((total, number) => {
    return total += parseInt(number);
  }, 0);

  if (layoutSum !== 12) return;

  return layoutSizes;
}

function sizesAndNodesParityWarning(node) {
  const warn = document.createElement('p');
  warn.classList.add('grid-warning');
  warn.innerText = 'Please make sure you have as many blocks as you have numbers for the layout sizes';
  node.appendChild(warn);
}

function greaterThan12Warning(node) {
  const warn = document.createElement('p');
  warn.classList.add('grid-warning');
  warn.innerText = 'The numbers in the block need to add to 12, and be comma seperated';
  node.appendChild(warn);
}

function setGridCols(sizes, nodes) {
  const gridColStart = 1;
  const gridColEnd = 13;
  let columnLeftOff;

  if (sizes.length !== nodes.length) {
    sizesAndNodesParityWarning(nodes[0].parentElement);
    return;  
  }

  const lastIndex = sizes.length - 1;
  
  sizes.forEach((size, index) => {
    if (index === 0) {
      console.log('in first if');
      const colEnd = parseInt(size) + 1;
      const gridString = `${gridColStart} / ${colEnd}`;
      nodes[index].style.gridColumn = gridString;
      columnLeftOff = colEnd;
    } else if (index === lastIndex) {
      console.log('in last if');
      const gridString = `${columnLeftOff} / ${gridColEnd}`;
      console.log(gridString);
      nodes[index].style.gridColumn = gridString;
    } else {
      console.log('in else');
      const gridString = `${columnLeftOff} / ${parseInt(columnLeftOff) + parseInt(size)}`;
      console.log(gridString);
      nodes[index].style.gridColumn = gridString;
      columnLeftOff = parseInt(columnLeftOff) + parseInt(size);
    }
  })
}

export default function init(el) {
  console.log('adv pos');

  const section = el.parentElement;

  section.classList.add(grid12Col);
  el.remove();

  const sizes = getLayoutSizes(el);
  const nodes = section.querySelectorAll(':scope > div');
  console.log(sizes, nodes, sizes.length, nodes.length);

  setGridCols(sizes, nodes);



}
