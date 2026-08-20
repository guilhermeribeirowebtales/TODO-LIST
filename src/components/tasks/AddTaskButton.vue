<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <v-btn
    prepend-icon="mdi-plus"
    color="primary"
    rounded="pill"
    elevation="2"
    class="add-task-btn font-weight-semibold my-5"
    @click="router.push({ name: 'task-new' })"
  >
    New Task
  </v-btn>
</template>

<style scoped>
.add-task-btn {
  text-transform: none;
  letter-spacing: 0;
}
</style>
