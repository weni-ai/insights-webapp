import { createStore } from 'vuex';
import sidebar from './modules/sidebar';
import gpt from './modules/gpt';

const store = createStore({
  modules: {
    sidebar,
    gpt,
  },
});

export default store;
