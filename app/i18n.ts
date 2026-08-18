import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import mr from './locales/mr/translation.json';

const LANGUAGE_KEY = 'user_language';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr }
};

const initI18n = async () => {
  let savedLanguage = 'en';
  try {
    const lang = await SecureStore.getItemAsync(LANGUAGE_KEY);
    if (lang) savedLanguage = lang;
  } catch (e) {
    console.warn("Failed to load language from SecureStore");
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });
};

initI18n();

export default i18n;
