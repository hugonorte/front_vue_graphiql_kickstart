<template>
    <div>
      <h2>Usuários</h2>
      <form @submit.prevent="submit">
        <input v-model="form.name" placeholder="Nome" />
        <input v-model="form.email" placeholder="Email" />
        <input v-model="form.password" placeholder="Senha" type="password" />
        <button type="submit">Criar</button>
      </form>
  
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.name }} ({{ user.email }})
          <button @click="deleteUser(user.id)">Remover</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useUserStore } from '@/stores/userStore'
  
  const userStore = useUserStore()
  const users = computed(() => userStore.paginatedUsers.data);
  
  const form = ref({
    name: '',
    email: '',
    password: ''
  })
  
  const submit = async () => {
    await userStore.createUser(form.value)
    form.value = { name: '', email: '', password: '' }
  }
  
  const deleteUser = async (id: number) => {
    await userStore.deleteUser(id)
  }
  
  onMounted(() => userStore.fetchUsers())
  </script>
  