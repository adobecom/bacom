import { LIBS } from '../../scripts/scripts.js';

const BACOM_HOSTS = ['localhost', '--bacom--adobecom.hlx.page', '--bacom--adobecom.hlx.live', 'business.adobe.com'];

export const isCurrentPage = (link) => {
  const currentPath = window.location.pathname.replace('.html', '');

  try {
    const url = new URL(link);
    const isBacomHost = url.host === '' || BACOM_HOSTS.some((bacomHost) => url.host.includes(bacomHost));

    if (isBacomHost && url.pathname.replace('.html', '') === currentPath) return true;
  } catch (e) {
    window.lana?.log(`Tree View error:${e.message}`, { tags: 'info,tree-view' });
  }

  return false;
};

const toggleSection = (menuitem) => {
  const subList = menuitem.querySelector('ul');
  const isHidden = subList.hidden;

  menuitem.setAttribute('aria-expanded', isHidden);
  subList.setAttribute('aria-expanded', isHidden);
  subList.hidden = !isHidden;
};

const buttonKeydown = (event) => {
  const { key, target } = event;
  const ul = target.closest('ul');
  const li = target.parentElement;

  if (key === 'ArrowDown' || key === 'ArrowRight') {
    event.preventDefault();

    const firstButton = ul.querySelector('button');
    const next = li.nextElementSibling?.querySelector('button') || firstButton;

    next.focus();
  }

  if (key === 'ArrowUp') {
    event.preventDefault();

    const lastItem = ul.querySelector(':scope > li:last-of-type');
    const prevItem = li.previousElementSibling || lastItem;

    if (prevItem.getAttribute('aria-expanded') === 'true') {
      prevItem.querySelector('li:last-child a').focus();
    } else {
      prevItem.querySelector('button').focus();
    }
  }

  if (key === 'ArrowLeft') {
    const lastItem = ul.querySelector(':scope > li:last-of-type');
    const prevItem = li.previousElementSibling || lastItem;

    prevItem.querySelector('button').focus();
  }

  if (key === 'Escape' && li.getAttribute('aria-expanded') === 'true') {
    toggleSection(li);
  }
};

const linkKeydown = (event) => {
  const { key, target } = event;
  const liTop = target.closest('li[role=menuitem]');
  const liSub = target.parentElement;

  if (key === 'ArrowUp') {
    event.preventDefault();

    const prevItem = liSub.previousElementSibling?.querySelector('a') || liTop.querySelector('button');

    prevItem.focus();
  }

  if (key === 'ArrowDown') {
    event.preventDefault();

    const menuitem = liTop.nextElementSibling || target.closest('.top-list');
    const nextItem = liSub.nextElementSibling?.querySelector('a') || menuitem.querySelector('button');

    nextItem.focus();
  }

  if (key === 'ArrowRight') {
    const menuitem = liTop.nextElementSibling || target.closest('.top-list');

    menuitem.querySelector('button').focus();
  }

  if (key === 'ArrowLeft') {
    const lastItem = target.closest('.top-list').querySelector(':scope > li:last-of-type');
    const menuitem = liTop.previousElementSibling || lastItem;

    menuitem.querySelector('button').focus();
  }

  if (key === 'Escape' && liTop.getAttribute('aria-expanded') === 'true') {
    toggleSection(liTop);
  }
};

const init = async (el) => {
  const topList = el.querySelector('ul');

  if (!topList) return;

  const { createTag } = await import(`${LIBS}/utils/utils.js`);
  const subLists = topList.querySelectorAll('ul');
  const isAccordion = subLists.length > 0;
  const links = el.querySelectorAll('a');
  const currentLinks = [...links].filter((link) => isCurrentPage(link));
  const pageTop = document.querySelector('header')?.offsetHeight ?? 0;
  const title = el.querySelector('h1, h2, h3, h4, h5, h6, p');
  let titleId = title?.id;

  if (!titleId) {
    const id = title.textContent.trim().replaceAll(' ', '-');
    title.id = id;
    titleId = id;
  }

  const nav = createTag('nav', { 'aria-labelledby': titleId }, ...el.children);

  el.append(nav);
  el.classList.add(`${isAccordion ? 'tree-view-accordion' : 'tree-view-simple'}`);
  topList.classList.add('top-list', 'body-s');
  title?.classList.add('title', 'heading-xs');

  if (currentLinks.length === 1) { currentLinks[0].classList.add('current-page'); }

  links.forEach((link) => {
    const anchor = link.href.split('#')?.[1];
    const target = anchor ? document.querySelector(`#${anchor}`) : null;

    if (target) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetPosition = target.getBoundingClientRect().top ?? 0;
        const offsetPosition = targetPosition + window.pageYOffset - pageTop;

        window.scrollTo(0, offsetPosition);
        target.setAttribute('tabindex', -1);
        target.focus();
      });
    }

    if (isAccordion) {
      link.role = 'menuitem';
      link.addEventListener('keydown', linkKeydown);
    }
  });

  if (isAccordion) {
    topList.role = 'menu';

    const topListItems = topList.querySelectorAll(':scope > li');

    topListItems.forEach((topListItem) => {
      topListItem.setAttribute('role', 'menuitem');
      topListItem.setAttribute('aria-haspopup', 'menu');
      topListItem.setAttribute('aria-expanded', false);

      const label = topListItem.textContent.split('\n')[0];
      const id = label.trim().replaceAll(' ', '-');
      const button = createTag('button', { id }, label);
      const subList = topListItem.querySelector('ul');

      topListItem.innerHTML = '';
      topListItem.append(button, subList);
      subList.role = 'menu';
      subList.setAttribute('aria-labelledby', id);
      subList.setAttribute('aria-expanded', false);
      subList.hidden = true;

      button.addEventListener('click', (event) => toggleSection(event.target.closest('li[role=menuitem]')));
      button.addEventListener('keydown', buttonKeydown);
    });

    const subListItems = topList.querySelectorAll('li ul li');

    subListItems.forEach((subListItem) => {
      subListItem.role = 'presentation';
    });
  }
};

export default init;
