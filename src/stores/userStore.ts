import { defineStore } from 'pinia';
import { useApolloClient } from '@vue/apollo-composable';
import { provideApolloClient } from '@vue/apollo-composable';
import { apolloClient } from '../apollo/client';
import { gql } from '@apollo/client/core';

interface User {
  id: number;
  name: string;
  email: string;
}

interface PaginatorInfo {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}

interface PaginatedUsers {
  data: User[];
  paginatorInfo: PaginatorInfo;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    paginatedUsers: {
      data: [],
      paginatorInfo: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 15,
      },
    } as PaginatedUsers,
    error: null as string | null,
  }),
  actions: {
    async fetchUsers(page = 1, perPage = 15) {
      provideApolloClient(apolloClient);
      const client = useApolloClient().client;
      try {
        this.error = null;
        const response = await client.query({
          query: gql`
            query Users($page: Int, $first: Int!) {
              users(page: $page, first: $first) {
                data {
                  id
                  name
                  email
                }
                paginatorInfo {
                  currentPage
                  lastPage
                  total
                  perPage
                }
              }
            }
          `,
          variables: { page, first: perPage },
          fetchPolicy: 'no-cache',
        });

        response.errors?.forEach((error: any) => {
          if (error.message == 'Unauthenticated.') {
            this.error = 'Usuário não autenticado. Faça login novamente.';
            //console.log(error);
            return this.error;
          }
        });

        //console.log('Resposta completa do Apollo:', response.errors[0].message);

        const data = response.data;
        if (!data || !data.users) {
          console.error('Nenhum dado retornado pelo servidor');
          //this.error = 'Nenhum dado retornado pelo servidor';
          this.paginatedUsers = {
            data: [],
            paginatorInfo: {
              currentPage: page,
              lastPage: 1,
              total: 0,
              perPage,
            },
          };
          return;
        }

        console.log('Resposta GraphQL:', data);
        this.paginatedUsers = data.users;
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        this.error = error instanceof Error ? error.message : 'Erro desconhecido ao buscar usuários';
        if (error instanceof Error) {
          if ((error as any).networkError) {
            console.error('Erro de rede:', (error as any).networkError);
            this.error = 'Erro de rede. Verifique sua conexão ou o endpoint GraphQL.';
          }
          if ((error as any).graphQLErrors) {
            console.error('Erros GraphQL:', (error as any).graphQLErrors);
            this.error = (error as any).graphQLErrors.map((e: any) => e.message).join(', ');
          }
        }
        this.paginatedUsers = {
          data: [],
          paginatorInfo: {
            currentPage: page,
            lastPage: 1,
            total: 0,
            perPage,
          },
        };
      }
    },
    async createUser(user: { name: string; email: string; password: string }) {
      provideApolloClient(apolloClient);
      const client = useApolloClient().client;
      try {
        const { data } = await client.mutate({
          mutation: gql`
            mutation($input: CreateUserInput!) {
              createUser(input: $input) {
                id
                name
                email
              }
            }
          `,
          variables: { input: user },
        });
        console.info('Usuário criado com sucesso:', data);
        await this.fetchUsers(this.paginatedUsers.paginatorInfo.currentPage);
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
        throw error;
      }
    },
    async updateUser(user: { id: number; name?: string; email?: string; password?: string }) {
      provideApolloClient(apolloClient);
      const client = useApolloClient().client;
      try {
        await client.mutate({
          mutation: gql`
            mutation($input: UpdateUserInput!) {
              updateUser(input: $input) {
                id
                name
                email
              }
            }
          `,
          variables: { input: user },
        });
        await this.fetchUsers(this.paginatedUsers.paginatorInfo.currentPage);
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw error;
      }
    },
    async deleteUser(id: number) {
      provideApolloClient(apolloClient);
      const client = useApolloClient().client;
      try {
        await client.mutate({
          mutation: gql`
            mutation($id: ID!) {
              deleteUser(id: $id) {
                id
              }
            }
          `,
          variables: { id },
        });
        await this.fetchUsers(this.paginatedUsers.paginatorInfo.currentPage);
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        throw error;
      }
    },
  },
});