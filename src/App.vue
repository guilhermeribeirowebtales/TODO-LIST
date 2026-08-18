<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-title>
        <span class="font-weight-bold" style="cursor: pointer" @click="router.push('/')">
          <v-icon icon="mdi-check-circle-outline" class="mr-2" />
          TODO List
        </span>
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
html,
body {
  background-color: #f5f5f5;
}
</style>
