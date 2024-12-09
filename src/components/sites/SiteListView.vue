<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import OverlayBadge from 'primevue/overlaybadge';
import {
  usePaginatedSiteList,
  useRemoveEquipmentFromSite,
} from '@/composables/site.js';
import { useSiteManagementStore } from '@/stores/siteManagement.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

const siteManagementStore = useSiteManagementStore();

const name = ref(null);
const address = ref(null);
const city = ref(null);
const postalCode = ref(null);
const country = ref(null);
const page = ref(0);
const rowOptions = [5, 10, 25, 50];
const limit = ref(rowOptions[0]);
const selectedSite = ref(null);
const expandedRows = ref({});
const selectedEquipments = ref([]);

const { data, isLoading, fetchSitesList } = usePaginatedSiteList(
  page,
  limit,
  name,
  address,
  city,
  postalCode,
  country,
);

const results = computed(() => data.value?.sites);
const totalRecords = computed(() => (data.value ? data.value.total : 0));
const offset = computed(() => Number(limit.value * page.value));

const siteEquipmentController = useRemoveEquipmentFromSite();

function handleSiteEdit() {
  if (selectedSite.value) {
    router.push({
      name: 'dashboardSitesEdit',
      params: { id: selectedSite.value.id },
    });
    selectedSite.value = null;
  }
}

function handleAddEquipmentToSite() {
  if (expandedRows.value) {
    const targetId = Object.keys(expandedRows.value)[0];
    const targetSite = results.value.find((site) => site.id === targetId);
    siteManagementStore.setSelectedSite(targetSite);
    router.push({
      name: 'dashboardSitesAddEquipment',
      params: { id: targetId },
    });
    selectedSite.value = null;
  }
}

