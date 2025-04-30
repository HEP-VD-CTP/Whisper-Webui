import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/transcriptions.vue') }],
    beforeEnter: (to, from, next) => {
      next();
    }
  },
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },
  {
    path: '/expired',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Expired.vue') }],
  },
  {
    path: '/logout',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Logout.vue') }],
  },

  {
    path: '/users',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Users.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
