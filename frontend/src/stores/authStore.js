import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref(null);
    const user = ref({});
    const isAuthenticated = ref(false);
    const location = reactive({});

    async function login(username, password) {
      const response = await fetch("http://localhost:8787/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      // Just update the state. The plugin automatically syncs this to localStorage!
      setToken(data.token);
      setAuthenticated();
    }

    const getRole = computed(() => user?.value?.role || "");

    const setToken = (accessToken) => {
      token.value = accessToken;
    };

    const setAuthenticated = (user) => {
      isAuthenticated.value = user;
    };

    const cleanUser = () => {
      isAuthenticated.value = false;
      user.value = null;
      token.value = null;
    };

    const getToken = computed(() => token.value);

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
      getRole,
      getToken,
      login,
      verifyToken,
    };
  },
  {
    persist: true,
  },
);
