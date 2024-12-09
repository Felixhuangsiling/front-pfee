<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { useCreateBorne } from '@/composables/borne.js';

const router = useRouter();
const toast = useToast();

const statusChoices = [
  { name: 'Activé', content: 'ACTIVE' },
  { name: 'Désactivé', content: 'DISABLE' },
];

const typesChoices = [
  { name: 'Shelly', content: 'SHELLY' },
  { name: 'Tasmota', content: 'TASMOTA' },
  { name: 'Autre', content: 'OTHER' },
];

const statusFilter = ref(statusChoices[0]);
const typeFilter = ref(typesChoices[0]);

const visible = ref(false);
const name = ref('');
const manufacturer = ref('');
const mqtt_topic = ref('');

const nameError = ref(null);
const manufacturerError = ref(null);
const mqtt_topicError = ref(null);

const { isLoading, error, createBorne } = useCreateBorne();

onMounted(() => {
  visible.value = true;
});

const onClose = () => {
  router.back();
};

const handleInputChange = () => {
  nameError.value = null;
  manufacturerError.value = null;
  mqtt_topicError.value = null;
};

const onSave = (dismissable) => {
  if (!name.value || !manufacturer.value || !mqtt_topic.value) {
    nameError.value = name.value ? null : 'Nom est requis';
    manufacturerError.value = manufacturer.value
      ? null
      : 'Fabricant est requis';
    mqtt_topicError.value = mqtt_topic.value ? null : 'Sujet MQTT est requis';
    return;
  }

  createBorne({
    name: name.value,
    type: typeFilter.value.content,
    status: statusFilter.value.content,
    manufacturer: manufacturer.value,
    mqtt_topic: mqtt_topic.value,
  }).then((created) => {
    console.log(created);

    if (created) {
      toast.add({
        severity: 'success',
        summary: 'Borne créée',
        detail: "L'équipement a été créée avec succès",
        life: 3000,
      });

      if (dismissable) {
        visible.value = false;
      } else {
        name.value = '';
        type.value = '';
        manufacturer.value = '';
        mqtt_topic.value = '';
      }
    } else {
      toast.add({
        severity: 'error',
        summary: 'Erreur',
        life: 3000,
        detail: "Une erreur s'est produite lors de la création de l'équipement",
      });
    }
  });
};
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    pt:root:class="!rounded-3xl"
    pt:footer:class="border-t border-gray-300 bg-gray-100 !py-2 !rounded-b-3xl !justify-center"
    :style="{ width: '48rem' }"
    @after-hide="() => onClose()"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <Avatar shape="circle" size="large">
          <font-awesome-icon :icon="['fas', 'plus']" size="1x" />
        </Avatar>
        <span class="text-xl font-bold">Ajouter un équipement</span>
      </div>
    </template>
    <div class="flex flex-row items-center gap-10">
      <div class="flex flex-col gap-2 flex-1">
        <div class="flex flex-col gap-1">
          <label for="name-borne-create" class="text-sm font-semibold"
            >Nom</label
          >
          <InputText
            id="name-borne-create"
            class="flex-auto"
            autocomplete="off"
            :invalid="nameError !== null || error"
            aria-errormessage="name-borne-create-error"
            v-model="name"
            v-on:change="handleInputChange"
          />
          <small
            v-if="nameError !== null"
            class="text-red-500"
            aria-invalid="true"
            id="name-borne-create-error"
            >{{ nameError }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="type-borne-create" class="text-sm font-semibold"
            >Type</label
          >
          <Select
            id="status-borne-create"
            class="flex-auto"
            v-model="typeFilter"
            :options="typesChoices"
            optionLabel="name"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label for="manufacturer-borne-create" class="text-sm font-semibold"
            >Fabricant</label
          >
          <InputText
            id="manufacturer-borne-create"
            class="flex-auto"
            autocomplete="off"
            :invalid="manufacturerError !== null || error"
            aria-errormessage="manufacturer-borne-create-error"
            v-model="manufacturer"
            v-on:change="handleInputChange"
          />
          <small
            v-if="manufacturerError !== null"
            class="text-red-500"
            aria-invalid="true"
            id="manufacturer-borne-create-error"
            >{{ manufacturerError }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="mqtt_topic-borne-create" class="text-sm font-semibold"
            >Topic MQTT</label
          >
          <InputText
            id="mqtt_topic-borne-create"
            class="flex-auto"
            autocomplete="off"
            :invalid="mqtt_topicError !== null || error"
            aria-errormessage="mqtt_topic-borne-create-error"
            v-model="mqtt_topic"
            v-on:change="handleInputChange"
          />
          <small
            v-if="mqtt_topicError !== null"
            class="text-red-500"
            aria-invalid="true"
            id="mqtt_topic-borne-create-error"
            >{{ mqtt_topicError }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="status-borne-create" class="text-sm font-semibold"
            >Statut</label
          >
          <Select
            id="status-borne-create"
            class="flex-auto"
            v-model="statusFilter"
            :options="statusChoices"
            optionLabel="name"
          />
        </div>
      </div>
      <div class="flex justify-center items-center mx-8">
        <font-awesome-icon :icon="['fas', 'plug']" size="8x" />
      </div>
    </div>
    <template #footer>
      <div class="flex flex-row justify-center items-center gap-10">
        <Button
          text
          type="button"
          label="Annuler"
          severity="primary"
          pt:root:class="!py-1"
          pt:label:class="!font-semibold"
          @click="visible = false"
        ></Button>
        <Button
          type="button"
          label="Enregistrer"
          :loading="isLoading"
          pt:root:class="!py-1"
          pt:label:class="!font-semibold"
          @click="(e) => onSave(true)"
        ></Button>
        <Button
          outlined
          type="button"
          label="Enregistrer et créer à nouveau"
          severity="primary"
          pt:root:class="!py-1 !border-2"
          pt:label:class="!font-semibold"
          :loading="isLoading"
          @click="(e) => onSave(false)"
        ></Button>
      </div>
    </template>
  </Dialog>
</template>

<style>
.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
