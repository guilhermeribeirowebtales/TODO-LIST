<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore.js";

const router = useRouter();
const store = useAuthStore();

const logout = () => {
  store.logout();
  router.push({ name: "login" });
};
</script>

<template>
  <v-app>
    <!-- v-app-bar is a sticky bar on top of our page, the color is primary which is defined on our vuetify.js
    and the elevation prop is a value that goes from 0 to 24, and adds a dropshadow
    -->

    <v-app-bar color="primary" elevation="2">
      <!-- This is a title specialized slot that handles responsive truncation and positioning
       Here we added a bold to the text, added a click prop aswell to return to the home page-->
      <v-app-bar-title>
        <span class="font-weight-bold" style="cursor: pointer" @click="router.push('/')">
          <v-icon icon="mdi-check-circle-outline" class="mr-2" />
          TODO List
        </span>
      </v-app-bar-title>

      <!-- v-spacer pushes everything below it to the right side of the navbar -->
      <v-spacer></v-spacer>

      <div>
        <!-- If the authStore doesn't have a jwt it shows the button to login-->
        <v-btn v-if="!store.token" class="mr-4" to="/auth/login">Login</v-btn>
        <!-- If it has then a user has logged in, and shows the only option he has which is to logout-->
        <v-btn v-if="store.token" @click="logout" color="error" variant="flat" class="mr-4">
          Logout
        </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
