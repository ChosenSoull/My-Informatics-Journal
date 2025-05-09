// favicon.ts

let lightIntervalId: number | null = null;
let darkIntervalId: number | null = null;

// Кеш для иконок
const iconCache: { [key: string]: string } = {};

const updateFavicon = (isActive: boolean, theme: 'light' | 'dark') => {
    let faviconLink: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
    }

    if (!isActive) {
        // Если страница неактивна, запускаем "анимацию"
        if (theme === 'dark') {
            startLightAnimation(faviconLink);
        } else {
            startDarkAnimation(faviconLink);
        }
    } else {
        // Если страница активна, останавливаем "анимацию" и устанавливаем статичную иконку
        stopAnimation();
        faviconLink.href = theme === 'dark' ? getCachedIcon('assets/icon_light.png') : getCachedIcon('assets/icon_dark.png');
        faviconLink.type = 'image/png';
    }
};

const startLightAnimation = (link: HTMLLinkElement) => {
    stopAnimation(); // Останавливаем предыдущую анимацию, если есть
    let index = 0;
    const lightFrames = [
        'assets/anim_fav_light/1.png',
        'assets/anim_fav_light/2.png',
        'assets/anim_fav_light/3.png',
        'assets/anim_fav_light/4.png',
        'assets/anim_fav_light/5.png',
        'assets/anim_fav_light/6.png',
        'assets/anim_fav_light/7.png',
        'assets/anim_fav_light/8.png',
        'assets/anim_fav_light/9.png',
        'assets/anim_fav_light/10.png',
        'assets/anim_fav_light/11.png'
    ];
    link.type = 'image/png'; // Устанавливаем тип как png
    lightIntervalId = window.setInterval(() => {
        if (!link) return;
        link.href = getCachedIcon(lightFrames[index]);
        index = (index + 1) % lightFrames.length;
    }, 50);
};

const startDarkAnimation = (link: HTMLLinkElement) => {
    stopAnimation(); // Останавливаем предыдущую анимацию, если есть
    let index = 0;
    const darkFrames = [
        'assets/anim_fav_dark/1.png',
        'assets/anim_fav_dark/2.png',
        'assets/anim_fav_dark/3.png',
        'assets/anim_fav_dark/4.png',
        'assets/anim_fav_dark/5.png',
        'assets/anim_fav_dark/6.png',
        'assets/anim_fav_dark/7.png',
        'assets/anim_fav_dark/8.png',
        'assets/anim_fav_dark/9.png',
        'assets/anim_fav_dark/10.png',
        'assets/anim_fav_dark/11.png'
    ];
    link.type = 'image/png'; // Устанавливаем тип как png
    darkIntervalId = window.setInterval(() => {
        if (!link) return;
        link.href = getCachedIcon(darkFrames[index]);
        index = (index + 1) % darkFrames.length;
    }, 50);
};

const stopAnimation = () => {
    if (lightIntervalId) {
        clearInterval(lightIntervalId);
        lightIntervalId = null;
    }
    if (darkIntervalId) {
        clearInterval(darkIntervalId);
        darkIntervalId = null;
    }
};

// Функция для получения иконки из кеша или возврата URL
const getCachedIcon = (url: string): string => {
    if (iconCache[url]) {
        return iconCache[url];
    } else {
        // В реальном приложении здесь была бы загрузка иконки в base64
        // Для простоты примера, мы просто возвращаем URL
        iconCache[url] = url; // Помещаем URL в кеш
        return url;
    }
};

export default updateFavicon;
