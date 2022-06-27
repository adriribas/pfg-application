import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        requiresNoAuth: true
      }
    },
    /*{
      path: '/resetPassword',
      name: 'resetPassword',
      component: () => import('@/views/ResetPasswordView'),
      meta: {
        requiresNoAuth: true
      }
    },*/
    /*,{
      path: '/me',
      name: 'aboutMe',
      component: () => import('@/views/AboutMe.vue'),
      meta {
        requiresAuth: true
      }
    },*/
    {
      path: '/plansDocents',
      name: 'plansDocents',
      component: () => import('@/views/admins/PlansDocentsView.vue'),
      meta: {
        requiresAuth: true
      }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresNoAuth = to.matched.some(record => record.meta.requiresNoAuth);
  const isNotWhitelisted = to.matched.some(record => !authStore.isWhitelisted(record.name));

  if (requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'login' });
  }

  if ((requiresAuth && isNotWhitelisted) || (requiresNoAuth && authStore.isLoggedIn)) {
    return next({ name: authStore.defaultView });
  }

  next();
});

export default router;
