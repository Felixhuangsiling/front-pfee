import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useAxiosStore = defineStore('axios', () => {
  const axiosInstance = ref(
    axios.create({
      baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
      withCredentials: true,
      timeout: 30000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }),
  );

  const updateUserToken = (user) => {
    if (user) {
      console.log('User is logged in with the following user:', user);
      axiosInstance.value.interceptors.request.use(async (config) => {
        const token = await user.getIdToken();
        if (config.withCredentials) {
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      });
    }
  };

  const resetInstance = () => {
    axiosInstance.value = axios.create({
      baseURL: import.meta.env.VITE_API_URL ?? 'http://78.194.94.207:8080',
      withCredentials: true,
      timeout: 30000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  };

  return {
    axiosInstance,
    updateUserToken,
    resetInstance,
  };
});
