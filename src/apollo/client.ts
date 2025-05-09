import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  ApolloLink,
  fromPromise,
  Observable,
} from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import type { App } from 'vue';
import { DefaultApolloClient } from '@vue/apollo-composable';
import { useAuthStore } from '@/stores/auth';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors?.some(err => err.message.includes('Unauthenticated'))) {
    const authStore = useAuthStore();

    return fromPromise(authStore.refreshToken().then(success => {
      if (success && authStore.token) {
        operation.setContext(({ headers = {} }) => ({
          headers: {
            ...headers,
            authorization: `Bearer ${authStore.token}`,
          },
        }));
        return true;
      }
      return false;
    })).flatMap((shouldRetry) => {
      if (shouldRetry) {
        return forward(operation);
      }

      // Retorna um Observable vazio compatível com Apollo
      return new Observable(subscriber => subscriber.complete());
    });
  }

  return undefined;
});

const link = ApolloLink.from([errorLink, authLink, httpLink]);

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

export function provideApollo(app: App) {
  app.provide(DefaultApolloClient, apolloClient);
}
