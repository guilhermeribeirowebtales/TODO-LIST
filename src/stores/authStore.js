import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // 1. Reads the jwt token from local storage on startup (keeps user logged in after refresh)
  const token = ref(localStorage.getItem("token") || null);

  // Login function
  async function login(username, password) {
    //8787 port is where my worker is running
    const response = await fetch("http://localhost:8787/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();

    // Save token to state and browser storage
    token.value = data.token;
    localStorage.setItem("token", data.token);
  }

  // 3. The Logout Function
  function logout() {
    token.value = null;
    localStorage.removeItem("token");
  }

  return { token, login, logout };
});
