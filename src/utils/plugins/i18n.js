/* eslint-disable camelcase */
import { createI18n } from 'vue-i18n';

import moment from 'moment';

import pt_br from '@/locales/pt_br.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';

import('moment/dist/locale/es.js');
import('moment/dist/locale/pt-br.js');

moment.locale('en');

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
