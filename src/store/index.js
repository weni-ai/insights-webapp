import { createStore } from 'vuex';
import sidebar from './modules/sidebar';

const store = createStore({
  modules: {
    sidebar,
  },
});

export default store;