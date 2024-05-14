import { createStore } from 'vuex';
import sidebar from './modules/sidebar';
import gpt from './modules/gpt';
import resizableBar from './modules/resizableBar';

const store = createStore({
  modules: {
    sidebar,
    gpt,
    resizableBar,
  },
});

export default store;
