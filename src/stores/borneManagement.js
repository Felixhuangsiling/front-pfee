import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBorneManagementStore = defineStore('borneManagement', () => {
  const bornes = ref([]);
  const showAddBorneModal = ref(false);

  const UPDATE_BORNES = (bornes) => {
    bornes.value = bornes;
  };

  const emptyBornes = () => {
    bornes.value = [];
  };

  const setBornes = (newArray) => {
    bornes.value = newArray;
  };

  const setShowAddBorneModal = (value) => {
    showAddBorneModal.value = value;
  };

  const addBorne = (borne) => {
    borne.id = bornes.value.length + 1;
    bornes.value.push(borne);
  };

  return {
    bornes,
    showAddBorneModal,
    UPDATE_BORNES,
    emptyBornes,
    setBornes,
    setShowAddBorneModal,
    addBorne,
  };
});
