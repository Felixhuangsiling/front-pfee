import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

export const CustomThemePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f4f4f8',
      100: '#cccce1',
      200: '#a4a5c9',
      300: '#7c7db2',
      400: '#54559a',
      500: '#2D2E83',
      600: '#242468',
      700: '#1b1b4e',
      800: '#121234',
      900: '#08091a',
      950: '#05050d',
    },
  },
});
