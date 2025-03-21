import { createStore } from 'vuex';
import config from './modules/config';
import dashboards from './modules/dashboards';
import reports from './modules/reports';
import project from './modules/project';
import widgets from './modules/widgets.ts';
import onboarding from './modules/onboarding';
import user from './modules/user';
import gpt from './modules/gpt';
import metaTemplateMessage from './modules/templates/metaTemplateMessage';

const store = createStore({
  modules: {
    config,
    dashboards,
    reports,
    project,
    widgets,
    onboarding,
    user,
    gpt,
    metaTemplateMessage,
  },
});

export default store;
