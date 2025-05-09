import { onError } from '@apollo/client/link/error';
import { fromPromise, Observable } from '@apollo/client';
import { useAuthStore } from '@/stores/auth';

export const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  const authStore = useAuthStore();

  const isUnauthenticated = graphQLErrors?.some(
    err => err.message === 'Unauthenticated.' || err.message.includes('Unauthenticated')
  );

  if (isUnauthenticated) {
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

      // ✅ Retorna um observable válido e vazio
      return new Observable<never>(() => {});
    });
  }

  return undefined;
});
