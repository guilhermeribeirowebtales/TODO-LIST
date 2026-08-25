// src/apollo.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:8080/graphql' }),
  cache: new InMemoryCache(),
})
