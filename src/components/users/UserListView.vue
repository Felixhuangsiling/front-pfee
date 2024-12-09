<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useUsersList } from '../../composables/user.js';
import { useUserManagementStore } from '../../stores/userManagement.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const router = useRouter();

const userManagementStore = useUserManagementStore();

const search = ref(null);
const page = ref(0);
const rowOptions = [5, 10, 25, 50];
const limit = ref(rowOptions[0]);

const roleChoices = [
  { name: 'Tous', content: null },
  { name: 'Administrateur', content: 'ADMIN' },
  { name: 'Editeur', content: 'EDITOR' },
  { name: 'Lecteur', content: 'READER' },
];

const isEnabledChoices = [
  { name: 'Tous', content: null },
  { name: 'Activé', content: true },
  { name: 'Désactivé', content: false },
];

const roleFilter = ref(roleChoices[0]);
const isEnabledFilter = ref(isEnabledChoices[0]);

const { data, isLoading, error, fetchUsersList } = useUsersList(
  page,
  limit,
  search,
  roleFilter,
  isEnabledFilter,
);

const results = computed(() => data.value?.users);
const totalRecords = computed(() => data.value?.total);
const offset = computed(() => Number(limit.value * page.value));

function onPageChange(event) {
  if (event.page !== page.value) page.value = event.page;
}

function onLimitChange(event) {
  if (event !== limit.value) limit.value = event;
}

function onSearch() {
  page.value = 0;
  fetchUsersList(); //manually fetch data
}

function onRowSelect(event) {
  userManagementStore.setSelectedUser(event.data);
  router.push({
    name: 'dashboardUsersEdit',
    params: { id: event.data.uuid },
  });
}
</script>

<template>
  <div class="flex flex-col gap-10 flex-1">
    <div class="flex flex-row justify-between items-center">
      <h1 class="text-4xl font-bold">Gestion des utilisateurs</h1>
      <Button
        class="min-w-32"
        label="Ajouter un utilisateur"
        icon="pi pi-plus"
        @click="() => router.push('/dashboard/users/create')"
      />
    </div>

    <div class="flex flex-col gap-5 justify-center">
      <div class="flex flex-row gap-8 items-end">
        <InputText
          class="flex-1"
          id="search"
          v-model="search"
          placeholder="Rechercher par adresse mail"
        />
        <div class="flex flex-col">
          <label for="roleFilter">Role</label>
          <Select
            class="min-w-44"
            id="roleFilter"
            v-model="roleFilter"
            :options="roleChoices"
            optionLabel="name"
            placeholder="Choisir un role"
          />
        </div>
        <div class="flex flex-col">
          <label for="isEnabledFilter">Activation</label>
          <Select
            class="min-w-44"
            id="isEnabledFilter"
            v-model="isEnabledFilter"
            :options="isEnabledChoices"
            optionLabel="name"
            placeholder="Choisir un statut"
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
            rowHover
            stripedRows
            selection-mode="single"
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
          >
            <template #paginatorstart>
              <div class="flex flex-row gap-2">
                <i class="pi pi-list"></i>
                <span class="text-xs">{{ totalRecords }} utilisateurs</span>
              </div>
            </template>
            <template #paginatorend>
              <Button rounded @click="fetchUsersList">
                <template #icon>
                  <font-awesome-icon :icon="['fas', 'rotate-right']" />
                </template>
              </Button>
            </template>
            <Column
              sortable
              field="email"
              header="Email"
              style="width: 33%"
            ></Column>
            <Column
              sortable
              field="role"
              header="Role"
              style="width: 33%"
            ></Column>
            <Column
              sortable
              field="isEnabled"
              header="Activation"
              style="width: 33%"
            >
              <template #body="slotProps">
                <i
                  v-if="slotProps.data.enabled"
                  class="pi pi-check"
                  style="color: green"
                ></i>
                <i v-else class="pi pi-times" style="color: red"></i>
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
