export default function init(el) {
  console.log(el,'Wahbahdoo');
  const pxSize = el.querySelector('div div');
  console.log(parseInt(pxSize.innerText));

  const myPx = `${parseInt(pxSize.innerText)}px`;
  pxSize.remove();

  const parent = el.parentElement;

  console.log(parent, parent.style.maxWidth);

  parent.style.width = myPx;
  parent.style.margin = "0 auto";

  const statsContainer = document.querySelector('.stats-container');
  statsContainer.style.width = myPx;
  const whiteColumns = document.querySelector('.white-columns .columns.contained');
  whiteColumns.style.width = myPx;
}
