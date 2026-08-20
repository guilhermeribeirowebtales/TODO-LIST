<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
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
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
