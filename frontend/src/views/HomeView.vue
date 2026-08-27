<template>
  <v-container class="py-6">
    <!-- Loading indicator while tasks are being fetched -->
    <v-progress-linear
      v-if="store.loading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <!-- Error alert when an operation fails -->
    <v-alert
      v-if="store.error"
      type="error"
      closable
      class="mb-4"
      @click:close="store.error = null"
    >
      {{ store.error }}
    </v-alert>

    <!-- FilterBar writes directly to the store, no v-model bindings needed here -->
    <FilterBar class="mb-3" />

    <div class="d-flex justify-end mb-4">
      <AddTaskButton />
    </div>

    <!-- Task list — vuedraggable loops through the array for us -->
    <template v-if="draggableTasks.length > 0">
      <draggable
        v-model="draggableTasks"
        item-key="uuid"
        class="v-row"
        animation="200"
        handle=".drag-handle"
        ghost-class="ghost-card"
        drag-class="dragging-card"
      >
        <template #item="{ element: task }">
          <v-col cols="12">
            <TaskCard
              :task="task"
              @toggle-done="store.toggleDone"
              @toggle-archive="store.toggleArchive"
              @delete="openDeleteDialog"
              @update-milestone="({ uuid, milestone }) => store.updateTask(uuid, { milestone })"
            />
          </v-col>
        </template>
      </draggable>
    </template>
    <!-- Empty state -->
    <div v-else class="d-flex flex-column align-center justify-center mt-16 text-medium-emphasis">
      <template v-if="store.search.trim()">
        <v-icon icon="mdi-magnify" size="64" class="mb-4" />
        <p class="text-h6 font-weight-regular">Nothing but crickets here</p>
        <p class="text-body-2">No tasks match your search. Try different keywords.</p>
      </template>
      <template v-else>
        <v-icon icon="mdi-check-circle-outline" size="64" class="mb-4" />
        <p class="text-h6 font-weight-regular">No tasks yet</p>
        <p class="text-body-2">Click the + button to create your first task</p>
      </template>
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

<script setup>
import { computed, onMounted, ref } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import draggable from "vuedraggable";
import TaskCard from "@/components/tasks/TaskCard.vue";
import FilterBar from "@/components/tasks/FilterBar.vue";
import AddTaskButton from "@/components/tasks/AddTaskButton.vue";

const store = useTaskStore();

onMounted(() => {
  store.fetchTasks();
});

const draggableTasks = computed({
  get: () => store.visibleTasks,
  set: (newArray) => {
    const orderedUuids = newArray.map((task) => task.uuid);
    store.reorderTasks(orderedUuids);
  },
});

// --- Delete confirmation dialog ---
const deleteDialog = ref(false);
const taskToDelete = ref(null);

function openDeleteDialog(task) {
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

<style scoped>
.ghost-card {
  opacity: 0.3;
  border: 2px dashed #999 !important;
  background-color: rgba(0, 0, 0, 0.05);
}

.dragging-card > div {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2) !important;
  cursor: grabbing !important;
}
</style>
