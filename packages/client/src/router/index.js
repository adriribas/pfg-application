import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores';
import { authApi } from '@/api';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/reset-password',
      name: 'resetPassword',
      component: () => import('@/views/ResetPasswordView.vue')
    },
    /*,{
      path: '/me',
      name: 'aboutMe',
      component : () => import('@/views/AboutMe.vue'),
    },*/
    {
      path: '/plans-docents',
      name: 'a_plansDocents',
      component: () => import('@/views/administradors/PlansDocentsView.vue')
    },
    {
      path: '/assignacio-aules',
      name: 'a_assignAules',
      component: () => import('@/views/administradors/AssignAulesView.vue')
    },
    {
      path: '/gestio-coordinadors',
      name: 'a_gestCoordinadors',
      component: () => import('@/views/administradors/GestCoordinadorsView.vue')
    },
    {
      path: '/gestio-directors-departament',
      name: 'a_gestDirectors',
      component: () => import('@/views/administradors/GestDirectorsView.vue')
    },
    {
      path: '/horaris-graus',
      name: 'c_horarisGraus',
      component: () => import('@/views/coordinadors/HorarisGrausView.vue')
    },
    {
      path: '/horaris-professors',
      name: 'c_horarisProfessors',
      component: () => import('@/views/coordinadors/HorarisProfessorsView.vue')
    },
    {
      path: '/horaris-aules',
      name: 'c_horarisAules',
      component: () => import('@/views/coordinadors/HorarisAulesView.vue')
    },
    {
      path: '/horaris-professors',
      name: 'dd_horarisProfessors',
      component: () => import('@/views/directors/HorarisProfessorsView.vue')
    },
    {
      path: '/horaris-graus',
      name: 'dd_horarisGraus',
      component: () => import('@/views/directors/HorarisGrausView.vue')
    },
    {
      path: '/gestio-responsables-docencia',
      name: 'dd_gestResponsables',
      component: () => import('@/views/directors/GestResponsablesView.vue')
    },
    {
      path: '/horaris-professors',
      name: 'rd_horarisProfessors',
      component: () => import('@/views/responsables/HorarisProfessorsView.vue')
    },
    {
      path: '/assignacio-professors',
      name: 'rd_assignProfessors',
      component: () => import('@/views/responsables/AssignProfessorsView.vue')
    },
    {
      path: '/gestio-professors',
      name: 'rd_gestProfessors',
      component: () => import('@/views/responsables/GestProfessorsView.vue')
    },
    {
      path: '/horaris-propis',
      name: 'p_horarisPropis',
      component: () => import('@/views/professors/HorarisPropisView.vue')
    },
    {
      path: '/horaris-assignatures',
      name: 'p_horarisAssignatures',
      component: () => import('@/views/professors/HorarisAssignaturesView.vue')
    },
    {
      path: '/horaris-graus',
      name: 'p_horarisGraus',
      component: () => import('@/views/professors/HorarisGrausView.vue')
    }
  ]
});

router.beforeEach(async to => {
  const authStore = useAuthStore();
  try {
    await authApi.assertAccess(to.name);
  } catch (e) {
    return { name: authStore.isLoggedIn ? authStore.defaultView : 'login' };
  }
});

export default router;
