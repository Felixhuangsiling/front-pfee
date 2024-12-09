<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useSiteNamesList } from '@/composables/site.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { usePaginatedBornesList } from '@/composables/borne.js';
import Select from 'primevue/select';
import { useBorneManagementStore } from '@/stores/borneManagement.js';

const router = useRouter();

const name = ref('');
const type = ref('');
const manufacturer = ref('');
const page = ref(0);
const rowOptions = [5, 10, 25, 50];
const limit = ref(rowOptions[0]);

const statusChoices = [
  { name: 'Tous', content: null },
  { name: 'Activé', content: 'ACTIVE' },
  { name: 'Désactivé', content: 'DISABLE' },
];

const typesChoices = [
  { name: 'Tous', content: null },
  { name: 'Shelly', content: 'SHELLY' },
  { name: 'Tasmota', content: 'TASMOTA' },
  { name: 'Autre', content: 'OTHER' },
];

const siteChoices = [{ name: 'Tous', content: null }];

const siteFilter = ref(siteChoices[0]);
const statusFilter = ref(statusChoices[0]);
const typeFilter = ref(typesChoices[0]);

const statusValue = computed(() => statusFilter.value.content);
const siteValue = computed(() => siteFilter.value.content);
const typeValue = computed(() => typeFilter.value.content);

const { data, isLoading, fetchBorneList } = usePaginatedBornesList(
  page,
  limit,
  name,
  typeValue,
  statusValue,
  manufacturer,
  siteValue,
);

const siteNamesController = useSiteNamesList();

const results = computed(() => data.value?.equipments);
const totalRecords = computed(() => (data.value ? data.value.total : 0));
const offset = computed(() => Number(limit.value * page.value));

function onPageChange(event) {
  if (event.page !== page.value) page.value = event.page;
}

function onLimitChange(event) {
  if (event !== limit.value) limit.value = event;
}

function onSearch() {
  page.value = 0;
  fetchBorneList(); //manually fetch data
}

function onRowSelect(event) {
  router.push({
    name: 'details',
    params: { equipment_id: event.data.equipment_id },
  });
}

onMounted(() => {
  siteNamesController.fetchSiteNamesList().then((sites) => {
    console.log(sites);
    if (sites) {
      siteChoices.push(
        ...sites.map((site) => ({ name: site.name, content: site.name })),
      );
    }
  });
});
</script>

<template>
  <div class="flex flex-col gap-10 flex-1">
    <div class="flex flex-row justify-between items-center">
      <h1 class="text-4xl font-bold">Gestion des équipements</h1>
      <Button
        class="min-w-32"
        label="Ajouter un équipement"
        @click="() => router.push('/dashboard/borne/create')"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'plus']" />
        </template>
      </Button>
    </div>

    <div class="flex flex-col gap-5 justify-center">
      <div class="flex flex-row gap-8 items-end flex-wrap">
        <div class="flex flex-col flex-1">
          <label for="site-name">Nom</label>
          <InputText
            id="site-name"
            v-model="name"
            placeholder="Ex: Prise chambre 1"
          />
        </div>
        <div class="flex flex-col">
          <label for="site-type">Type</label>
          <Select
            class="w-32"
            id="site-type"
            v-model="typeFilter"
            :options="typesChoices"
            optionLabel="name"
            placeholder="Choisir un type"
          />
        </div>
        <div class="flex flex-col">
          <label for="site-status-filter">Status</label>
          <Select
            class="w-32"
            id="site-status-filter"
            v-model="statusFilter"
            :options="statusChoices"
            optionLabel="name"
            placeholder="Choisir un role"
          />
        </div>
        <div class="flex flex-col">
          <label for="site-manufacturer">Manufacturer</label>
          <InputText
            id="site-manufacturer"
            v-model="manufacturer"
            placeholder="Ex: Tasmota"
          />
        </div>
        <div class="flex flex-col">
          <label for="site-site-filter">Site</label>
          <Select
            class="w-32"
            id="site-site-filter"
            v-model="siteFilter"
            :options="siteChoices"
            optionLabel="name"
            placeholder="Choisir un site"
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
            :value="results"
            dataKey="equipment_id"
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
          >
            <template #paginatorstart>
              <div class="flex flex-row gap-2">
                <i class="pi pi-list"></i>
                <span class="text-xs">{{ totalRecords }} équipements</span>
              </div>
            </template>
            <template #paginatorend>
              <Button rounded @click="fetchBorneList">
                <template #icon>
                  <font-awesome-icon :icon="['fas', 'rotate-right']" />
                </template>
              </Button>
            </template>
            <Column sortable field="equipment_id" header="Id"></Column>
            <Column sortable field="name" header="Nom"></Column>
            <Column sortable field="type" header="Type"></Column>
            <Column sortable field="status" header="Status"></Column>
            <Column
              sortable
              field="manufacturer"
              header="Manufacturer"
            ></Column>
            <Column sortable field="site" header="Site">
              <template #body="{ data }">
                <span>{{ data.site ? data.site.name : '-' }}</span>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  </div>
  <RouterView />
</template>

<style scoped></style>
