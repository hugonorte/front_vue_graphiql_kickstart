<template>
  <Header />
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Usuários Cadastrados</h1>
  
      <div v-if="loading" class="text-gray-500">Carregando...</div>
      <div v-else-if="userStore.error" class="text-red-500 mb-4">{{ userStore.error }}</div>
      <div v-else-if="users.length === 0" class="text-gray-500">Nenhum usuário encontrado.</div>
      <table v-else class="w-full border border-gray-300 mb-4">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">ID</th>
            <th class="p-2 border">Nome</th>
            <th class="p-2 border">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="p-2 border">{{ user.id }}</td>
            <td class="p-2 border">{{ user.name }}</td>
            <td class="p-2 border">{{ user.email }}</td>
          </tr>
        </tbody>
      </table>
  
      <div v-if="!loading && !userStore.error && users.length > 0" class="flex justify-between items-center">
        <button
          :disabled="page <= 1"
          @click="changePage(page - 1)"
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Anterior
        </button>
  
        <span>Página {{ page }} de {{ totalPages }}</span>
  
        <button
          :disabled="page >= totalPages"
          @click="changePage(page + 1)"
          class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useUserStore } from '@/stores/userStore';
  import Header from '@/components/admin/header/Header.vue';
  
  const userStore = useUserStore();
  const page = ref(1);
  const loading = ref(true);
  
  const users = computed(() => userStore.paginatedUsers.data);
  const totalPages = computed(() => userStore.paginatedUsers.paginatorInfo.lastPage);
  
  const loadUsers = async () => {
    loading.value = true;
    try {
      await userStore.fetchUsers(page.value, 15);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
    } finally {
      loading.value = false;
    }
  };
  
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage;
      loadUsers();
    }
  };
  
  onMounted(loadUsers);
  </script>
  
  <style scoped>
  /* Estilização já fornecida, mantida como está */
  
  </style>