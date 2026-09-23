/* eslint-disable camelcase */
import { createI18n } from 'vue-i18n';

import { setDefaultOptions } from 'date-fns';
import { enUS } from 'date-fns/locale';

import pt_br from '@/locales/pt_br.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import ro from '@/locales/ro.json';

import { icuMessageCompiler } from '@/utils/icuMessageCompiler';

setDefaultOptions({ locale: enUS });

const languages = {
  'pt-br': pt_br,
  en,
  es,
  ro,
};

const messages = Object.assign(languages);

export default createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  messageCompiler: icuMessageCompiler,
  globalInjection: true, // Enable $t in templates
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  missingWarn: false,
  fallbackWarn: false,
});
