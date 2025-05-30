/*
 / My-Informatics-Journal - A project from Informatics class on 05/09/2025
 / Copyright (C) 2025 ChosenSoul
 /
 / This program is free software: you can redistribute it and/or modify
 / it under the terms of the GNU General Public License as published by
 / the Free Software Foundation, either version 3 of the License, or
 / (at your option) any later version.

 / This program is distributed in the hope that it will be useful,
 / but WITHOUT ANY WARRANTY; without even the implied warranty of
 / MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 / GNU General Public License for more details.

 / You should have received a copy of the GNU General Public License
 / along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
let animationIntervalId: NodeJS.Timeout | null = null;
const iconCache: { [id: string]: string } = {};

const icons = {
  light: {
    static: { id: 'light_static', url: 'assets/icon-light.png' },
    animation: [
      { id: 'light_anim_1', url: 'assets/anim_fav_light/1.png' },
      { id: 'light_anim_2', url: 'assets/anim_fav_light/2.png' },
      { id: 'light_anim_3', url: 'assets/anim_fav_light/3.png' },
      { id: 'light_anim_4', url: 'assets/anim_fav_light/4.png' },
      { id: 'light_anim_5', url: 'assets/anim_fav_light/5.png' },
      { id: 'light_anim_6', url: 'assets/anim_fav_light/6.png' },
      { id: 'light_anim_7', url: 'assets/anim_fav_light/7.png' },
      { id: 'light_anim_8', url: 'assets/anim_fav_light/8.png' },
      { id: 'light_anim_9', url: 'assets/anim_fav_light/9.png' },
      { id: 'light_anim_10', url: 'assets/anim_fav_light/10.png' },
      { id: 'light_anim_11', url: 'assets/anim_fav_light/11.png' },
    ],
  },
  dark: {
    static: { id: 'dark_static', url: 'assets/icon-dark.png' },
    animation: [
      { id: 'dark_anim_1', url: 'assets/anim_fav_dark/1.png' },
      { id: 'dark_anim_2', url: 'assets/anim_fav_dark/2.png' },
      { id: 'dark_anim_3', url: 'assets/anim_fav_dark/3.png' },
      { id: 'dark_anim_4', url: 'assets/anim_fav_dark/4.png' },
      { id: 'dark_anim_5', url: 'assets/anim_fav_dark/5.png' },
      { id: 'dark_anim_6', url: 'assets/anim_fav_dark/6.png' },
      { id: 'dark_anim_7', url: 'assets/anim_fav_dark/7.png' },
      { id: 'dark_anim_8', url: 'assets/anim_fav_dark/8.png' },
      { id: 'dark_anim_9', url: 'assets/anim_fav_dark/9.png' },
      { id: 'dark_anim_10', url: 'assets/anim_fav_dark/10.png' },
      { id: 'dark_anim_11', url: 'assets/anim_fav_dark/11.png' },
    ],
  },
};

const loadIconToBase64 = async (id: string, url: string): Promise<string> => {
  if (iconCache[id]) {
    return iconCache[id];
  }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load icon: ${url}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        iconCache[id] = base64;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error(`Failed to convert ${url} to base64`));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(error);
    return url;
  }
};

const stopAnimation = () => {
  if (animationIntervalId) {
    clearInterval(animationIntervalId);
    animationIntervalId = null;
  }
};

const startAnimation = async (link: HTMLLinkElement, frames: { id: string; url: string }[]) => {
  stopAnimation();
  let index = 0;

  const base64Frames = await Promise.all(
    frames.map(async (frame) => await loadIconToBase64(frame.id, frame.url))
  );

  animationIntervalId = setInterval(() => {
    link.href = base64Frames[index];
    index = (index + 1) % base64Frames.length;
  }, 90); // 90 мс = 11 кадров/с
};

const updateFavicon = async (isActive: boolean, theme: 'light' | 'dark') => {
  let faviconLink: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!faviconLink && document.head) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    document.head.appendChild(faviconLink);
  }

  if (!faviconLink) {
    console.error('Unable to create favicon link');
    return;
  }

  const effectiveTheme = theme === 'light' ? 'dark' : 'light';

  if (isActive) {
    stopAnimation();
    const staticIcon = icons[effectiveTheme].static;
    faviconLink.href = await loadIconToBase64(staticIcon.id, staticIcon.url);
  } else {
    await startAnimation(faviconLink, icons[effectiveTheme].animation);
  }
};

export default updateFavicon;