<script setup>
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import { getAuth, signOut } from 'firebase/auth';
import { getCurrentUser } from 'vuefire';
import { computed, onMounted, ref } from 'vue';
import { useRouter, useLink, useRoute } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useUserManagementStore } from '@/stores/userManagement.js';

const auth = getAuth();
const user = getCurrentUser();
const router = useRouter();
const route = useRoute();
const confirm = useConfirm();
const toast = useToast();
const userManagementStore = useUserManagementStore();

const expended = ref(false);
const userEmail = ref(null);
const logoCanCenter = ref(false);
const isTransitioning = ref(false);
const willTransition = ref(false);

const onTransitionStart = (event) => {
  if (event.propertyName !== 'width') return;
  logoCanCenter.value = false;
  isTransitioning.value = true;
};

const onTransitionEnd = (event) => {
  if (event.propertyName !== 'width') return;
  logoCanCenter.value = !expended.value;
  isTransitioning.value = false;
  willTransition.value = false;
};

const openOrCloseMenu = () => {
  if (isTransitioning.value === true) return;
  willTransition.value = true;
  expended.value = !expended.value;
};

const fullyClosed = computed(() => {
  return !expended.value && !isTransitioning.value && !willTransition.value;
});

const fullyOpen = computed(() => {
  return expended.value && !isTransitioning.value && !willTransition.value;
});

const buttonCanJustifyCenter = computed(() => {
  return !expended.value && fullyClosed.value;
});

const buttonCanJustifyStart = computed(() => {
  return expended.value && fullyOpen.value;
});

const buttonTextCanShow = computed(() => {
  return expended.value || (!expended.value && !fullyClosed.value);
});

const activeButton = (routeName) => {
  return route.matched.some(({ name }) => name === routeName);
};

const handleLogout = () => {
  confirm.require({
    message: 'Voulez-vous vraiment vous déconnecter?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Annuler',
      severity: 'secondary',
    },
    acceptProps: {
      label: 'Déconnexion',
      severity: 'danger',
      outlined: true,
    },
    accept: () => {
      signOut(auth)
        .then(() => {
          router.push({ name: 'login' });
        })
        .catch(() => {
          toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Une erreur s'est produite lors de la déconnexion",
            life: 3000,
          });
        });
    },
  });
};

onMounted(() => {
  user.then((user) => {
    userEmail.value = user.email;
  });
});
</script>

