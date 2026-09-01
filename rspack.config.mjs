import dotenv from 'dotenv';
import { defineWeniConfig } from '@weni/rspack-config';
import pkg from './package.json' with { type: 'json' };

dotenv.config();

const connectUrl = process.env.MODULE_FEDERATION_CONNECT_URL;

export default defineWeniConfig({
  dirname: import.meta.dirname,
  pkg,
  port: 3003,
  entry: './src/index.js',
  postcss: {
    prefix: '.insights-webapp',
  },
  federation: {
    name: 'insights',
    exposes: connectUrl
      ? {
          './main': './src/main.js',
          './dashboard-commerce': './src/views/insights/DashboardCommerce.vue',
          './locales/pt_br': './src/locales/pt_br.json',
          './locales/en': './src/locales/en.json',
          './locales/es': './src/locales/es.json',
        }
      : {},
    remotes: {
      connect: connectUrl,
    },
  },
});
