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
    class="add-task-btn"
    @click="router.push({ name: 'task-new' })"
  >
    New Task
  </v-btn>
</template>

<style scoped>
.add-task-btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  padding-inline: 20px;
  margin: 20px 0 20px 0;
}
</style>