function handleRemoveEquipmentFromSite() {
  const multiple = selectedEquipments.value.length > 1;
  const targetId = Object.keys(expandedRows.value)[0];
  const equipmentIds = selectedEquipments.value.map(
    (equipment) => equipment.equipment_id,
  );
  console.log(equipmentIds);
  confirm.require({
    message: `Voulez-vous vraiment désassigner ${
      multiple ? 'ces équipements' : 'cet équipement'
    } du site ?`,
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
      siteEquipmentController
        .deleteEquipmentFromSite(targetId, equipmentIds)
        .then((siteUpdated) => {
          if (siteUpdated) {
            siteManagementStore.resetSelectedSite();
            toast.add({
              severity: 'success',
              summary: 'Succès',
              detail: `${selectedEquipments.value.length} équipement${multiple ?? 's'} supprimé${multiple ?? 's'} avec succès`,
              life: 3000,
            });
            selectedEquipments.value = [];
            fetchSitesList();
          } else {
            toast.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Une erreur est survenue lors de la suppression ${
                multiple ? 'des équipements' : "de l'équipement"
              }`,
              life: 3000,
            });
          }
        });
    },
  });
}

function onPageChange(event) {
  if (event.page !== page.value) page.value = event.page;
}

function onLimitChange(event) {
  if (event !== limit.value) limit.value = event;
}

function onSearch() {
  page.value = 0;
  fetchSitesList(); //manually fetch data
}

const onRowExpand = (event) => {
  selectedEquipments.value = [];
  expandedRows.value = {
    [event.data.id]: true,
  };
  event.originalEvent.stopPropagation();
};

const onRowCollapse = (event) => {
  selectedEquipments.value = [];
  event.originalEvent.stopPropagation();
};

function onRowSelect(event) {
  console.log(event);
  siteManagementStore.setSelectedSite(event.data);
}
</script>

<template>
  <div class="flex flex-col gap-10 flex-1">
    <div class="flex flex-row justify-between items-center">
      <h1 class="text-4xl font-bold">Gestion des sites</h1>
      <div class="flex flex-row items-center gap-2">
        <Button
          :disabled="!selectedSite"
          class="min-w-32"
          label="Modifier un site"
          @click="handleSiteEdit"
        >
          <template #icon>
            <font-awesome-icon :icon="['fas', 'pen']" />
          </template>
        </Button>
        <Button
          class="min-w-32"
          label="Créer un site"
          @click="() => router.push('/dashboard/sites/create')"
        >
          <template #icon>
            <font-awesome-icon :icon="['fas', 'plus']" />
          </template>
        </Button>
      </div>
    </div>

    <div class="flex flex-col gap-5 justify-center">
      <div class="flex flex-row gap-8 items-start flex-wrap-reverse">
        <div class="flex flex-col flex-1">
          <label for="site-name">Nom</label>
          <InputText
            class="flex-1"
            id="site-name"
            v-model="name"
            placeholder="Ex: Batiment Voltaire"
          />
        </div>
        <div class="flex flex-col flex-1">
          <label for="site-address">Adresse</label>
          <InputText
            class="flex-1"
            id="site-address"
            v-model="address"
            placeholder="Ex: 15 rue des prés"
          />
        </div>
        <div class="flex flex-col">
          <label for="site-city">Ville</label>
          <InputText
            class="max-w-36"
            id="site-city"
            v-model="city"
            placeholder="Ex: Lyon"
          />
        </div>
        <div class="flex flex-col">
          <label for="site-postal-code">Code Postale</label>
          <InputText
            class="max-w-36"
            id="site-postal-code"
            v-model="postalCode"
            placeholder="Ex: 94270"
          />
        </div>
        <div class="flex flex-col">
          <label for="site-country">Pays</label>
          <InputText
            class="max-w-36"
            id="site-country"
            v-model="country"
            placeholder="Ex: France"
          />
        </div>
        <Button
          class="min-w-32"
          label="Rechercher"
          icon="pi pi-search"
          @click="onSearch"
        />
      </div>
      <Card>
        <template #content>
          <DataTable
            lazy
            stripedRows
            selection-mode="single"
            v-model:expandedRows="expandedRows"
            v-model:selection="selectedSite"
            dataKey="id"
            :value="results"
            :loading="isLoading"
            paginator
            :first="offset"
            :rows="limit"
            :rowsPerPageOptions="rowOptions"
            :totalRecords="totalRecords"
            tableStyle="min-width: 50rem"
            sortMode="multiple"
            removableSort
            @page="onPageChange"
            @update:rows="onLimitChange"
            @row-click="onRowSelect"
            @rowExpand="onRowExpand"
            @rowCollapse="onRowCollapse"
          >
            <template #paginatorstart>
              <div class="flex flex-row gap-2">
                <i class="pi pi-list"></i>
                <span class="text-xs">{{ totalRecords }} sites</span>
              </div>
            </template>
            <template #paginatorend>
              <Button rounded @click="fetchSitesList">
                <template #icon>
                  <font-awesome-icon :icon="['fas', 'rotate-right']" />
                </template>
              </Button>
            </template>
            <Column expander style="width: 5rem" />
            <Column sortable field="name" header="Nom du site"></Column>
            <Column sortable field="address" header="Adresse"></Column>
            <Column sortable field="city" header="Ville"></Column>
            <Column sortable field="postalCode" header="Code postale"></Column>
            <Column sortable field="country" header="Pays"></Column>
            <Column sortable field="equipments" header="Nombre d'équipements">
              <template #body="slotProps">
                <span>{{
                  slotProps.data.equipments
                    ? slotProps.data.equipments.length
                    : 0
                }}</span>
              </template>
            </Column>
            <template #expansion="slotProps">
              <div class="flex flex-row gap-5 p-4">
                <Card
                  class="flex flex-row justify-center flex-1"
                  pt:body:class="flex-1"
                >
                  <template #content>
                    <DataTable
                      v-if="
                        slotProps.data.equipments &&
                        slotProps.data.equipments.length > 0
                      "
                      stripedRows
                      selection-mode="multiple"
                      v-model:selection="selectedEquipments"
                      dataKey="equipment_id"
                      :value="slotProps.data.equipments"
                    >
                      <Column
                        sortable
                        field="equipment_id"
                        header="Id"
                      ></Column>
                      <Column sortable field="name" header="Nom"></Column>
                      <Column sortable field="type" header="Type"></Column>
                      <Column sortable field="status" header="Status"></Column>
                      <Column
                        sortable
                        field="manufacturer"
                        header="Manufacturer"
                      ></Column>
                    </DataTable>
                    <h2 class="mx-auto my-auto text-center" v-else>
                      Aucun équipement
                    </h2>
                  </template>
                </Card>
                <div class="flex flex-col gap-2">
                  <Button @click="handleAddEquipmentToSite">
                    <template #icon>
                      <font-awesome-icon :icon="['fas', 'plug-circle-plus']" />
                    </template>
                  </Button>
                  <OverlayBadge
                    severity="danger"
                    :value="selectedEquipments.length"
                    size="small"
                  >
                    <Button
                      :disabled="
                        !slotProps.data.equipments ||
                        slotProps.data.equipments.length === 0 ||
                        selectedEquipments.length === 0
                      "
                      severity="danger"
                      @click="handleRemoveEquipmentFromSite"
                    >
                      <template #icon>
                        <font-awesome-icon
                          :icon="['fas', 'plug-circle-minus']"
                        />
                      </template>
                    </Button>
                  </OverlayBadge>
                </div>
              </div>
            </template>
          </DataTable>
        </template>
      </Card>
    </div>
  </div>
  <RouterView />
</template>

<style scoped></style>
