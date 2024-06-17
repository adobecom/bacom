export default async function init() {
  const tabOverrideStyles = `
    @media screen and (max-width: 600px) {
      .tablist-features-section .tabs div[role="tablist"] .tab-list-container {
        flex-direction: column;
      }

      .tablist-features-section .tabs div[role="tablist"] button[aria-selected="true"] {
        background: none;
        background-color: #d5d5d5;
      }

      .tablist-features-section .tabs.center div[role="tablist"] .tab-list-container {
        width: 100%;
        margin: 30px;
      }

      .tablist-features-section .tabs div[role="tablist"] button {
        border-radius: 0;
        font-size: 24px;
      }

      .tablist-features-section .tabs div[role="tablist"] {
        margin: 0;
        box-shadow: 0 -1px 0 inset var(--tabs-border-color);
      }
    }
  `;
  const tabsOverideStylesheet = document.createElement('style');
  tabsOverideStylesheet.textContent = tabOverrideStyles;
  document.head.append(tabsOverideStylesheet);

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
