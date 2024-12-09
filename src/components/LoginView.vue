<script setup>
import { ref, onBeforeMount } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { FirebaseError } from '@firebase/util';
import { useRouter, useRoute } from 'vue-router';

import { signInWithEmailAndPassword } from 'firebase/auth';

import { useCurrentUser, useFirebaseAuth } from 'vuefire';

const auth = useFirebaseAuth();

const router = useRouter();
const route = useRoute();
const email = ref('');
const password = ref('');
const emailError = ref(null);
const passwordError = ref(null);
const loading = ref(false);
const error = ref(false);

//If page loaded check if user is already logged in
onBeforeMount(() => {
  const user = useCurrentUser();

  if (user) {
    if (route.query.redirect) router.push(route.query.redirect);
    else router.push('/dashboard');
  }
});

const login = async () => {
  if (!email.value || !password.value) {
    emailError.value = !email.value ? 'Email est requis' : null;
    passwordError.value = !password.value ? 'Le mot de passe est requis' : null;
    return;
  }

  if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = 'Email invalide';
    return;
  }

  try {
    loading.value = true;
    await signInWithEmailAndPassword(auth, email.value, password.value);
    if (route.query.redirect) {
      router.push(route.query.redirect);
    } else {
      router.push('/dashboard');
    }
  } catch (e) {
    error.value = true;
    if (e instanceof FirebaseError) {
      switch (e.code) {
        case 'auth/user-not-found':
          emailError.value = 'Utilisateur non trouvé';
          break;
        case 'auth/invalid-credential':
          passwordError.value = 'Mot de passe incorrect';
          break;
        default:
          passwordError.value = "Une erreur s'est produite";
      }
    }
  } finally {
    loading.value = false;
  }
};

const handleEmailChange = () => {
  emailError.value = null;
};

const handlePasswordChange = () => {
  passwordError.value = null;
};
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <Card class="min-w-96 w-4/12">
      <template #title
        ><h1 class="text-black font-bold">
          Bienvenue sur BRS - Panel Borne
        </h1></template
      >
      <template #content>
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-2">
            <label for="email">Email</label>
            <InputText
              type="email"
              fluid
              id="email"
              v-model="email"
              placeholder="email@mail.com"
              :invalid="emailError !== null || error"
              aria-errormessage="email-error"
              v-on:change="handleEmailChange"
            />
            <small class="text-red-500" aria-invalid="true" id="email-error">{{
              emailError
            }}</small>
          </div>
          <div class="flex flex-col gap-2">
            <label for="username">Mot de passe</label>
            <Password
              fluid
              id="username"
              :feedback="false"
              v-model="password"
              placeholder="Entrez votre mot de passe"
              :invalid="passwordError !== null || error"
              aria-errormessage="password-error"
              v-on:change="handlePasswordChange"
            />
            <small
              class="text-red-500"
              aria-invalid="true"
              id="password-error"
              >{{ passwordError }}</small
            >
          </div>
          <Button
            class="max-w-32"
            label="Connexion"
            :loading="loading"
            @click="login"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped></style>
