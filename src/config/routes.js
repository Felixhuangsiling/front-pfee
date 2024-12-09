import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '../components/LoginView.vue';
import UserListView from '../components/users/UserListView.vue';
import { getCurrentUser } from 'vuefire';
import UserCreateModalView from '../components/users/UserCreateModalView.vue';
import UserEditModalView from '../components/users/UserEditModalView.vue';
import BorneDetail from '@/components/bornes/BorneDetail.vue';
import MainPage from '@/components/MainPage.vue';
import SiteListView from '@/components/sites/SiteListView.vue';
import SiteEditModalView from '@/components/sites/SiteEditModalView.vue';
import SiteCreateModalView from '@/components/sites/SiteCreateModalView.vue';
import SiteAddEquipmentModalView from '@/components/sites/SiteAddEquipmentModalView.vue';
import BorneListView from '@/components/bornes/BorneListView.vue';
import BorneCreateModalView from '@/components/bornes/BorneCreateModalView.vue';
import SiteMapView from '@/components/sites/SiteMapView.vue';

const routes = [
  { path: '/', redirect: { name: 'dashboardRoot' } },
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/dashboard',
    name: 'dashboardRoot',
    component: MainPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'users',
        name: 'dashboardUsers',
        component: UserListView,
        children: [
          {
            path: 'create',
            name: 'dashboardUsersCreate',
            component: UserCreateModalView,
          },
          {
            path: 'edit',
            name: 'dashboardUsersEditRoot',
            redirect: { name: 'dashboardUsers' },
            children: [
              {
                path: ':id',
                name: 'dashboardUsersEdit',
                component: UserEditModalView,
              },
            ],
          },
        ],
      },
      {
        path: 'sites',
        name: 'dashboardSites',
        component: SiteListView,
        children: [
          {
            path: 'create',
            name: 'dashboardSitesCreate',
            component: SiteCreateModalView,
          },
          {
            path: 'edit',
            name: 'dashboardSitesEditRoot',
            redirect: { name: 'dashboardSites' },
            children: [
              {
                path: ':id',
                name: 'dashboardSitesEdit',
                component: SiteEditModalView,
              },
            ],
          },
          {
            path: 'equipments',
            name: 'dashboardSitesAddEquipmentRoot',
            redirect: { name: 'dashboardSites' },
            children: [
              {
                path: ':id',
                name: 'dashboardSitesAddEquipment',
                component: SiteAddEquipmentModalView,
              },
            ],
          },
        ],
      },
      {
        path: 'maps',
        name: 'dashboardMaps',
        component: SiteMapView,
      },
      {
        path: 'borne',
        name: 'BorneTracking',
        component: BorneListView,
        children: [
          {
            path: 'create',
            name: 'borneCreate',
            component: BorneCreateModalView,
          },
        ],
      },
      {
        path: 'borne/:equipment_id',
        name: 'details',
        component: BorneDetail,
        props: true,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

function isCurrentRouteAuthenticated(route) {
  return route.meta && route.meta.requiresAuth;
}

router.beforeEach(async (to) => {
  // routes with `meta: { requiresAuth: true }` will check for
  // the users, others won't
  if (isCurrentRouteAuthenticated(to)) {
    const currentUser = await getCurrentUser();
    // if the user is not logged in, redirect to the login page
    if (!currentUser) {
      return {
        path: '/login',
        query: {
          // we keep the current path in the query so we can
          // redirect to it after login with
          // `router.push(route.query.redirect || '/')`
          redirect: to.fullPath,
        },
      };
    }
  }
});

export { router, isCurrentRouteAuthenticated };
