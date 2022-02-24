// Vue
import Vue from 'vue';
Vue.config.productionTip = false;

// App Router
import { router } from '@/router';
import '@/router/router-hooks';

// Vue Composition API
import VueCompositionAPI from '@vue/composition-api';
Vue.use(VueCompositionAPI);

// Vuetify
import vuetify from './plugins/vuetify';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
Vue.use(Vuetify);

// Axios
import axios from 'axios';
import VueAxios from 'vue-axios';
Vue.use(VueAxios, axios);

// App
import App from './app.vue';

new Vue({
  vuetify,
  router,
  render: (h) => h(App),
}).$mount('#app');
