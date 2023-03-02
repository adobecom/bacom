const PREVIEW_LENGTH = 75;
const READ_MORE = 'Read more';

const init = (el) => {
  const rows = el?.querySelectorAll(':scope > div');

  rows?.forEach((row) => {
    row?.classList.add('speaker');

    const columns = row?.querySelectorAll(':scope > div');
    const name = columns?.[1];
    const desc = columns?.[2];
    const descHtml = desc?.innerHTML;
    const readMore = columns?.[3];
    const readMoreText = readMore?.innerText || READ_MORE;

    name?.classList.add('name');
    name?.querySelector('h1, h2, h3, h4, h5, h6')?.classList.add('body-s');
    desc?.classList.add('desc');
    readMore?.remove();

    if (descHtml?.length > PREVIEW_LENGTH) {
      const preview = descHtml.slice(0, PREVIEW_LENGTH);
      const button = document.createElement('button');

      button.innerText = readMoreText;
      button.addEventListener('click', (event) => {
        event.target.parentElement.innerHTML = descHtml;
      });
      desc.innerHTML = `${preview}<span class="ellipsis">...</span>`;
      desc.appendChild(button);
    }

    const section = document.createElement('section');

    section.classList.add('text', 'body-xs');
    name.parentNode.insertBefore(section, name);
    section.append(name, desc);
  });
};

export default init;
