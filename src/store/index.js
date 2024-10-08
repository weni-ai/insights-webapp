import { createStore } from 'vuex';
import sidebar from './modules/sidebar';
import gpt from './modules/gpt';
import resizableBar from './modules/resizableBar';
import config from './modules/config';
import dashboards from './modules/dashboards';
import reports from './modules/reports';
import project from './modules/project';
import widgets from './modules/widgets.ts';
import onboarding from './modules/onboarding';
import user from './modules/user';

const store = createStore({
  modules: {
    sidebar,
    gpt,
    resizableBar,
    config,
    dashboards,
    reports,
    project,
    widgets,
    onboarding,
    user,
  },
});

export default store;
