
import { createApp, h, VNode } from 'vue';
import { router } from './main.router';
import App from './App.vue';
import ButtonCopy from './components/global/ButtonCopy.vue';
import Spinner from './components/global/Spinner.vue';
import ButtonDelete from './components/global/ButtonDelete.vue';
import Modal from './components/global/Modal.vue';
import ButtonConfig from './components/global/ButtonConfig.vue';
import CodeMirrorEditor from './components/global/CodeMirrorEditor.vue';

const vueApp = createApp({
   render: (): VNode => h(App),
});

vueApp.component('v-button-copy', ButtonCopy);
vueApp.component('v-button-delete', ButtonDelete);
vueApp.component('v-button-config', ButtonConfig);
vueApp.component('v-spinner', Spinner);
vueApp.component('v-modal', Modal);
vueApp.component('v-code-mirror-editor', CodeMirrorEditor);

vueApp.use(router);
vueApp.mount('#app');
