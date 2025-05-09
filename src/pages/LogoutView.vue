<template>
    <div>Redirecionando para login...</div>
  </template>
  
  <script setup lang="ts">
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../stores/auth';
  
  const authStore = useAuthStore();
  const router = useRouter();
  
  onMounted(() => {
    authStore.logout();
    router.replace({ name: 'login' });
  });
  </script>
  