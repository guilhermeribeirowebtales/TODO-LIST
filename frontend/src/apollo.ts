import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = new HttpLink({ uri: "http://localhost:8080" });

/**
 * Reads the persisted auth token directly from localStorage.
 * This avoids a dependency on the Pinia instance which may not be
 * active when the Apollo module is first imported.
 */
function getPersistedToken(): string | null {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

const authLink = setContext((_, { headers }) => {
  const token = getPersistedToken();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});


// const removeTypenameLink = new ApolloLink((operation, forward) => {
//   if (operation.variables) {
//     const omitTypename = (key, value) => (key === "__typename" ? undefined : value);

//     // Parse and stringify cleanly removes any undefined keys
//     operation.variables = JSON.parse(JSON.stringify(operation.variables), omitTypename);
//   }
//   return forward(operation);
// });


export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache({addTypename: false}),
});
