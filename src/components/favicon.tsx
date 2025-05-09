// favicon.ts
const updateFavicon = (theme: 'light' | 'dark') => {
    let faviconLink: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = theme === 'dark' ? 'assets/icon_light.png' : 'assets/icon_dark.png';
  };
  
  export default updateFavicon;