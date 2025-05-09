import { defineStore } from 'pinia';
import { apolloClient } from '../apollo/client';
import { gql } from '@apollo/client/core';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      token_type
      expires_in
    }
  }
`;

const GET_USER_QUERY = gql`
  query GetUser {
    me {
      id
      name
      email
    }
  }
`;

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      token
      token_type
      expires_in
    }
  }
`;

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token') || null,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: LOGIN_MUTATION,
          variables: { email, password },
        });

        const { token } = data.login;

        this.setToken(token);
        await this.fetchCurrentUser();

        return data.login;
      } catch (error: any) {
        this.error = error.message || 'Falha na autenticação';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        if (this.token) {
          await apolloClient.mutate({
            mutation: gql`
              mutation Logout {
                logout
              }
            `,
          });
        }
      } catch (error) {
        console.error('Erro ao fazer logout no servidor:', error);
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');

        apolloClient.clearStore().catch((error) => {
          console.error('Erro ao limpar o cache do Apollo:', error);
        });
      }
    },

    async fetchCurrentUser() {
      if (!this.token) return null;

      this.loading = true;

      try {
        const { data } = await apolloClient.query({
          query: GET_USER_QUERY,
          fetchPolicy: 'network-only',
        });

        this.setUser(data.me);
        return data.me;
      } catch (error: any) {
        if (error.message.includes('Unauthenticated')) {
          this.logout();
        }
        return null;
      } finally {
        this.loading = false;
      }
    },

    async refreshToken(): Promise<boolean> {
      try {
        const { data } = await apolloClient.mutate({
          mutation: REFRESH_TOKEN_MUTATION,
        });

        const { token } = data.refreshToken;
        this.setToken(token);

        return true;
      } catch (error) {
        console.error('Erro ao renovar o token:', error);
        this.logout();
        return false;
      }
    },

    async handleTokenExpiration(operation: any, forward: any) {
      try {
        const { data } = await apolloClient.mutate({
          mutation: REFRESH_TOKEN_MUTATION,
        });

        const newToken = data.refreshToken.token;
        this.setToken(newToken);

        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            authorization: `Bearer ${newToken}`,
          },
        }));

        return forward(operation);
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);
      this.updateAuthHeader();
    },

    setUser(user: User) {
      this.user = user;
    },

    updateAuthHeader() {
      // Essa função pode ser usada para atualizar configurações gerais do Apollo Client
      if (apolloClient && this.token) {
        apolloClient.defaultOptions = {
          ...apolloClient.defaultOptions,
          watchQuery: {
            fetchPolicy: 'network-only',
            errorPolicy: 'ignore',
          },
          query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
          },
        };
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
