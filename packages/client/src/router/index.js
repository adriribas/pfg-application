import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores';
import { authApi } from '@/api';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /* {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    }, */
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
      name: 'a_plansDocents',
      component: () => import('@/views/administradors/PlansDocentsView.vue'),
      meta: {
        title: 'Plans docents',
        role: 'Administrador'
      }
    },
    {
      path: '/assignacio-aules',
      name: 'a_assignAules',
      component: () => import('@/views/administradors/AssignAulesView.vue'),
      meta: {
        title: "Assignació d'aules",
        role: 'Administrador'
      }
    },
    {
      path: '/gestio-coordinadors',
      name: 'a_gestCoordinadors',
      component: () => import('@/views/administradors/GestCoordinadorsView.vue'),
      meta: {
        title: 'Gestió de Coordinadors',
        role: 'Administrador'
      }
    },
    {
      path: '/gestio-directors-departament',
      name: 'a_gestDirectors',
      component: () => import('@/views/administradors/GestDirectorsView.vue'),
      meta: {
        title: 'Gestió de Directors de departament',
        role: 'Administrador'
      }
    },
    {
      path: '/horaris-graus',
      name: 'c_horarisGraus',
      component: () => import('@/views/coordinadors/HorarisGrausView.vue'),
      meta: {
        title: 'Horaris de graus',
        role: 'Coordinador'
      }
    },
    {
      path: '/horaris-professors',
      name: 'c_horarisProfessors',
      component: () => import('@/views/coordinadors/HorarisProfessorsView.vue'),
      meta: {
        title: 'Horaris de Professors',
        role: 'Coordinador'
      }
    },
    {
      path: '/horaris-aules',
      name: 'c_horarisAules',
      component: () => import('@/views/coordinadors/HorarisAulesView.vue'),
      meta: {
        title: "Horaris d'aules",
        role: 'Coordinador'
      }
    },
    {
      path: '/horaris-professors',
      name: 'dd_horarisProfessors',
      component: () => import('@/views/directors/HorarisProfessorsView.vue'),
      meta: {
        title: 'Horaris de Professors',
        role: 'Director de departament'
      }
    },
    {
      path: '/horaris-graus',
      name: 'dd_horarisGraus',
      component: () => import('@/views/directors/HorarisGrausView.vue'),
      meta: {
        title: 'Horaris de graus',
        role: 'Director de departament'
      }
    },
    {
      path: '/gestio-responsables-docencia',
      name: 'dd_gestResponsables',
      component: () => import('@/views/directors/GestResponsablesView.vue'),
      meta: {
        title: 'Gestió de Responsables de docència',
        role: 'Director de departament'
      }
    },
    {
      path: '/horaris-professors',
      name: 'rd_horarisProfessors',
      component: () => import('@/views/responsables/HorarisProfessorsView.vue'),
      meta: {
        title: 'Horaris de Professors',
        role: 'Responsable de docència'
      }
    },
    {
      path: '/assignacio-professors',
      name: 'rd_assignProfessors',
      component: () => import('@/views/responsables/AssignProfessorsView.vue'),
      meta: {
        title: 'Assignació de Professors',
        role: 'Responsable de docència'
      }
    },
    {
      path: '/gestio-professors',
      name: 'rd_gestProfessors',
      component: () => import('@/views/responsables/GestProfessorsView.vue'),
      meta: {
        title: 'Gestió de Professors',
        role: 'Responsable de docència'
      }
    },
    {
      path: '/horaris-propis',
      name: 'p_horarisPropis',
      component: () => import('@/views/professors/HorarisPropisView.vue'),
      meta: {
        title: 'Horaris propis',
        role: 'Professor'
      }
    },
    {
      path: '/horaris-assignatures',
      name: 'p_horarisAssignatures',
      component: () => import('@/views/professors/HorarisAssignaturesView.vue'),
      meta: {
        title: "Horaris d'assignatures",
        role: 'Professor'
      }
    },
    {
      path: '/horaris-graus',
      name: 'p_horarisGraus',
      component: () => import('@/views/professors/HorarisGrausView.vue'),
      meta: {
        title: 'Horaris de graus',
        role: 'Professor'
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
