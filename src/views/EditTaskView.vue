<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTaskStore } from "@/stores/taskStore";
import TaskForm from "@/components/forms/TaskForm.vue";

const router = useRouter();
const route = useRoute();
const store = useTaskStore();

// Computed basically means that this variable will have a value that depends on a ref or a reactive variable
// In this case the method getById itself is a computed function because it depends on the uuid which is a ref
// The computed here also means the view will reactively update if the store's data cahnges while the form is open,
// e.g. another tab edits the same task
const task = computed(() => store.getById(route.params.id));

function handleUpdate(formData) {
  store.updateTask(route.params.id, formData);
  router.push({ name: "home" });
}

function goBack() {
  router.push({ name: "home" });
}
</script>

<template>
  <v-container class="py-6 d-flex justify-center">
    <!-- Task not found guard -->
    <!-- If someone navigates directly to /task/bad-uuid/edit,
      they get a graceful error state instead of a crash. -->
    <div
      v-if="!task"
      class="d-flex flex-column align-center justify-center mt-16 text-medium-emphasis"
    >
      <v-icon icon="mdi-alert-circle-outline" size="64" class="mb-4" />
      <p class="text-h6 font-weight-regular">Task not found</p>
      <v-btn variant="text" color="primary" class="mt-2" @click="goBack"> Back to list </v-btn>
    </div>

    <!-- Form pre-populated with existing task data -->
    <TaskForm v-else :task-data="task" @submit="handleUpdate" @cancel="goBack" />
  </v-container>
</template>
