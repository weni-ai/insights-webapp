/* eslint-disable camelcase */
import { createI18n } from 'vue-i18n';

import IntlMessageFormat from 'intl-messageformat';
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

/**
 * ICU plural/select blocks must use IntlMessageFormat. Everything else keeps
 * Vue I18n syntax (@: links, modifiers, etc.).
 */
const messageCompiler = (message, { locale, key, onError }) => {
  if (typeof message === 'string') {
    const formatter = new IntlMessageFormat(message, locale);
    return (ctx) => {
      return formatter.format(ctx.values);
    };
  } else {
    onError && onError(new Error('not support for AST'));
    return () => key;
  }
};

export default createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  messageCompiler,
  globalInjection: true, // Enable $t in templates
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  missingWarn: false,
  fallbackWarn: false,
});
