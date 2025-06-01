import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './Locales/ru.json';
import uk from './Locales/uk.json';
import en from './Locales/en.json';

const resources = {
  ru: { translation: ru.translation },
  uk: { translation: uk.translation },
  en: { translation: en.translation },
};

export const getCurrentLanguage = () => {
  const pathSegments = location.pathname.split('/');
  return pathSegments[1] || 'uk';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'uk',
    fallbackLng: 'uk',
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;