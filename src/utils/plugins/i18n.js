/* eslint-disable camelcase */
import { createI18n } from 'vue-i18n';

import pt_br from '@/locales/pt_br.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

const languages = {
  'pt-br': pt_br,
  en,
  es,
};

const messages = Object.assign(languages);

export default createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  silentTranslationWarn: true,
  silentFallbackWarn: true,
});
