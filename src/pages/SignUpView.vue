<template>
  <div class="register-container">
    <h2>Cadastro de Usuário</h2>
    <span v-if="errors.general" class="error">{{ errors.general }}</span>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Nome</label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          placeholder="Digite seu nome"
          required
        />
        <span v-if="errors.name" class="error">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          placeholder="Digite seu email"
          required
        />
        <span v-if="errors.email" class="error">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <label for="password">Senha</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          placeholder="Digite sua senha"
          required
        />
        <span v-if="errors.password" class="error">{{ errors.password }}</span>
      </div>

      <div class="form-group">
        <label for="passwordConfirmation">Confirmação de Senha</label>
        <input
          type="password"
          id="passwordConfirmation"
          v-model="form.passwordConfirmation"
          placeholder="Confirme sua senha"
          required
        />
        <span v-if="errors.passwordConfirmation" class="error">{{
          errors.passwordConfirmation
        }}</span>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';

// Inicializa a store
const userStore = useUserStore();

// Estado do formulário
const form = ref({
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
});

// Estado para erros e carregamento
const errors = ref({});
const loading = ref(false);

// Função para validar o formulário
const validateForm = () => {
  errors.value = {};

  if (!form.value.name) {
    errors.value.name = 'O nome é obrigatório';
  }
  if (!form.value.email) {
    errors.value.email = 'O email é obrigatório';
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Email inválido';
  }
  if (!form.value.password) {
    errors.value.password = 'A senha é obrigatória';
  } else if (form.value.password.length < 6) {
    errors.value.password = 'A senha deve ter pelo menos 6 caracteres';
  }
  if (form.value.password !== form.value.passwordConfirmation) {
    errors.value.passwordConfirmation = 'As senhas não coincidem';
  }

  return Object.keys(errors.value).length === 0;
};

// Função para lidar com o envio do formulário
const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    await userStore.createUser({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    });

    // Limpa o formulário após sucesso
    form.value = {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    };
    errors.value = {};
    alert('Usuário cadastrado com sucesso!');
  } catch (error) {
  console.error('Erro no cadastro:', error);

  // Verifica se é um erro GraphQL com validações
  const validationErrors = error?.graphQLErrors?.[0]?.extensions?.validation;

  if (validationErrors) {
    errors.value = validationErrors;
  } else {
    // Pode ser um erro de rede ou outro erro inesperado
    errors.value.general = error.message || 'Erro ao cadastrar usuário';
  }
} finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error {
  color: red;
  font-size: 0.8em;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>