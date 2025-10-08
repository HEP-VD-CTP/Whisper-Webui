import type { RouteRecordRaw } from 'vue-router';
import { whisperStore } from 'stores/WhisperStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/transcriptions.vue'),
        beforeEnter: (to, from, next) => {
          if (whisperStore().getUser() == null) {
            return next('/login')
          }
          next()
        },
        children: [
          {
            path: '',
            component: () => import('components/WhisperLanding.vue'),
          },
          { 
            path: ':transcriptionId', 
            component: () => import('components/Transcription.vue'),
          },
          { 
            path: ':transcriptionId/properties', 
            component: () => import('components/TranscriptionProperties.vue'),
          },
          { 
            path: ':transcriptionId/export', 
            component: () => import('components/ExportTranscription.vue'),
          },
        ],
      },
      {
        path: '/login',
        children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
      },
      {
        path: '/expired',
        children: [{ path: '', component: () => import('pages/Expired.vue') }],
      },
      {
        path: '/logout',
        children: [{ path: '', component: () => import('pages/Logout.vue') }],
      },
      {
        path: '/users',
        beforeEnter: (to, from, next) => {
          if (whisperStore().getUser() == null) {
            return next('/login')
          }
          next()
        },
        children: [{ path: '', component: () => import('pages/Users.vue') }],
      },
      {
        path: '/transcriptions',
        beforeEnter: (to, from, next) => {
          if (whisperStore().getUser() == null) {
            return next('/login')
          }
          next()
        },
        children: [
          { 
            path: '', 
            component: () => import('pages/AdminTranscriptions.vue'),
            children: [
              {
                path: '',
                component: () => import('components/TranscriptionsStats.vue'),
              },
              {
                path: ':transcriptionId',
                component: () => import('components/Transcription.vue'),
              },
              {
                path: ':transcriptionId/properties',
                component: () => import('components/TranscriptionProperties.vue'),
              },
              {
                path: ':transcriptionId/export',
                component: () => import('components/ExportTranscription.vue'),
              },
            ],
          },
        ],
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
