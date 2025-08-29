import { createApp } from 'vue';
import App from './App.vue';
import router from './scripts/router/router.script';
import store from './scripts/store/store.script';

const app = createApp(App)
    .use(router)
    .use(store)
    .mount('#app');
