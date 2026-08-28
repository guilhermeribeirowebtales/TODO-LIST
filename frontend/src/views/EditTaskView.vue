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

<script setup>
//import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTaskStore } from "@/stores/taskStore";
import TaskForm from "@/components/forms/TaskForm.vue";
import { computed } from "vue";

const router = useRouter();
const route = useRoute();
const store = useTaskStore();
const task = computed(() => store.getTaskById(route.params.id));


async function handleUpdate(formData) {
  await store.updateTask(route.params.id, formData);
  router.push({ name: "home" });
}

function goBack() {
  router.push({ name: "home" });
}
</script>
