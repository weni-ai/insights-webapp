import { createStore } from 'vuex';
import sidebar from './modules/sidebar';
import gpt from './modules/gpt';
import resizableBar from './modules/resizableBar';
import config from './modules/config';

const store = createStore({
  modules: {
    sidebar,
    gpt,
    resizableBar,
    config,
  },
});

export default store;
