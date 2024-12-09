<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Chip from 'primevue/chip';
import { useToast } from 'primevue/usetoast';
import { useCreateSite } from '@/composables/site.js';
import { useAddressValidation } from '@/composables/osm.js';

const router = useRouter();
const toast = useToast();

const visible = ref(false);

const form = reactive({
  name: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
});

const latitude = ref(null);
const longitude = ref(null);

const errors = reactive({
  name: null,
  address: null,
  city: null,
  postalCode: null,
  country: null,
  global: null,
});

const isAddressValid = ref(false); // État de la validation de l'adresse
const previousValidations = ref([]); // Liste des validations précédentes

const concatenatedAddress = computed(() =>
  [form.address, form.city, form.postalCode, form.country]
    .filter((part) => part)
    .join(', '),
);

const isFormComplete = computed(() =>
  Object.values(form).every((value) => value.trim() !== ''),
);

const canSave = computed(() => isFormComplete.value && isAddressValid.value);

const { isLoading, error, createSite } = useCreateSite();
const addressValidationController = useAddressValidation();

onMounted(() => {
  visible.value = true;
});

const onClose = () => {
  router.back();
};

const handleInputChange = () => {
  errors.name = null;
  errors.address = null;
  errors.city = null;
  errors.postalCode = null;
  errors.country = null;
  errors.global = false;

  latitude.value = null;
  longitude.value = null;

  isAddressValid.value = previousValidations.value.some(
    (validation) =>
      validation.address === form.address &&
      validation.city === form.city &&
      validation.postalCode === form.postalCode &&
      validation.country === form.country,
  );
};

const validateAddress = async () => {
  if (!isFormComplete.value) {
    toast.add({
      severity: 'warn',
      summary: 'Champs incomplets',
      detail: 'Veuillez renseigner tous les champs avant de valider.',
    });
    return;
  }

  const coordinates = await addressValidationController.getCoordinates(
    form.address,
    form.city,
    form.postalCode,
    form.country,
  );

  if (coordinates) {
    isAddressValid.value = true;

    latitude.value = coordinates.latitude;
    longitude.value = coordinates.longitude;

    previousValidations.value.push({
      address: form.address,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
    });

    toast.add({
      severity: 'success',
      summary: 'Adresse validée',
      detail: 'Adresse localisée avec succès.',
      life: 3000,
    });
  } else {
    isAddressValid.value = false;
    toast.add({
      severity: 'error',
      summary: 'Adresse invalide',
      detail: "L'adresse saisie n'a pas pu être localisée.",
      life: 3000,
    });
  }
};

