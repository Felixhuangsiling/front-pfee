<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Inplace from 'primevue/inplace';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useCurrentUser } from 'vuefire';
import { updatePassword } from 'firebase/auth';
import { useUserManagementStore } from '@/stores/userManagement.js';

const userManagementStore = useUserManagementStore();

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

const roleChoices = [
  { name: 'Editeur', content: 'EDITOR' },
  { name: 'Administrateur', content: 'ADMIN' },
  { name: 'Lecteur', content: 'READER' },
];

const visible = ref(false);
const email = ref(null);
const isLoading = ref(false);
const password = ref('');
const confirmPassword = ref('');
const role = ref(roleChoices[0]);
const isEnabled = ref(true);
const user = useCurrentUser();

watch(user, () => {
  console.log(user);
  if (user.value) {
    email.value = user.value.email;
    user.value.getIdTokenResult().then((idTokenResult) => {
      role.value = roleChoices.find(
        (role) => role.content === idTokenResult.claims.role,
      );
    });
  } else {
    router.back();
  }
});

const onUpdatePassword = async (callback) => {
  if (!password.value || password.value.length < 6) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Le mot de passe doit contenir au moins 6 caractères.',
      life: 3000,
    });
    return;
  }

  if (password.value !== confirmPassword.value) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Les mots de passe ne correspondent pas.',
      life: 3000,
    });
    return;
  }

  try {
    const user = useCurrentUser().value;
    if (user) {
      isLoading.value = true;
      await updatePassword(user, password.value);
      toast.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Mot de passe mis à jour avec succès.',
        life: 3000,
      });
      password.value = '';
      confirmPassword.value = '';
      callback();
    } else {
      toast.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Utilisateur non authentifié.',
        life: 3000,
      });
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Impossible de mettre à jour le mot de passe.',
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Dialog
    v-model:visible="userManagementStore.showProfileModal"
    modal
    header="Edit Profile"
    pt:root:class="!rounded-3xl"
    pt:footer:class="border-t border-gray-300 bg-gray-100 !py-2 !rounded-b-3xl !justify-center"
    :style="{ width: '48rem' }"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <Avatar shape="circle" size="large">
          <font-awesome-icon :icon="['fas', 'user']" size="1x" />
        </Avatar>
        <span class="text-xl font-bold">Mon Profile</span>
      </div>
    </template>
    <div class="flex flex-row items-center gap-10">
      <div class="flex flex-col gap-2 flex-1 self-start">
        <div class="flex flex-row items-center gap-6">
          <div class="flex flex-col flex-1 gap-1">
            <label for="email-user-edit" class="text-sm font-semibold w-24">
              Email
            </label>
            <InputText
              id="email-user-edit"
              :disabled="true"
              class="flex-auto"
              autocomplete="off"
              v-model="email"
            />
          </div>
          <div class="flex flex-col justify-start gap-1">
            <label for="enabled" class="text-sm font-semibold w-24">
              Activation
            </label>
            <div class="flex flex-row gap-2 justify-start items-center">
              <ToggleSwitch id="enabled" v-model="isEnabled" :disabled="true">
                <template #handle="{ checked }">
                  <i
                    :class="[
                      '!text-xs pi',
                      { 'pi-check': checked, 'pi-times': !checked },
                    ]"
                  />
                </template>
              </ToggleSwitch>
              <span v-if="isEnabled" class="text-sm" style="color: green">
                Actif
              </span>
              <span v-else class="text-sm" style="color: red">Inactif</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-1 flex-1">
          <label for="roleFilter" class="text-sm font-semibold w-24"
            >Role</label
          >
          <Select
            fluid
            class="flex-1"
            :disabled="true"
            id="roleFilter"
            v-model="role"
            :options="roleChoices"
            optionLabel="name"
          />
        </div>
        <div class="flex-1">
          <Inplace class="mx-auto">
            <template #display> Changer mon mot de passe </template>
            <template #content="{ closeCallback }">
              <div class="flex flex-col gap-2">
                <div class="flex flex-col gap-1">
                  <label for="password" class="text-sm font-semibold w-24">
                    Mot de passe
                  </label>
                  <InputText
                    id="password"
                    class="flex-auto"
                    autocomplete="off"
                    v-model="password"
                    type="password"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label
                    for="confirmPassword"
                    class="text-sm font-semibold w-24"
                  >
                    Confirmer
                  </label>
                  <InputText
                    id="confirmPassword"
                    class="flex-auto"
                    autocomplete="off"
                    v-model="confirmPassword"
                    type="password"
                  />
                </div>
                <div class="flex flex-1 flex-row justify-between items-center">
                  <Button
                    text
                    type="button"
                    label="Annuler"
                    severity="primary"
                    pt:root:class="!py-1"
                    pt:label:class="!font-semibold"
                    @click="closeCallback"
                  ></Button>
                  <Button
                    type="button"
                    label="Enregistrer"
                    pt:root:class="!py-1"
                    pt:label:class="!font-semibold"
                    :loading="isLoading"
                    @click="onUpdatePassword(closeCallback)"
                  ></Button>
                </div>
              </div>
            </template>
          </Inplace>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped></style>
