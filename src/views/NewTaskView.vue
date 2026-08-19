<script setup>
import { useRouter } from "vue-router";
import { useTaskStore } from "@/stores/taskStore";
import TaskForm from "@/components/forms/TaskForm.vue"; // Adjust the path if your form is elsewhere

const router = useRouter();
const store = useTaskStore();

// Triggered when the form emits the 'submit' event
function handleCreate(formData) {
  // Pass the data to your Pinia store action
  store.addTask(formData);

  // Navigate back to the main list (assuming your main route is named 'home')
  router.push({ name: "home" });
}

// Triggered when the form emits the 'cancel' event
function goBack() {
  router.push({ name: "home" });
}
</script>

<template>
  <v-container class="py-6 d-flex justify-center">
    <!-- Drop in the reusable form we created earlier -->
    <TaskForm @submit="handleCreate" @cancel="goBack" />
  </v-container>
</template>
