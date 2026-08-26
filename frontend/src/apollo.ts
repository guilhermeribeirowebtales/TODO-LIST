import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useAuthStore } from './stores/authStore'

const httpLink = new HttpLink({ uri: 'http://localhost:8080/graphql' })

const authLink = setContext((_, { headers }) => {
  const authStore = useAuthStore()
  const token = authStore.token
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
})
