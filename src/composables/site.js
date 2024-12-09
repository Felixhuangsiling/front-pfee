// composables/useSite.js
import { ref, onMounted, computed, toValue, watch } from 'vue';
import { useAxiosStore } from '@/stores/axios.js';

export function usePaginatedSiteList(
  page,
  size,
  name,
  address,
  city,
  postalCode,
  country,
) {
  const data = ref(null);
  const isLoading = ref(true);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const fetchSitesList = async () => {
    isLoading.value = true;
    const params = {
      page: toValue(page),
      size: toValue(size),
    };

    if (name.value) params.name = toValue(name);
    if (address.value) params.address = toValue(address);
    if (city.value) params.city = toValue(city);
    if (postalCode.value) params.postalCode = toValue(postalCode);
    if (country.value) params.country = toValue(country);

    const urlParams = new URLSearchParams(params);

    try {
      const response = await httpClient.value.get(`/sites?${urlParams}`);
      data.value = response.data;
    } catch (err) {
      console.log(err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  watch([page, size], () => {
    if (!isLoading.value) fetchSitesList();
  });

  onMounted(fetchSitesList);

  return {
    data,
    isLoading,
    error,
    fetchSitesList,
  };
}

export function useSiteList() {
  const data = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const fetchSitesList = async () => {
    isLoading.value = true;

    try {
      const response = await httpClient.value.get(`/sites/all`);
      data.value = response.data;
      isLoading.value = false;
    } catch (err) {
      console.log(err);
      error.value = err.message;
      isLoading.value = false;
    }
  };

  onMounted(fetchSitesList);

  return {
    data,
    isLoading,
    error,
    fetchSitesList,
  };
}

export function useSiteNamesList() {
  const data = ref(null);
  const isLoading = ref(true);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const fetchSiteNamesList = async () => {
    isLoading.value = true;
    try {
      const response = await httpClient.value.get(`/sites/names`);
      data.value = response.data;
      return response.data;
    } catch (err) {
      console.log(err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    data,
    isLoading,
    error,
    fetchSiteNamesList,
  };
}

export function useDeleteSite() {
  const isLoading = ref(false);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const deleteSite = async (siteId) => {
    isLoading.value = true;
    try {
      const response = await httpClient.value.delete(`/sites/${siteId}`);
      return response.data;
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    deleteSite,
  };
}

export function useCreateSite() {
  const isLoading = ref(false);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const createSite = async (siteCreate) => {
    isLoading.value = true;
    try {
      const response = await httpClient.value.post('/sites', siteCreate);
      return response.data;
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    createSite,
  };
}

export function useUpdateSite() {
  const isLoading = ref(false);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const updateSite = async (siteId, siteCreate) => {
    isLoading.value = true;
    try {
      const response = await httpClient.value.put(
        `/sites/${siteId}`,
        siteCreate,
      );
      return response.data;
    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    updateSite,
  };
}

export function useAddEquipmentToSite() {
  const isLoading = ref(false);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const addEquipmentToSite = async (siteId, equipmentIds) => {
    isLoading.value = true;
    try {
      const response = await httpClient.value.post(
        `/sites/${siteId}/equipments`,
        equipmentIds,
      );
      return response.data;
    } catch (err) {
      console.log(err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    addEquipmentToSite,
  };
}

export function useRemoveEquipmentFromSite() {
  const isLoading = ref(false);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const deleteEquipmentFromSite = async (siteId, equipmentIds) => {
    isLoading.value = true;
    try {
      console.log(siteId, equipmentIds);
      const response = await httpClient.value.delete(
        `/sites/${siteId}/equipments`,
        { data: equipmentIds },
      );
      return response.data;
    } catch (err) {
      console.log(err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    deleteEquipmentFromSite,
  };
}