<template>
  <aside id="#sidemenu" class="flex flex-col justify-center h-full">
    <div
      :class="[
        'flex',
        'flex-col',
        'h-5/6',
        'flex-1',
        'min-w-20',
        'pl-5',
        'pr-5',
        'my-10',
        'shadow',
        'shadow-gray-400',
        'rounded-r-3xl',
        'bg-white',
        'transition-width',
        'ease-in-out',
        'duration-200',
        { 'w-24': !expended, 'w-64': expended },
      ]"
      v-on:transitionstart="(e) => onTransitionStart(e)"
      v-on:transitionend="(e) => onTransitionEnd(e)"
    >
      <div
        id="#sidemenu-header"
        :class="[
          'flex',
          'gap-6',
          'justify-center',
          'items-center',
          'pt-5',
          'pb-5',
          'h-14',
          'w-14',
          {
            'self-center': buttonCanJustifyCenter,
            'self-start': buttonCanJustifyStart,
          },
        ]"
      >
        <img src="../assets/logo.png" alt="logo" />
      </div>
      <div class="divide-y divide-solid w-full mb-5">
        <!-- Those two div are mandatory in order to display the divider
        corectly-->
        <div></div>
        <div></div>
      </div>
      <div id="#sidemenu-footer" class="flex flex-col items-center w-full">
        <Button
          text
          class="min-w-16 w-full"
          style="justify-content: start"
          @click="openOrCloseMenu"
        >
          <div
            :class="[
              'flex',
              'flex-1',
              'flex-row',
              'flex-nowrap',
              'items-center',
              'gap-2',
              {
                'justify-center': buttonCanJustifyCenter,
                'justify-start': buttonCanJustifyStart,
              },
            ]"
          >
            <div
              class="flex justify-center items-center rounded-full border p-2"
              style="
                border-color: var(--p-primary-200);
                color: var(--p-primary-500);
              "
            >
              <font-awesome-icon
                :class="[
                  'transition-all duration-300',
                  { 'rotate-180': expended, 'rotate-0': !expended },
                ]"
                :icon="['fas', 'circle-chevron-right']"
                size="lg"
              />
            </div>
            <span
              v-if="buttonTextCanShow"
              class="text-sm font-medium inline-block w-max"
              >Fermer le menu</span
            >
          </div>
        </Button>
      </div>
      <div class="divide-y divide-solid w-full my-5">
        <!-- Those two div are mandatory in order to display the divider
        corectly-->
        <div></div>
        <div></div>
      </div>
      <div
        id="#sidemenu-body"
        class="flex flex-col items-start justify-start gap-4"
      >
        <Button
          :text="!activeButton('BorneTracking')"
          type="button"
          as="router-link"
          to="/dashboard/borne"
          class="w-full"
          style="justify-content: start"
        >
          <div
            :class="[
              'flex',
              'flex-1',
              'flex-row',
              'flex-nowrap',
              'items-center',
              'gap-2',
              {
                'justify-center': buttonCanJustifyCenter,
                'justify-start': buttonCanJustifyStart,
              },
            ]"
          >
            <font-awesome-icon :icon="['fas', 'plug']" size="lg" />
            <span
              v-if="buttonTextCanShow"
              class="text-sm font-medium inline-block w-max"
              >Suivi des bornes</span
            >
          </div>
        </Button>
        <Button
          :text="!activeButton('dashboardBorneError')"
          type="button"
          as="router-link"
          class="w-full"
          style="justify-content: start"
          to="#"
        >
          <div
            :class="[
              'flex',
              'flex-1',
              'flex-row',
              'flex-nowrap',
              'items-center',
              'gap-2',
              {
                'justify-center': buttonCanJustifyCenter,
                'justify-start': buttonCanJustifyStart,
              },
            ]"
          >
            <font-awesome-icon
              :icon="['fas', 'triangle-exclamation']"
              size="lg"
            />
            <span
              v-if="buttonTextCanShow"
              class="text-sm font-medium inline-block w-max"
              >Bornes en erreur</span
            >
          </div>
        </Button>
        <Button
          :text="!activeButton('dashboardUsers')"
          type="button"
          as="router-link"
          to="/dashboard/users"
          class="w-full"
          style="justify-content: start"
        >
          <div
            :class="[
              'flex',
              'flex-1',
              'flex-row',
              'flex-nowrap',
              'items-center',
              'gap-2',
              {
                'justify-center': buttonCanJustifyCenter,
                'justify-start': buttonCanJustifyStart,
              },
            ]"
          >
            <font-awesome-icon :icon="['fas', 'address-card']" size="lg" />
            <span
              v-if="buttonTextCanShow"
              class="text-sm font-medium inline-block w-max"
              >Gestion des utilisateurs</span
            >
          </div>
        </Button>
        <Button
          :text="!activeButton('dashboardSites')"
          type="button"
          as="router-link"
          class="w-full"
          style="justify-content: start"
          to="/dashboard/sites"
        >
          <div
            :class="[
              'flex',
              'flex-1',
              'flex-nowrap',
              'flex-row',
              'items-center',
              'gap-2',
              {
                'justify-center': buttonCanJustifyCenter,
                'justify-start': buttonCanJustifyStart,
              },
            ]"
          >
            <font-awesome-icon :icon="['fas', 'location-dot']" size="lg" />
            <span
              v-if="buttonTextCanShow"
              class="text-sm font-medium inline-block w-max"
              >Sites</span
            >
          </div>
        </Button>
        <Button
          :text="!activeButton('dashboardMaps')"
          type="button"
          as="router-link"
          class="w-full"
          style="justify-content: start"
          to="/dashboard/maps"
        >
          <div
            :class="[
              'flex',
              'flex-1',
              'flex-nowrap',
              'flex-row',
              'items-center',
              'gap-2',
              {
                'justify-center': buttonCanJustifyCenter,
                'justify-start': buttonCanJustifyStart,
              },
            ]"
          >
            <font-awesome-icon :icon="['fas', 'map']" size="lg" />
            <span
              v-if="buttonTextCanShow"
              class="text-sm font-medium inline-block w-max"
              >Cartes des sites</span
            >
          </div>
        </Button>
      </div>
      <div class="divide-y divide-solid w-full mt-5 mb-5">
        <div></div>
        <div></div>
      </div>
      <div
        id="#sidemenu-footer"
        class="flex flex-col items-center gap-4 w-full pb-5 mt-auto"
      >
        <Button
          :text="!expended"
          severity="secondary"
          class="min-w-20 w-full"
          @click="userManagementStore.toggleProfileModal"
          style="justify-content: start"
        >
          <div
            :class="[
              'flex',
              'flex-1',
              'flex-row',
              'flex-nowrap',
              'items-center',
              'gap-2',
              {
                'justify-center': buttonCanJustifyCenter,
                'justify-start': buttonCanJustifyStart,
              },
            ]"
          >
            <Avatar shape="circle" size="large">
              <font-awesome-icon :icon="['fas', 'user']" size="lg" />
            </Avatar>
            <span v-if="buttonTextCanShow" class="text-xs font-bold">{{
              userEmail ?? ''
            }}</span>
          </div>
        </Button>
        <Button
          outlined
          severity="secondary"
          class="w-full"
          style="justify-content: start"
          @click="handleLogout"
        >
          <div
            :class="[
              'flex',
              'flex-1',
              'flex-row-reverse',
              'flex-nowrap',
              'items-center',
              'gap-2',
              'justify-center',
            ]"
          >
            <span v-if="buttonTextCanShow" class="text-sm font-light"
              >Déconnexion</span
            >
            <font-awesome-icon :icon="['fas', 'power-off']" size="lg" />
          </div>
        </Button>
      </div>
    </div>
  </aside>
</template>

<style scoped></style>
