import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/error',
      name: 'error',
      component: () => import('@/views/ErrorView.vue')
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        noAuth: true
      },
      component: () => import('@/views/auth/LoginView.vue')
    },
    {
      path: '/reset-password',
      name: 'resetPassword',
      meta: {
        noAuth: true
      },
      component: () => import('@/views/auth/ResetPasswordView.vue')
    },
    {
      path: '/new-password',
      name: 'newPassword',
      meta: {
        noAuth: true
      },
      component: () => import('@/views/auth/NewPasswordView.vue'),
      props: route => ({ reason: route.query.reason, token: route.query.token })
    },
    {
      path: '/plans-docents',
      name: 'plansDocents',
      component: () => import('@/views/administradors/PlansDocentsView.vue'),
      meta: {
        title: 'Plans docents',
        roles: ['Administrador']
      }
    },
    {
      path: '/assignacio-aules',
      name: 'assignAules',
      component: () => import('@/views/administradors/AssignAulesView.vue'),
      meta: {
        title: "Assignació d'aules",
        roles: ['Administrador']
      }
    },
    {
      path: '/gestio-coordinadors',
      name: 'gestCoordinadors',
      component: () => import('@/views/administradors/GestCoordinadorsView.vue'),
      meta: {
        title: 'Gestió de Coordinadors',
        roles: ['Administrador']
      }
    },
    {
      path: '/gestio-directors-departament',
      name: 'gestDirectors',
      component: () => import('@/views/administradors/GestDirectorsView.vue'),
      meta: {
        title: 'Gestió de Directors de departament',
        roles: ['Administrador']
      }
    },
    {
      path: '/horaris-graus',
      name: 'horarisGraus',
      component: () => import('@/views/HorarisGrausView.vue'),
      meta: {
        title: 'Horaris de graus',
        roles: ['Coordinador', 'Director de departament', 'Professors']
      }
    },
    {
      path: '/horaris-professors',
      name: 'horarisProfessors',
      component: () => import('@/views/HorarisProfessorsView.vue'),
      meta: {
        title: 'Horaris de Professors',
        roles: ['Coordinador', 'Director de departament', 'Responsable de docencia']
      }
    },
    {
      path: '/horaris-aules',
      name: 'horarisAules',
      component: () => import('@/views/coordinadors/HorarisAulesView.vue'),
      meta: {
        title: "Horaris d'aules",
        roles: ['Coordinador']
      }
    },
    {
      path: '/gestio-responsables-docencia',
      name: 'gestResponsables',
      component: () => import('@/views/directors/GestResponsablesView.vue'),
      meta: {
        title: 'Gestió de Responsables de docència',
        roles: ['Director de departament']
      }
    },
    {
      path: '/assignacio-professors',
      name: 'assignProfessors',
      component: () => import('@/views/responsables/AssignProfessorsView.vue'),
      meta: {
        title: 'Assignació de Professors',
        roles: ['Responsable de docencia']
      }
    },
    {
      path: '/gestio-professors',
      name: 'gestProfessors',
      component: () => import('@/views/responsables/GestProfessorsView.vue'),
      meta: {
        title: 'Gestió de Professors',
        roles: ['Responsable de docencia']
      }
    },
    {
      path: '/horaris-propis',
      name: 'horarisPropis',
      component: () => import('@/views/professors/HorarisPropisView.vue'),
      meta: {
        title: 'Horaris propis',
        roles: ['Professor']
      }
    },
    {
      path: '/horaris-assignatures',
      name: 'horarisAssignatures',
      component: () => import('@/views/professors/HorarisAssignaturesView.vue'),
      meta: {
        title: "Horaris d'assignatures",
        roles: ['Professor']
      }
    }
  ]
});

router.beforeEach(async to => {
  const authStore = useAuthStore();

  if (!authStore.refreshing instanceof Promise) {
    return { name: 'error' };
  }

  await authStore.refreshing;

  if (authStore.isLoggedIn) {
    if (authStore.hasAccessTo(to.name)) {
      return;
    }
    return { name: authStore.defaultView };
  }

  if (to.meta.noAuth) {
    return;
  }

  return { name: 'login' };
});

export default router;
