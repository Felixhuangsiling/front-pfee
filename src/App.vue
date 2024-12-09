<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useCurrentUser } from 'vuefire';
import { watch } from 'vue';
import { isCurrentRouteAuthenticated } from './config/routes.js';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import { useAxiosStore } from '@/stores/axios.js';
import UserProfileModalView from '@/components/users/UserProfileModalView.vue';

const user = useCurrentUser();
const router = useRouter();
const route = useRoute();
const axiosStore = useAxiosStore();

watch(user, async (currentUser, previousUser) => {
  // update the axios store with the new user token
  if (currentUser) {
    axiosStore.updateUserToken(currentUser);
  }

  // reset the axios store if the user logs out
  if (!currentUser && previousUser) {
    axiosStore.resetInstance();
  }

  // redirect to login if they logout and the current
  // route is only for authenticated users
  if (!currentUser && previousUser && isCurrentRouteAuthenticated(route)) {
    return router.push({ name: 'login', query: { redirect: route.fullPath } });
  }
  // redirect the user if they are logged in but were
  // rejected because the user wasn't ready yet, logged in
  // then got back to this page
  if (currentUser && typeof route.query.redirect === 'string') {
    return router.push(route.query.redirect);
  }
});
</script>

<template>
  <div id="root" class="h-max">
    <RouterView />
    <UserProfileModalView />
  </div>
  <Toast />
  <ConfirmDialog></ConfirmDialog>
</template>

<style>
#root,
html,
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background: #f2f4f5;
}
</style>
