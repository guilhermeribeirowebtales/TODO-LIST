<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore"; // Your Pinia store
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

// UI State
const formRef = ref(null);
const isFormValid = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const errorMsg = ref("");

// Form Data
const username = ref("");
const password = ref("");

// Validation Rules
const usernameRules = [(v) => !!v || "Username is required"];
const passwordRules = [(v) => !!v || "Password is required"];

// Submit Logic
const submit = async () => {
  // 1. Trigger Vuetify 3 Form Validation
  const { valid } = await formRef.value.validate();

  if (valid) {
    loading.value = true;
    errorMsg.value = "";

    try {
      // 2. Send data to Cloudflare Worker
      await auth.login(username.value, password.value);

      // 3. Success! Send them to the dashboard
      router.push({ name: "home" });
      alert("Success! You are logged in.");
    } catch (err) {
      errorMsg.value = "Invalid username or password.";
    } finally {
      loading.value = false;
    }
  }
};
</script>

<template>
  <div class="h-screen overflow-hidden">
    <v-app>
      <v-main class="login-background bg-cover bg-center">
        <!-- The background and overlay -->
        <v-container fluid class="fill-height loginOverlay">
          <v-row align="center" justify="center">
            <!-- The Card Container (Replaces v-flex) -->
            <v-col cols="12" sm="8" md="4">
              <v-card elevation="6" rounded="lg">
                <!-- The Header -->
                <v-toolbar color="blue-darken-4" class="pt-2">
                  <v-toolbar-title class="text-white font-weight-bold">
                    Welcome Back
                  </v-toolbar-title>
                </v-toolbar>

                <v-card-text class="pt-6">
                  <!-- The Form -->
                  <v-form ref="formRef" v-model="isFormValid" @submit.prevent="submit">
                    <!-- Username / Email Field -->
                    <v-text-field
                      label="Enter your username (or e-mail)"
                      v-model="username"
                      :rules="usernameRules"
                      required
                      variant="underlined"
                    ></v-text-field>

                    <!-- Password Field -->
                    <v-text-field
                      label="Enter your password"
                      v-model="password"
                      :rules="passwordRules"
                      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append-inner="showPassword = !showPassword"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      variant="underlined"
                    ></v-text-field>

                    <!-- Error Message from Cloudflare -->
                    <p v-if="errorMsg" class="text-error mt-3">{{ errorMsg }}</p>

                    <!-- Bottom Actions -->
                    <div class="d-flex justify-space-between align-center mt-6">
                      <v-btn
                        type="submit"
                        :color="isFormValid ? 'blue-darken-4' : 'grey'"
                        :disabled="!isFormValid || loading"
                        :loading="loading"
                        class="text-white"
                      >
                        Login
                      </v-btn>
                    </div>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<style scoped>
#app-login {
  height: 100vh;
  overflow: hidden;
}

.login-background {
  background-image: url("https://images.unsplash.com/photo-1497733942558-e74c87ef89db?dpr=1&auto=compress,format&fit=crop&w=1650&h=&q=80&cs=tinysrgb&crop=");
}

.loginOverlay {
  background: rgba(255, 255, 255, 0.2);
}
</style>
