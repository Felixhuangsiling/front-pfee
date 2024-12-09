<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { useUserManagementStore } from '@/stores/userManagement.js';
import { useConfirm } from 'primevue/useconfirm';
import { useDeleteUser, useUpdateUser } from '@/composables/user.js';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

const userManagementStore = useUserManagementStore();

const roleChoices = [
  { name: 'Administrateur', content: 'ADMIN' },
  { name: 'Editeur', content: 'EDITOR' },
  { name: 'Lecteur', content: 'READER' },
];

const visible = ref(false);
const email = ref(null);
const role = ref(roleChoices[0]);
const emailError = ref(null);
const isEnabled = ref(false);
const userDeleteController = useDeleteUser();
const userUpdateController = useUpdateUser();

onMounted(() => {
  visible.value = true;

  if (!userManagementStore.selectedUser) {
    router.push({ name: 'dashboardUsers' });
  } else {
    email.value = userManagementStore.selectedUser.email;
    isEnabled.value = userManagementStore.selectedUser.enabled;
    role.value = roleChoices.find(
      (role) => role.content === userManagementStore.selectedUser.role,
    );
  }
});

const onClose = () => {
  userManagementStore.resetSelectedUser();
  router.back();
};

const handleEmailChange = () => {
  emailError.value = null;
};

const onUpdate = () => {
  if (!email.value) {
    emailError.value = 'Email est requis';
    return;
  }

  if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = 'Email invalide';
    return;
  }

  userUpdateController
    .updateUser({
      uuid: userManagementStore.selectedUser.uuid,
      email: email.value,
      role: role.value.content,
      enabled: isEnabled.value,
    })
    .then((userUpdated) => {
      if (userUpdated) {
        userManagementStore.resetSelectedUser();
        visible.value = false;
        toast.add({
          severity: 'success',
          summary: 'Sauvegardé',
          detail: "L'utilisateur a été mis à jour",
          life: 3000,
        });
      } else {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail:
            "Une erreur s'est produite lors de la mise à jour de l'utilisateur",
          life: 3000,
        });
      }
    });
};

const onDelete = () => {
  confirm.require({
    message: 'Voulez-vous vraiment supprimer cet utilisateur?',
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
      userDeleteController
        .deleteUser(userManagementStore.selectedUser.uuid)
        .then((userDeleted) => {
          if (userDeleted) {
            userManagementStore.resetSelectedUser();
            visible.value = false;
            toast.add({
              severity: 'success',
              summary: 'Supprimé',
              detail: "L'utilisateur a été supprimé",
              life: 3000,
            });
          } else {
            toast.add({
              severity: 'error',
              summary: 'Erreur',
              detail:
                "Une erreur s'est produite lors de la suppression de l'utilisateur",
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
        <span class="text-xl font-bold">Modifier un utilisateur</span>
      </div>
    </template>
    <div class="flex flex-row items-center gap-10">
      <div class="flex flex-col gap-2 flex-1 self-start">
        <div class="flex flex-row items-center gap-6">
          <div class="flex flex-col flex-1 gap-1">
            <label for="email-user-edit" class="text-sm font-semibold w-24"
              >Email</label
            >
            <InputText
              id="email-user-edit"
              class="flex-auto"
              autocomplete="off"
              aria-errormessage="email-user-edit-error"
              v-model="email"
              :invalid="emailError !== null"
              v-on:change="handleEmailChange"
            />
            <small
              v-if="emailError !== null"
              class="text-red-500"
              aria-invalid="true"
              id="email-user-edit-error"
              >{{ emailError }}</small
            >
          </div>
          <div class="flex flex-col justify-start gap-1">
            <label for="enabled" class="text-sm font-semibold w-24"
              >Activation</label
            >
            <div class="flex flex-row gap-2 justify-start items-center">
              <ToggleSwitch id="enabled" v-model="isEnabled">
                <template #handle="{ checked }">
                  <i
                    :class="[
                      '!text-xs pi',
                      { 'pi-check': checked, 'pi-times': !checked },
                    ]"
                  />
                </template>
                <template #slider="{ checked }">
                  <i
                    :class="[
                      '!text-xs pi',
                      { 'pi-check': checked, 'pi-times': !checked },
                    ]"
                  />
                </template>
              </ToggleSwitch>
              <span v-if="isEnabled" class="text-sm" style="color: green"
                >Actif</span
              >
              <span v-else class="text-sm" style="color: red">Inactif</span>
            </div>
          </div>
        </div>
        <div class="flex-1">
          <div class="flex flex-col gap-1 flex-1">
            <label for="roleFilter" class="text-sm font-semibold w-24"
              >Role</label
            >
            <Select
              fluid
              class="flex-1"
              id="roleFilter"
              v-model="role"
              :options="roleChoices"
              optionLabel="name"
              placeholder="Choisir un role"
            />
          </div>
        </div>
      </div>
      <div class="flex justify-center items-center mx-8 my-14">
        <font-awesome-icon :icon="['fas', 'user']" size="8x" />
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
          :loading="userDeleteController.isLoading.value"
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
          pt:root:class="!py-1"
          pt:label:class="!font-semibold"
          :loading="userUpdateController.isLoading.value"
          @click="onUpdate"
        ></Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped></style>
