<template>
  <div class="popup-overlay" @click="closePopup">
    <div class="popup" @click.stop>
      <h2>Add Borne</h2>
      <form @submit.prevent="addBorne">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="name" />
        </div>
        <div class="form-group">
          <label for="status">Status:</label>
          <select name="status" id="status" v-model="status">
            <option v-for="status in Status" :key="status">
              {{ status }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="location">location:</label>
          <input type="text" id="location" v-model="location" />
        </div>
        <div class="form-group">
          <label for="type">type:</label>
          <input type="text" id="type" v-model="type" />
        </div>
        <div class="form-group">
          <label for="manufacturer">manufacturer:</label>
          <input type="text" id="manufacturer" v-model="manufacturer" />
        </div>
        <div class="form-group">
          <label for="mqtt_topic">MQTT Topic:</label>
          <input type="text" id="mqtt_topic" v-model="mqtt_topic" />
        </div>
        <button type="submit">Add</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCreateBorne } from '@/composables/borne.js';
import { useBorneManagementStore } from '@/stores/borneManagement.js';

const borneManagementStore = useBorneManagementStore();
const { createBorne } = useCreateBorne();

const name = ref('');
const status = ref('');
const location = ref('');
const type = ref('');
const manufacturer = ref('');
const mqtt_topic = ref('');

async function addBorne() {
  await createBorne({
    name: name.value,
    status: status.value,
    location: location.value,
    type: type.value,
    manufacturer: manufacturer.value,
    mqtt_topic: mqtt_topic.value,
  });

  name.value = '';
  status.value = '';
  location.value = '';
  type.value = '';
  manufacturer.value = '';
  mqtt_topic.value = '';
  closePopup();
  console.log('addBorne');

}

// const addBorne = () => {

//   store.dispatch("addBorne", {
//     id: store.state.bornes.length + 1,
//     name: name.value,
//     status: status.value,
//     location: location.value,
//     type: type.value,
//     manufacturer: manufacturer.value,
//     mqtt_topic: mqtt_topic.value,
//   });

//   name.value = "";
//   status.value = "";
//   location.value = "";
//   type.value = "";
//   manufacturer.value = "";
//   mqtt_topic.value = "";
// };

const closePopup = () => {
  borneManagementStore.setShowAddBorneModal(false);
};

const Status = ['Active', 'Disable', 'Unknown'];
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 10px;
}

input,
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
