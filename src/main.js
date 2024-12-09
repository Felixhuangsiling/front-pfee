import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import 'primeicons/primeicons.css';
import 'leaflet/dist/leaflet.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Tooltip from 'primevue/tooltip';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { createPinia } from 'pinia';
import { VueFire, VueFireAuth } from 'vuefire';
import { router } from './config/routes';
import { firebaseApp } from './config/firebase.js';

import {
  faUser,
  faPlug,
  faPlugCirclePlus,
  faPlugCircleMinus,
  faLocationDot,
  faTriangleExclamation,
  faAddressCard,
  faPowerOff,
  faCircleChevronRight,
  faPlus,
  faPen,
  faRotateRight,
  faCircleCheck,
  faCircleXmark,
  faCircleExclamation,
  faMap,
  faChevronLeft,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { CustomThemePreset } from '@/config/primevue.js';

const pinia = createPinia();
const app = createApp(App);

app.use(VueFire, {
  firebaseApp: firebaseApp,
  modules: [VueFireAuth()],
});
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: CustomThemePreset,
    options: {
      darkModeSelector: '.dark-mode',
    },
  },
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(pinia);
app.use(router);

app.directive('tooltip', Tooltip);

library.add(faUser);
library.add(faPlug);
library.add(faPlugCirclePlus);
library.add(faPlugCircleMinus);
library.add(faLocationDot);
library.add(faTriangleExclamation);
library.add(faAddressCard);
library.add(faPowerOff);
library.add(faCircleChevronRight);
library.add(faPlus);
library.add(faPen);
library.add(faRotateRight);
library.add(faCircleCheck);
library.add(faCircleXmark);
library.add(faCircleExclamation);
library.add(faMap);
library.add(faChevronLeft);
library.add(faTrash);

app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');
