export default async function init() {
  const tabs = document.querySelectorAll('.tabList button');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const correspondingTabContent = tab.getAttribute('aria-controls');
      const content = document.querySelector(`#${correspondingTabContent}`);
      const rects = content.getBoundingClientRect();
      const topOffset = rects.top + window.scrollY;
      window.scrollTo({
        top: topOffset,
        behavior: 'smooth',
      });
    });
  });
}
