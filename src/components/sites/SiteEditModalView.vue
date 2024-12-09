<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { useSiteManagementStore } from '@/stores/siteManagement.js';
import { useConfirm } from 'primevue/useconfirm';
import { useDeleteSite, useUpdateSite } from '@/composables/site.js';
import { useToast } from 'primevue/usetoast';
import { useAddressValidation } from '@/composables/osm.js';
import Textarea from 'primevue/textarea';
import Chip from 'primevue/chip';

const router = useRouter();
const route = useRoute();
const confirm = useConfirm();
const toast = useToast();

const siteManagementStore = useSiteManagementStore();

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

const siteDeleteController = useDeleteSite();
const siteUpdateController = useUpdateSite();

const addressValidationController = useAddressValidation();

onMounted(() => {
  visible.value = true;

  if (!siteManagementStore.selectedSite) {
    router.push({ name: 'dashboardSites' });
  } else {
    previousValidations.value.push({
      address: siteManagementStore.selectedSite.address,
      city: siteManagementStore.selectedSite.city,
      postalCode: siteManagementStore.selectedSite.postalCode,
      country: siteManagementStore.selectedSite.country,
    });

    isAddressValid.value = true;

    form.name = siteManagementStore.selectedSite.name;
    form.address = siteManagementStore.selectedSite.address;
    form.city = siteManagementStore.selectedSite.city;
    form.postalCode = siteManagementStore.selectedSite.postalCode;
    form.country = siteManagementStore.selectedSite.country;
  }
});

const onClose = () => {
  siteManagementStore.resetSelectedSite();
  router.back();
};

const handleInputChange = () => {
  errors.name = null;
  errors.address = null;
  errors.city = null;
  errors.postalCode = null;
  errors.country = null;
  errors.global = false;

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
      life: 3000,
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

const onUpdate = () => {
  if (!isFormComplete.value) {
    errors.name.value = form.name ? null : 'Nom est requis';
    errors.address.value = form.address ? null : 'Adresse est requis';
    errors.city.value = form.city ? null : 'Ville est requis';
    errors.postalCode.value = form.postalCode ? null : 'Code postal est requis';
    errors.country.value = form.country ? null : 'Pays est requis';
    return;
  }

  if (!isAddressValid.value) return;

  siteUpdateController
    .updateSite(route.params.id, {
      name: form.name,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
      latitude: latitude.value,
      longitude: longitude.value,
    })
    .then((siteUpdated) => {
      if (siteUpdated) {
        siteManagementStore.resetSelectedSite();
        visible.value = false;
        toast.add({
          severity: 'success',
          summary: 'Sauvegardé',
          detail: 'Le site a été mis à jour',
          life: 3000,
        });
      } else {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Une erreur s'est produite lors de la mise à jour du site",
          life: 3000,
        });
      }
    });
};

const onDelete = () => {
  confirm.require({
    message: 'Voulez-vous vraiment supprimer ce site ?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Annuler',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Supprimer',
    },
    accept: () => {
      siteDeleteController.deleteSite(route.params.id).then((siteDeleted) => {
        if (siteDeleted) {
          siteManagementStore.resetSelectedSite();
          visible.value = false;
          toast.add({
            severity: 'success',
            summary: 'Supprimé',
            detail: 'Le site a été supprimé',
            life: 3000,
          });
        } else {
          toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Une erreur s'est produite lors de la suppression du site",
            life: 3000,
          });
        }
      });
    },
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
          <font-awesome-icon :icon="['fas', 'pen']" size="1x" />
        </Avatar>
        <span class="text-xl font-bold">Modifier un site</span>
      </div>
    </template>
    <div class="flex flex-row items-center gap-10">
      <div class="flex flex-col gap-2 flex-1">
        <div class="flex flex-col gap-1">
          <label for="site-name-edit" class="text-sm font-semibold"
            >Nom du site</label
          >
          <InputText
            id="site-name-edit"
            class="flex-auto"
            autocomplete="off"
            :invalid="
              errors.name !== null ||
              siteDeleteController.error.value !== null ||
              siteUpdateController.error.value !== null
            "
            aria-errormessage="site-name-edit-error"
            v-model="form.name"
            v-on:change="handleInputChange"
          />
          <small
            v-if="errors.name !== null"
            class="text-red-500"
            aria-invalid="true"
            id="site-name-edit-error"
            >{{ errors.name }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="site-address-edit" class="text-sm font-semibold"
            >Adresse</label
          >
          <InputText
            id="site-address-edit"
            class="flex-auto"
            autocomplete="off"
            :invalid="
              errors.address !== null ||
              siteDeleteController.error.value !== null ||
              siteUpdateController.error.value !== null
            "
            aria-errormessage="site-address-edit-error"
            v-model="form.address"
            v-on:change="handleInputChange"
          />
          <small
            v-if="errors.address !== null"
            class="text-red-500"
            aria-invalid="true"
            id="site-address-edit-error"
            >{{ errors.address }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="site-city-edit" class="text-sm font-semibold"
            >Ville</label
          >
          <InputText
            id="site-city-edit"
            class="flex-auto"
            autocomplete="off"
            :invalid="
              errors.city !== null ||
              siteDeleteController.error.value !== null ||
              siteUpdateController.error.value !== null
            "
            aria-errormessage="site-city-edit-error"
            v-model="form.city"
            v-on:change="handleInputChange"
          />
          <small
            v-if="errors.city !== null"
            class="text-red-500"
            aria-invalid="true"
            id="site-city-edit-error"
            >{{ errors.city }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="site-postal-code-edit" class="text-sm font-semibold"
            >Code postal</label
          >
          <InputText
            id="site-postal-code-edit"
            class="flex-auto"
            autocomplete="off"
            :invalid="
              errors.postalCode !== null ||
              siteDeleteController.error.value !== null ||
              siteUpdateController.error.value !== null
            "
            aria-errormessage="site-postal-code-edit-error"
            v-model="form.postalCode"
            v-on:change="handleInputChange"
          />
          <small
            v-if="errors.postalCode !== null"
            class="text-red-500"
            aria-invalid="true"
            id="site-postal-code-edit-error"
            >{{ errors.postalCode }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="site-country-edit" class="text-sm font-semibold"
            >Pays</label
          >
          <InputText
            id="site-country-edit"
            class="flex-auto"
            autocomplete="off"
            :invalid="
              errors.country !== null ||
              siteDeleteController.error.value !== null ||
              siteUpdateController.error.value !== null
            "
            aria-errormessage="site-country-edit-error"
            v-model="form.country"
            v-on:change="handleInputChange"
          />
          <small
            v-if="errors.country !== null"
            class="text-red-500"
            aria-invalid="true"
            id="site-country-edit-error"
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
                class="text-orange-500"
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
      <div class="flex justify-center items-center mx-8 my-14">
        <font-awesome-icon :icon="['fas', 'location-dot']" size="8x" />
      </div>
    </div>
    <template #footer>
      <div class="flex flex-row justify-center items-center gap-10">
        <Button
          text
          type="button"
          label="Supprimer"
          severity="danger"
          pt:root:class="!py-1"
          pt:label:class="!font-semibold"
          :loading="siteDeleteController.isLoading.value"
          @click="onDelete"
        ></Button>
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
          pt:root:class="!py-1"
          pt:label:class="!font-semibold"
          :loading="siteUpdateController.isLoading.value"
          @click="onUpdate"
        ></Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped></style>
