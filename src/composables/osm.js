// composables/useSite.js
import { ref, computed, toValue } from 'vue';
import { useAxiosStore } from '@/stores/axios.js';

export function useAddressValidation() {
  const isLoading = ref(false);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const getCoordinates = async (address, city, postalCode, country) => {
    const fullAddress = `${toValue(address)}, ${toValue(city)}, ${toValue(postalCode)}, ${toValue(country)}`;
    console.log('fullAddress', fullAddress);
    const apiUrl = `${import.meta.env.VITE_OSM_NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(
      fullAddress,
    )}`;
    console.log('apiUrl', apiUrl);

    try {
      isLoading.value = true;
      const response = await httpClient.value.get(apiUrl, {
        withCredentials: false,
      });
      const result = response.data;

      if (result.length > 0) {
        error.value = null;

        return {
          latitude: parseFloat(result[0].lat),
          longitude: parseFloat(result[0].lon),
        };
      } else {
        error.value = 'Adresse introuvable';
        return null;
      }
    } catch (error) {
      console.error(error);
      error.value = "Une erreur est survenue lors de la recherche de l'adresse";
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    getCoordinates,
  };
}
