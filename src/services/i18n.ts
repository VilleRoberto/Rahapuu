import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fi from '../locales/fi.json';
import en from '../locales/en.json';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
      } else {
        callback('fi'); // Default to Finnish
      }
    } catch (error) {
      console.error('Language detection error:', error);
      callback('fi');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      console.error('Language save error:', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: {
      fi: {
        translation: fi,
      },
      en: {
        translation: en,
      },
    },
    fallbackLng: 'fi',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;