import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserManagementStore = defineStore('userManagement', () => {
  const selectedUser = ref(null);
  const showProfileModal = ref(false);

  const setSelectedUser = (user) => {
    selectedUser.value = user;
  };

  const resetSelectedUser = () => {
    selectedUser.value = null;
  };

  const toggleProfileModal = () => {
    showProfileModal.value = !showProfileModal.value;
  };

  return {
    selectedUser,
    showProfileModal,
    setSelectedUser,
    resetSelectedUser,
    toggleProfileModal,
  };
});
