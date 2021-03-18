
import { createApp, h, VNode } from 'vue';
import { router } from './main.router';
import App from './App.vue';
import ButtonCopy from './components/global/ButtonCopy.vue';
import Spinner from './components/global/Spinner.vue';
import ButtonDelete from './components/global/ButtonDelete.vue';

const vueApp = createApp({
   render: (): VNode => h(App),
});

vueApp.component('v-button-copy', ButtonCopy);
vueApp.component('v-spinner', Spinner);
vueApp.component('v-button-delete', ButtonDelete);

vueApp.use(router);
vueApp.mount('#app');
