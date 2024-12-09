import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSiteManagementStore = defineStore('siteManagement', () => {
  const selectedSite = ref(null);

  const setSelectedSite = (site) => {
    selectedSite.value = site;
  };

  const resetSelectedSite = () => {
    selectedSite.value = null;
  };

  return {
    selectedSite,
    setSelectedSite,
    resetSelectedSite,
  };
});
