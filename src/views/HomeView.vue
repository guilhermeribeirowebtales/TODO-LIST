<script setup>
import { ref, computed } from "vue";
import { useTaskStore } from "@/stores/taskStore";
import draggable from "vuedraggable";
import TaskCard from "@/components/tasks/TaskCard.vue";
import FilterBar from "@/components/tasks/FilterBar.vue";
import AddTaskButton from "@/components/tasks/AddTaskButton.vue";

const store = useTaskStore();

// --- Search & filter state ---
const search = ref("");
const activeFilter = ref("all");

const visibleTasks = computed(() => {
  let list = activeFilter.value === "archived" ? store.archivedTasks : store.activeTasks;

  if (activeFilter.value === "done") list = list.filter((t) => t.is_done);
  if (activeFilter.value === "undone") list = list.filter((t) => !t.is_done);

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    list = list.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q),
    );
  }

  return list;
});

const draggableTasks = computed({
  get: () => visibleTasks.value,
  set: (newArray) => {
    const orderedUuids = newArray.map((task) => task.uuid);
    store.reorderTasks(orderedUuids);
  },
});

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
    <!-- FilterBar emits update:search and update:filter, and $event is Vue's emitted value.-->
    <!-- v-model:sort-by and v-model:priority-filter bind directly to the store refs so
         selecting an option in FilterBar writes straight into the store, triggering
         applyFiltersAndSort which recomputes activeTasks/archivedTasks reactively -->
    <FilterBar
      class="mb-3"
      v-model:search="search"
      v-model:sort-by="store.sortBy"
      v-model:priority-filter="store.priorityFilter"
      @update:filter="activeFilter = $event"
    />

    <div class="d-flex justify-end mb-4">
      <AddTaskButton />
    </div>

    <!-- Task list -->
    <!-- The previous loop v-for="task in visibleTasks" was removed since the vuedraggable
    library already does the looping for use, so we just need to pass our array of draggableTa
    -->
    <!-- before we had a v-row tag which we swapped for a template, this acts as an invisible wrapper
     then we pass the v-row class to our draggable tag so we don't break the vuetify grid by having a row inside a row
     -->
    <!-- We also create a blueprint slot or a vue slot,
     A slot is a render function, which compiles the <template> HTML into a js function.
     Essential Vue reads and translates line 103 as: "Give <draggable> this block of HTML.
      As <draggable> loops through the array, catch the item it spits out
      (which it calls 'element'), instantly rename it to 'task',
      and use it to build this <v-col> and <TaskCard>." -->

    <template v-if="visibleTasks.length > 0">
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
              @delete="requestDelete"
              @update-milestone="({ uuid, milestone }) => store.updateTask(uuid, { milestone })"
            />
          </v-col>
        </template>
      </draggable>
    </template>
    <!-- Empty state -->
    <div v-else class="d-flex flex-column align-center justify-center mt-16 text-medium-emphasis">
      <v-icon icon="mdi-check-circle-outline" size="64" class="mb-4" />
      <p class="text-h6 font-weight-regular">No tasks yet</p>
      <p class="text-body-2">Click the + button to create your first task</p>
    </div>

    <!-- Delete confirmation dialog -->
    <!-- deleteDialog, binds to a boolean, its state defines if the modal is Open(true) or Close(false)-->
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

<style scoped>
/** This classes stylize the card ghost behind, where you see two cards one being dragged
and other in place behind */
/** Now we still se that but with a reduced opacity, a background tint and a border,
so as the user is draggin we can clearly see where the card is going */
/* The empty space left behind on the list */
.ghost-card {
  opacity: 0.3;
  border: 2px dashed #999 !important;
  background-color: rgba(0, 0, 0, 0.05); /* Slight dark tint */
}

/* The actual card attached to your mouse */
.dragging-card > div {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2) !important;
  cursor: grabbing !important;
}
</style>