const onSave = (dismissable) => {
  if (!isFormComplete.value) {
    errors.name.value = form.name ? null : 'Nom est requis';
    errors.address.value = form.address ? null : 'Adresse est requis';
    errors.city.value = form.city ? null : 'Ville est requis';
    errors.postalCode.value = form.postalCode ? null : 'Code postal est requis';
    errors.country.value = form.country ? null : 'Pays est requis';
    return;
  }

  if (!isAddressValid.value) return;

  createSite({
    name: form.name,
    address: form.address,
    city: form.city,
    postalCode: form.postalCode,
    country: form.country,
    latitude: latitude.value,
    longitude: longitude.value,
  }).then((created) => {
    console.log(created);

    if (created) {
      toast.add({
        severity: 'success',
        summary: 'Site créé',
        detail: 'Le site a été créé avec succès',
        life: 3000,
      });

      if (dismissable) {
        visible.value = false;
      } else {
        form.name = '';
        form.address = '';
        form.city = '';
        form.postalCode = '';
        form.country = '';

        isAddressValid.value = false;
      }
    } else {
      toast.add({
        severity: 'error',
        summary: 'Erreur',
        life: 3000,
        detail:
          "Une erreur s'est produite lors de la création de l'utilisateur",
      });
    }
  });
};
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Edit Profile"
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
        <span class="text-xl font-bold">Créer un site</span>
      </div>
    </template>
    <div class="flex flex-row items-center gap-10">
      <div class="flex flex-col gap-2 flex-1">
        <div class="flex flex-col gap-1">
          <label for="site-name-create" class="text-sm font-semibold"
            >Nom du site</label
          >
          <InputText
            id="site-name-create"
            class="flex-auto"
            autocomplete="off"
            :invalid="errors.name !== null || error"
            aria-errormessage="site-name-create-error"
            v-model="form.name"
            v-on:change="handleInputChange"
          />
          <small
            v-if="errors.name !== null"
            class="text-red-500"
            aria-invalid="true"
            id="site-name-create-error"
            >{{ errors.name }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="site-address-create" class="text-sm font-semibold"
            >Adresse</label
          >
          <InputText
            id="site-address-create"
            class="flex-auto"
            autocomplete="off"
            :invalid="errors.address !== null || error"
            aria-errormessage="site-address-create-error"
            v-model="form.address"
            v-on:change="handleInputChange"
          />
          <small
            v-if="errors.address !== null"
            class="text-red-500"
            aria-invalid="true"
            id="site-address-create-error"
            >{{ errors.address }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="site-city-create" class="text-sm font-semibold"
            >Ville</label
          >
          <InputText
            id="site-city-create"
            class="flex-auto"
            autocomplete="off"
            :invalid="errors.city !== null || error"
            aria-errormessage="site-city-create-error"
            v-model="form.city"
            v-on:change="handleInputChange"
          />
          <small
            v-if="errors.city !== null"
            class="text-red-500"
            aria-invalid="true"
            id="site-city-create-error"
            >{{ errors.city }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="site-postal-code-create" class="text-sm font-semibold"
            >Code postal</label
          >
          <InputText
            id="site-postal-code-create"
            class="flex-auto"
            autocomplete="off"
            :invalid="errors.postalCode !== null || error"
            aria-errormessage="site-postal-code-create-error"
            v-model="form.postalCode"
            v-on:change="handleInputChange"
          />
          <small
            v-if="errors.postalCode !== null"
            class="text-red-500"
            aria-invalid="true"
            id="site-postal-code-create-error"
            >{{ errors.postalCode }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="site-country-create" class="text-sm font-semibold"
            >Pays</label
          >
          <InputText
            id="site-country-create"
            class="flex-auto"
            autocomplete="off"
            :invalid="errors.country !== null || error"
            aria-errormessage="site-country-create-error"
            v-model="form.country"
            v-on:change="handleInputChange"
          />
          <small
            v-if="errors.country !== null"
            class="text-red-500"
            aria-invalid="true"
            id="site-country-create-error"
            >{{ errors.country }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="site-country-create" class="text-sm font-semibold"
            >Adresse complète</label
          >
          <div class="flex flex-row gap-2">
            <Textarea
              v-model="concatenatedAddress"
              :disabled="true"
              class="flex-auto"
              autoResize
              rows="1"
              autocomplete="off"
            />
            <Button
              type="button"
              label="Valider"
              :disabled="isAddressValid || (!isFormComplete && !isAddressValid)"
              severity="primary"
              @click="validateAddress"
            />
            <Chip
              v-tooltip="'Veuillez valider l\'adresse'"
              v-if="
                !isAddressValid &&
                addressValidationController.error.value === null
              "
            >
              <font-awesome-icon
                class="text-orange-600"
                :icon="['fas', 'circle-exclamation']"
              />
            </Chip>
            <Chip v-tooltip="'Adresse valide'" v-if="isAddressValid">
              <font-awesome-icon
                class="text-green-600"
                :icon="['fas', 'circle-check']"
              />
            </Chip>
            <Chip
              v-tooltip="'Adresse incorrect, veuillez corriger'"
              v-if="
                !isAddressValid &&
                addressValidationController.error.value !== null
              "
            >
              <font-awesome-icon
                class="text-red-600"
                :icon="['fas', 'circle-xmark']"
              />
            </Chip>
          </div>
        </div>
      </div>
      <div class="flex justify-center items-center mx-8">
        <font-awesome-icon :icon="['fas', 'location-dot']" size="8x" />
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
          :disabled="!canSave"
          :loading="isLoading"
          pt:root:class="!py-1"
          pt:label:class="!font-semibold"
          @click="(e) => onSave(true)"
        ></Button>
        <Button
          outlined
          type="button"
          :disabled="!canSave"
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

<style></style>
