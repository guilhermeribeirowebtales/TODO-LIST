<script setup>
import { ref } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import TaskCard from "@/components/tasks/TaskCard.vue";

const store = useTaskStore();

// --- Delete confirmation dialog ---
const deleteDialog = ref(false);
const taskToDelete = ref(null);

function requestDelete(task) {
  taskToDelete.value = task;
  deleteDialog.value = true;
}

function confirmDelete() {
  if (taskToDelete.value) {
    store.deleteTask(taskToDelete.value.uuid);
  }
  deleteDialog.value = false;
  taskToDelete.value = null;
}

function cancelDelete() {
  deleteDialog.value = false;
  taskToDelete.value = null;
}
</script>

<template>
  <v-container class="py-6">
    <!-- Task list -->
    <v-row v-if="store.activeTasks.length > 0">
      <v-col v-for="task in store.activeTasks" :key="task.uuid" cols="12" sm="6" md="4">
        <TaskCard
          :task="task"
          @toggle-done="store.toggleDone"
          @toggle-archive="store.toggleArchive"
          @delete="requestDelete"
          @update-milestone="() => {}"
        />
      </v-col>
    </v-row>

    <!-- Empty state -->
    <div v-else class="d-flex flex-column align-center justify-center mt-16 text-medium-emphasis">
      <v-icon icon="mdi-check-circle-outline" size="64" class="mb-4" />
      <p class="text-h6 font-weight-regular">No tasks yet</p>
      <p class="text-body-2">Click the + button to create your first task</p>
    </div>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="text-body-1 font-weight-bold pt-5 px-5"> Delete task </v-card-title>
        <v-card-text class="px-5">
          Are you sure you want to delete
          <strong>{{ taskToDelete?.title }}</strong
          >? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="cancelDelete">Cancel</v-btn>
          <v-btn color="error" variant="tonal" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
