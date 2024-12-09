<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { useSiteManagementStore } from '@/stores/siteManagement.js';
import { useConfirm } from 'primevue/useconfirm';
import { useAddEquipmentToSite } from '@/composables/site.js';
import { useToast } from 'primevue/usetoast';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { usePaginatedBornesList } from '@/composables/borne.js';

const router = useRouter();
const toast = useToast();

const siteManagementStore = useSiteManagementStore();

const visible = ref(false);

const name = ref('');
const type = ref('');
const status = ref('');
const manufacturer = ref('');
const page = ref(0);
const rowOptions = [5, 10, 25, 50];
const limit = ref(rowOptions[0]);
const selectedEquipment = ref([]);

const siteName = ref('null');

const { data, isLoading, fetchBorneList } = usePaginatedBornesList(
  page,
  limit,
  name,
  type,
  status,
  manufacturer,
  siteName,
);

const results = computed(() => data.value?.equipments);
const totalRecords = computed(() => (data.value ? data.value.total : 0));
const offset = computed(() => Number(limit.value * page.value));

const siteEquipmentController = useAddEquipmentToSite();

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

const onAdd = () => {
  siteEquipmentController
    .addEquipmentToSite(
      siteManagementStore.selectedSite.id,
      selectedEquipment.value.map((equipment) => equipment.equipment_id),
    )
    .then((siteUpdated) => {
      if (siteUpdated) {
        siteManagementStore.resetSelectedSite();
        toast.add({
          severity: 'success',
          summary: 'Succès',
          detail: `${selectedEquipment.value.length} équipement${selectedEquipment.value.length > 1 ?? 's'} ajoutés avec succès`,
          life: 3000,
        });
        visible.value = false;
      } else {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Une erreur est survenue lors de l'ajout des équipements",
          life: 3000,
        });
      }
    });
};

const onClose = () => {
  siteManagementStore.resetSelectedSite();
  router.back();
};

onMounted(() => {
  visible.value = true;

  if (!siteManagementStore.selectedSite) {
    router.push({ name: 'dashboardSites' });
  }
});
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
        <span class="text-xl font-bold"
          >{{ siteManagementStore.selectedSite.name }} - Ajouter un
          équipement</span
        >
      </div>
    </template>
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-5 justify-center">
        <div class="flex flex-row gap-8 items-start flex-wrap-reverse">
          <div class="flex flex-col">
            <label for="site-name-add">Nom</label>
            <InputText
              id="site-name-add"
              v-model="name"
              placeholder="Ex: Prise chambre 1"
            />
          </div>
          <div class="flex flex-col">
            <label for="site-type-add">Type</label>
            <InputText
              id="site-type-add"
              v-model="type"
              placeholder="Ex: Prise"
            />
          </div>
          <div class="flex flex-col">
            <label for="site-manufacturer-add">Manufacturer</label>
            <InputText
              id="site-manufacturer-add"
              v-model="manufacturer"
              placeholder="Ex: Tasmota"
            />
          </div>
          <Button
            class="min-w-32"
            label="Rechercher"
            icon="pi pi-search"
            @click="onSearch"
          />
        </div>
      </div>
      <Card>
        <template #content>
          <DataTable
            lazy
            stripedRows
            selection-mode="multiple"
            v-model:selection="selectedEquipment"
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
            @page="onPageChange($event)"
            @update:rows="onLimitChange($event)"
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
          </DataTable>
        </template>
      </Card>
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
          :disabled="!selectedEquipment.length"
          pt:root:class="!py-1"
          pt:label:class="!font-semibold"
          :loading="siteEquipmentController.isLoading.value"
          @click="onAdd"
        >
          {{
            selectedEquipment.length
              ? `Ajouter ${selectedEquipment.length} équipements`
              : 'Ajouter'
          }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped></style>
