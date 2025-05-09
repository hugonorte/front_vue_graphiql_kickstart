import { computed } from 'vue';
import { useRouter, type RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();
  
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.currentUser);
  const loading = computed(() => authStore.loading);
  
  // Verifica o status da autenticação e redireciona conforme necessário
  const requireAuth = async (to: RouteLocationNormalized) => {
    if (!authStore.isAuthenticated) {
      // Redireciona para o login se não estiver autenticado
      return { name: 'login', query: { redirect: to.fullPath } };
    }
    
    // Se temos um token mas nenhum usuário, tenta buscar os dados do usuário
    if (authStore.isAuthenticated && !authStore.currentUser) {
      try {
        await authStore.fetchCurrentUser();
      } catch (error) {
        // Se falhar, faz logout e redireciona para login
        authStore.logout();
        return { name: 'login', query: { redirect: to.fullPath } };
      }
    }
    
    return true;
  };
  
  // Redireciona usuários já autenticados para longe da página de login
  const redirectIfAuthenticated = () => {
    if (authStore.isAuthenticated) {
      router.push({ name: 'home' });
    }
  };
  
  return {
    isAuthenticated,
    user,
    loading,
    login: authStore.login,
    logout: authStore.logout,
    requireAuth,
    redirectIfAuthenticated,
  };
}