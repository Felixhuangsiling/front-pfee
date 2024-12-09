// composables/useUsers.js
import { ref, onMounted, computed, watchEffect, toValue, watch } from 'vue';
import { useAxiosStore } from '@/stores/axios.js';

export function useUsersList(page, size, search, role, status) {
  const data = ref(null);
  const isLoading = ref(true);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const fetchUsersList = async () => {
    isLoading.value = true;
    console.log('fetchUsersList');
    const params = {
      page: toValue(page),
      size: toValue(size),
    };

    if (search.value) params.email = toValue(search);
    if (role.value.content) params.role = toValue(role).content;
    if (status.value.content !== null)
      params.isEnabled = toValue(status).content;

    const urlParams = new URLSearchParams(params);

    try {
      const response = await httpClient.value.get(`/users?${urlParams}`);
      console.log(response);
      data.value = response.data;
    } catch (err) {
      console.log(err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  watch([page, size], () => {
    if (!isLoading.value) fetchUsersList();
  });

  onMounted(fetchUsersList);

  return {
    data,
    isLoading,
    error,
    fetchUsersList,
  };
}

export function useDeleteUser() {
  const isLoading = ref(false);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const deleteUser = async (userUuid) => {
    isLoading.value = true;
    try {
      const response = await httpClient.value.delete(`/users/${userUuid}`);
      return response.data;
    } catch (err) {
      console.error(err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    deleteUser,
  };
}

export function useCreateUser() {
  const isLoading = ref(false);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const createUser = async (userCreate) => {
    isLoading.value = true;
    try {
      const response = await httpClient.value.post('/users', userCreate);
      return response.data;
    } catch (err) {
      console.error(err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    createUser,
  };
}

export function useUpdateUser() {
  const isLoading = ref(false);
  const error = ref(null);

  const axiosStore = useAxiosStore();

  const httpClient = computed(() => axiosStore.axiosInstance);

  const updateUser = async (userUpdate) => {
    isLoading.value = true;
    try {
      const response = await httpClient.value.put('/users', userUpdate);
      return response.data;
    } catch (err) {
      console.error(err);
      error.value = err.message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    updateUser,
  };
}
