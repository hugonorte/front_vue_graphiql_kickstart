import { createApp } from 'vue'
import { createPinia } from 'pinia';
import { provideApollo, apolloClient } from './apollo/client';
import { router } from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
provideApollo(app);
app.mount('#app');
