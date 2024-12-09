// composables/useUsers.js
import { ref, onMounted, computed, onUnmounted, toValue, watch } from 'vue';
import { useBorneManagementStore } from '@/stores/borneManagement.js';
import { useAxiosStore } from '@/stores/axios.js';

export function useBornesList() {
  const data = ref(null);
  const isLoading = ref(true);
  const error = ref(null);
  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const borneManagementStore = useBorneManagementStore();

  const fetchBornes = async () => {
    isLoading.value = true;

    try {
      const response = await httpClient.value.get('equipment/all');
      console.log(response);
      data.value = response.data;
      borneManagementStore.emptyBornes();
      borneManagementStore.setBornes(response.data);
    } catch (err) {
      console.log(err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  // onMounted(fetchBornes);

  return {
    data,
    isLoading,
    error,
    fetchBornes,
  };
}

export function usePaginatedBornesList(
  page,
  size,
  name,
  type,
  status,
  manufacturer,
  siteName,
) {
  const data = ref(null);
  const isLoading = ref(true);
  const error = ref(null);

  const axiosStore = useAxiosStore();
  const borneManagementStore = useBorneManagementStore();
  const httpClient = computed(() => axiosStore.axiosInstance);

  const fetchBorneList = async () => {
    isLoading.value = true;
    const params = {
      page: toValue(page),
      size: toValue(size),
    };

    if (name.value) params.name = toValue(name);
    if (type.value) params.type = toValue(type);
    if (status.value) params.status = toValue(status);
    if (manufacturer.value) params.manufacturer = toValue(manufacturer);
    if (siteName.value) params.siteName = toValue(siteName);

    const urlParams = new URLSearchParams(params);

    try {
      const response = await httpClient.value.get(`/equipment?${urlParams}`);
      data.value = response.data;
      borneManagementStore.emptyBornes();
      borneManagementStore.setBornes(response.data.equipments);
    } catch (err) {
      console.log(err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  watch([page, size], () => {
    if (!isLoading.value) fetchBorneList();
  });

  onMounted(fetchBorneList);

  return {
    data,
    isLoading,
    error,
    fetchBorneList,
  };
}

export function useCreateBorne() {
  const isLoading = ref(false);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const borneManagementStore = useBorneManagementStore();

  const createBorne = async (borne) => {
    isLoading.value = true;
    try {
      const response = await httpClient.value.post('equipment', borne);
      console.log('Borne created:', response);
      borneManagementStore.addBorne(response.data);
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
    createBorne,
  };
}

export function useBorneDetails(parseMqttMessage) {
  const eventSource = ref(null);
  const isLoading = ref(true);
  const error = ref(null);
  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const borneManagementStore = useBorneManagementStore();

  const fetchBorneDetails = async (topic) => {
    isLoading.value = true;

    try {
      const response = await httpClient.value.post(
        'mqtt/subscribe',
        null,
        {
          params: {
            topic: 'stat/' + topic + '/STATUS8',
          },
        },
      );
      console.log(response);

      eventSource.value = new EventSource(
        'mqtt/data/stream?topic=' + topic + '&duration=2',
      );

      console.log(eventSource);

      eventSource.value.onmessage = function (event) {
        console.log('Message:', event.data);
        parseMqttMessage(event.data);
      };
    } catch (err) {
      console.log(err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };
  const fetchEquipmentHistory = async (id, timeRange) => {
    isLoading.value = true;

    try {
      const response = await httpClient.value.get('history/energy/equipment/' + id + '?time=' + timeRange);
      console.log('Equipment history:', response);
      return [true, response.data, "no error"];
    } catch (err) {
      console.log(err);
      error.value = err.message;
      return [false, null, err.message];
    } finally {
      isLoading.value = false;
    }
  };


  return {
    eventSource,
    isLoading,
    error,
    fetchBorneDetails,
    fetchEquipmentHistory,
  };
}

export function deleteBornes() {
  const axiosStore = useAxiosStore();
  const httpClient = computed(() => axiosStore.axiosInstance);

  const deleteBorne = async (id) => {
    try {
      const response = await httpClient.value.delete('equipment/' + id);
      console.log('Borne deleted:', response);
    } catch (err) {
      console.log(err);
    }
  };

  return {
    deleteBorne,
  };
}
