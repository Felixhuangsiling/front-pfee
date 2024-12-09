<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Password from 'primevue/password';
import { useCreateUser } from '@/composables/user.js';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const roleChoices = [
  { name: 'Administrateur', content: 'ADMIN' },
  { name: 'Editeur', content: 'EDITOR' },
  { name: 'Lecteur', content: 'READER' },
];

const visible = ref(false);
const email = ref('');
const password = ref('');
const emailError = ref(null);
const passwordError = ref(null);
const role = ref(roleChoices[2]);

const { isLoading, error, createUser } = useCreateUser();

onMounted(() => {
  visible.value = true;
});

const onClose = () => {
  router.back();
};

const handleEmailChange = () => {
  emailError.value = null;
  error.value = false;
};

const handlePasswordChange = () => {
  passwordError.value = null;
  error.value = false;
};

const onSave = (dismissable) => {
  if (!email.value || !password.value) {
    emailError.value = !email.value ? 'Email est requis' : null;
    passwordError.value = !password.value ? 'Le mot de passe est requis' : null;
    return;
  }

  if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = 'Email invalide';
    return;
  }

  if (password.value.length < 6) {
    passwordError.value = 'Le mot de passe doit contenir au moins 6 caractères';
    return;
  }

  createUser({
    email: email.value,
    password: password.value,
    role: role.value.content,
  }).then((created) => {
    console.log(created);

    if (created) {
      toast.add({
        severity: 'success',
        summary: 'Utilisateur créé',
        detail: "L'utilisateur a été créé avec succès",
        life: 3000,
      });

      if (dismissable) {
        visible.value = false;
      } else {
        email.value = '';
        password.value = '';
        role.value = roleChoices[2];
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
        <span class="text-xl font-bold">Créer un utilisateur</span>
      </div>
    </template>
    <div class="flex flex-row items-center gap-10">
      <div class="flex flex-col gap-2 flex-1">
        <div class="flex flex-col gap-1">
          <label for="email-user-create" class="text-sm font-semibold"
            >Email</label
          >
          <InputText
            id="email-user-create"
            class="flex-auto"
            autocomplete="off"
            :invalid="emailError !== null || error"
            aria-errormessage="email-user-create-error"
            v-model="email"
            v-on:change="handleEmailChange"
          />
          <small
            v-if="emailError !== null"
            class="text-red-500"
            aria-invalid="true"
            id="email-user-create-error"
            >{{ emailError }}</small
          >
        </div>
        <div class="flex flex-col gap-1">
          <label for="password-user-create" class="text-sm font-semibold"
            >Mot de passe</label
          >
          <Password
            fluid
            id="password-user-create"
            :feedback="false"
            class="flex-auto"
            autocomplete="off"
            :invalid="passwordError !== null || error"
            aria-errormessage="password-user-create-error"
            v-model="password"
            v-on:change="handlePasswordChange"
          />
          <small
            v-if="emailError !== null"
            class="text-red-500"
            aria-invalid="true"
            id="password-user-create-error"
            >{{ passwordError }}</small
          >
        </div>
        <div class="flex-1">
          <div class="flex flex-col gap-1 flex-1">
            <label for="roleFilter" class="text-sm font-semibold">Droits</label>
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
      <div class="flex justify-center items-center mx-8">
        <font-awesome-icon :icon="['fas', 'user']" size="8x" />
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
