import { defineStore } from "pinia";
import { ref } from "vue";
import gql from "graphql-tag";
import { apolloClient } from "../apollo";

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
    }
  }
}
`;

export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref(null);
    const user = ref({});
    const isAuthenticated = ref(false);
    //const location = reactive({}); --> Dead Code
    const loginLoading = ref(false);
    const loginError = ref(null);

    async function login(username, password) {
      loginLoading.value = true;
      loginError.value = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: LOGIN_MUTATION,
          variables: { input: { username, password } },
          fetchPolicy: "no-cache",
        });

        if (!data?.login?.token) {
          throw new Error("Login failed");
        }

        setToken(data.login.token);
        setAuthenticated(true);

        if (data.login.user) {
          user.value = data.login.user;
        }
      } catch (e) {
        loginError.value = e;
        throw e;
      } finally {
        loginLoading.value = false;
      }
    }

    //const getRole = computed(() => user?.value?.role || ""); --> Dead code

    const setToken = (accessToken) => {
      token.value = accessToken;
    };

    const setAuthenticated = (value) => {
      isAuthenticated.value = value;
    };

    const cleanUser = () => {
      isAuthenticated.value = false;
      user.value = null;
      token.value = null;
    };

    //const getToken = computed(() => token.value); --> Dead code

    const verifyToken = () => {
      if (!token.value) return false;

      try {
        // A JWT is 3 parts separated by dots. The payload is the 2nd part.
        const payloadBase64 = token.value.split(".")[1];
        const decodedJson = atob(payloadBase64); // Decode base64
        const payload = JSON.parse(decodedJson);

        // JWT exp is in seconds, Date.now() is in milliseconds
        const isExpired = Date.now() >= payload.exp * 1000;

        return !isExpired; // If it's NOT expired, it is valid!
      } catch (error) {
        // If the token is malformed, it's invalid
        console.warn("Token verification failed:", error.message);
        return false;
      }
    };

    return {
      isAuthenticated,
      setToken,
      user,
      location,
      token,
      setAuthenticated,
      cleanUser,
      login,
      loginLoading,
      loginError,
      verifyToken,
    };
  },
  {
    persist: true,
  },
);
