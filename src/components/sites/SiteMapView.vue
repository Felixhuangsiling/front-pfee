<script setup>
import { computed, reactive, ref, watch } from 'vue';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { useSiteList } from '@/composables/site.js';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';

import L from 'leaflet';
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Icône par défaut
const defaultIcon = L.icon({
  iconUrl: new URL('@/assets/marker-icon-normal.png', import.meta.url).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Icône pour le marqueur sélectionné
const highlightedIcon = L.icon({
  iconUrl: new URL('@/assets/marker-icon-selected.png', import.meta.url).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const form = reactive({
  name: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
});

const { data, isLoading, fetchSitesList } = useSiteList();

const selectedSite = ref(null); // Site actuellement sélectionné
const mapRef = ref(null); // Référence à la carte

const siteCardRefs = reactive({});

// Propriété calculée pour filtrer les sites
const filteredSites = ref(data.value);

const resetFilters = () => {
  form.name = '';
  form.address = '';
  form.city = '';
  form.postalCode = '';
  form.country = '';
};

const someFilterActive = computed(() => {
  return (
    form.name || form.address || form.city || form.postalCode || form.country
  );
});

// Méthode de filtrage (sans debounce)
const filterSites = () => {
  if (!data.value) {
    filteredSites.value = [];
    return;
  }

  filteredSites.value = data.value.filter((site) => {
    return (
      (!form.name ||
        site.name.toLowerCase().includes(form.name.toLowerCase())) &&
      (!form.address ||
        site.address.toLowerCase().includes(form.address.toLowerCase())) &&
      (!form.city ||
        site.city.toLowerCase().includes(form.city.toLowerCase())) &&
      (!form.postalCode || site.postalCode.includes(form.postalCode)) &&
      (!form.country ||
        site.country.toLowerCase().includes(form.country.toLowerCase()))
    );
  });
};

// Déclencheur avec debounce
const debouncedFilterSites = debounce(filterSites, 300);

// Regarder les changements des inputs
watch(form, debouncedFilterSites, { deep: true });
watch(data, filterSites);

const bounds = computed(() => {
  if (!filteredSites.value || filteredSites.value.length === 0) {
    // Valeurs par défaut : Paris
    return [
      [48.8566, 2.3522],
      [48.8566, 2.3522],
    ];
  }

  const lats = filteredSites.value.map((site) => site.latitude);
  const lngs = filteredSites.value.map((site) => site.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
});

// Calculer le centre de la carte
const center = computed(() => {
  if (!filteredSites.value || filteredSites.value.length === 0) {
    return [48.8566, 2.3522]; // Paris
  }

  const lats = filteredSites.value.map((site) => site.latitude);
  const lngs = filteredSites.value.map((site) => site.longitude);
  const avgLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const avgLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

  return [avgLat, avgLng];
});

// Méthode pour centrer la carte sur un site
const focusOnSite = (site) => {
  if (selectedSite.value === site) {
    selectedSite.value = null;
  } else {
    selectedSite.value = site;
    if (mapRef.value) {
      mapRef.value.leafletObject.flyTo([site.latitude, site.longitude], 14, {
        duration: 1.5,
      });
    }
  }
};

const scrollToSite = (site) => {
  console.log('Try to scroll ', siteCardRefs);
  const siteElement = siteCardRefs[`site-${site.id}`];
  if (siteElement) {
    console.log('Scrolling to ', siteElement);
    siteElement.$el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
};

// Méthode pour mettre en évidence un marqueur
const highlightMarker = (site) => {
  console.log('Highlighting marker', site);
  console.log('Selected site', selectedSite.value);
  if (selectedSite.value === site) {
    selectedSite.value = null;
  } else {
    selectedSite.value = site;
    scrollToSite(site);
  }
};
</script>

<template>
  <div class="flex flex-col gap-10 flex-1">
    <div class="flex flex-row justify-between items-center">
      <h1 class="text-4xl font-bold">Cartes des sites</h1>
      <div class="flex flex-row items-center gap-2"></div>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex flex-row gap-4 items-start flex-wrap">
        <div class="flex flex-col flex-1">
          <label for="site-name">Nom</label>
          <InputText
            class="flex-1"
            id="site-name"
            v-model="form.name"
            placeholder="Ex: Batiment Voltaire"
          />
        </div>
        <div class="flex flex-col flex-1">
          <label for="site-address">Adresse</label>
          <InputText
            class="flex-1"
            id="site-address"
            v-model="form.address"
            placeholder="Ex: 15 rue des prés"
          />
        </div>
        <div class="flex flex-col">
          <label for="site-city">Ville</label>
          <InputText
            class="max-w-36"
            id="site-city"
            v-model="form.city"
            placeholder="Ex: Lyon"
          />
        </div>
        <div class="flex flex-col">
          <label for="site-postal-code">Code Postale</label>
          <InputText
            class="max-w-36"
            id="site-postal-code"
            v-model="form.postalCode"
            placeholder="Ex: 94270"
          />
        </div>
        <div class="flex flex-col">
          <label for="site-country">Pays</label>
          <InputText
            class="max-w-36"
            id="site-country"
            v-model="form.country"
            placeholder="Ex: France"
          />
        </div>
      </div>
      <div class="flex flex-row justify-between items-center">
        <Button
          type="button"
          :disabled="!someFilterActive"
          @click="resetFilters"
        >
          Réinitialiser les filtres
        </Button>
        <Button
          type="button"
          label="Actualiser la liste"
          :loading="isLoading"
          @click="fetchSitesList"
        >
          <template #icon>
            <font-awesome-icon :icon="['fas', 'rotate-right']" size="lg" />
          </template>
        </Button>
      </div>
      <div
        class="flex flex-row gap-4 rounded-border p-4 border border-primary min-h-96"
        style="height: 40rem"
      >
        <div class="flex-1">
          <l-map
            ref="mapRef"
            style="height: 100%; width: 100%"
            :zoom="10"
            :center="center"
            :bounds="bounds"
            :options="{ zoomControl: false }"
            :use-global-leaflet="false"
          >
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ></l-tile-layer>
            <l-marker
              v-for="site in filteredSites"
              :key="site.id"
              :lat-lng="[site.latitude, site.longitude]"
              :icon="site === selectedSite ? highlightedIcon : defaultIcon"
              @click="highlightMarker(site)"
            ></l-marker>
          </l-map>
        </div>
        <div class="flex flex-row divide-x divide-solid divide-primary h-full">
          <div></div>
          <div></div>
        </div>
        <div
          class="flex flex-col gap4 rounded-border p-4 border border-surface bg-white"
        >
          <h3 class="text-xl font-bold">Liste des sites</h3>
          <div class="divide-y-4 divide-solid w-full mt-2 mb-4">
            <div></div>
            <div></div>
          </div>
          <div
            class="flex flex-col min-w-80 max-w-80 h-full overflow-y-auto scroll-smooth snap-x"
          >
            <h4
              v-if="!filteredSites || filteredSites.length === 0"
              class="text-base font-light text-center m-auto"
            >
              Aucun site trouvée
            </h4>
            <template v-for="(site, index) in filteredSites" :key="index">
              <Card
                :ref="
                  (el) => {
                    siteCardRefs[`site-${site.id}`] = el;
                  }
                "
                :class="[
                  'cursor-pointer',
                  'scroll-ml-6',
                  'snap-start',
                  { '!bg-primary': site === selectedSite },
                  { '!mb-3': index !== filteredSites.length - 1 },
                  { '!text-primary-contrast': site === selectedSite },
                ]"
                @click="focusOnSite(site)"
              >
                <template #title>{{ site.name }}</template>
                <template #content>
                  <p class="m-0">
                    <span class="text-sm m">{{ site.address }}, </span>
                    <span class="text-sm">{{ site.city }}, </span>
                    <span class="text-sm">{{ site.postalCode }}, </span>
                    <span class="text-sm">{{ site.country }}</span>
                  </p>
                </template>
              </Card>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
