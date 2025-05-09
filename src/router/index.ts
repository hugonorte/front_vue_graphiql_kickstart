import { createWebHistory, createRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../pages/LoginView.vue';
import HomeView from '../pages/HomeView.vue';
import AboutView from '../pages/AboutView.vue';
import UserCreateView from '../pages/admin/user/UserCreateView.vue';
import UserReadView from '../pages/admin/user/UserReadView.vue';
import UsersPage from '../pages/admin/user/UsersPage.vue';
import SignUp from '../pages/SignUpView.vue';
import PasswordRecover from '../pages/PasswordRecover.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: SignUp,
    },
    {
      path: '/password_recover',
      name: 'passwordRecover',
      component: PasswordRecover,
    },
    {
      path: '/admin/user/create',
      name: 'admin_user_create',
      component: UserCreateView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin/user/read',
      name: 'admin_user_read',
      component: UserReadView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin/user/test',
      name: 'admin_user_test',
      component: UsersPage,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        guest: true,
      },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/logout',
      name: 'logout',
      beforeEnter: async (to, from, next) => {
        const authStore = useAuthStore();
        await authStore.logout(); // Chama a função de logout
        next({ name: 'login' }); // Redireciona para a página de login
      },
      component: () => ({ template: '<div>Redirecionando...</div>' }), // Componente vazio
    },
  ],
});

// Guarda de navegação global
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } });
    } else {
      if (!authStore.currentUser) {
        try {
          await authStore.fetchCurrentUser();
          next();
        } catch (error) {
          authStore.logout();
          next({ name: 'login', query: { redirect: to.fullPath } });
        }
      } else {
        next();
      }
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (authStore.isAuthenticated) {
      next({ name: 'home' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;