<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { PRIORITY_LEVELS } from "@/utils/constants";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["toggle-done", "toggle-archive", "delete", "update-milestone"]);

const router = useRouter();

const priority = PRIORITY_LEVELS[props.task.priority_level] ?? PRIORITY_LEVELS.normal;

// --- Milestone menu ---
const menuOpen = ref(false);
const localDate = ref(props.task.milestone ?? "");

function applyDate() {
  emit("update-milestone", { uuid: props.task.uuid, milestone: localDate.value || null });
  menuOpen.value = false;
}

function clearDate() {
  localDate.value = "";
  emit("update-milestone", { uuid: props.task.uuid, milestone: null });
  menuOpen.value = false;
}

/** Sync localDate whenever the task prop changes (e.g. store update from outside) */
function onMenuOpen() {
  localDate.value = props.task.milestone ?? "";
}

/** Format ISO date string to dd/mm/yyyy */
function formatDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}
</script>

<template>
  <v-card
    :class="[
      'task-card ',
      { 'task-card--done': task.is_done, 'task-card--archived': task.is_archived },
    ]"
    variant="outlined"
    rounded="lg"
  >
    <div class="task-card__row d-flex align-start ga-2">
      <!-- Draggable Icon-->
      <v-icon
        icon="mdi-drag"
        class="drag-handle mr-3 text-medium-emphasis"
        title="Drag to reorder"
      />

      <!-- Left: done checkbox -->
      <v-checkbox
        :model-value="task.is_done"
        hide-details
        density="compact"
        class="flex-shrink-0 ma-0"
        style="margin-top: 2px"
        @update:model-value="emit('toggle-done', task.uuid)"
      />

      <!-- Center: text content -->
      <div class="task-card__content flex-grow-1 d-flex flex-column">
        <div class="d-flex align-center ga-2 flex-wrap">
          <span
            :class="[
              'task-card__title',
              'text-body-2',
              'font-weight-medium',
              { 'text-decoration-line-through text-medium-emphasis': task.is_done },
            ]"
          >
            {{ task.title }}
          </span>
          <v-chip :color="priority.color" size="x-small" variant="tonal" class="flex-shrink-0 ml-2">
            {{ priority.label }}
          </v-chip>
        </div>

        <p
          v-if="task.description"
          class="text-caption text-medium-emphasis mb-1 task-card__description"
        >
          {{ task.description }}
        </p>

        <!-- v-menu wraps the milestone button so clicking it opens an inline date picker.
             :close-on-content-click="false" prevents the menu from closing when the
             user interacts with the input inside it — we close it manually after saving.
             @update:model-value="onMenuOpen" syncs localDate each time the menu opens
             so it always reflects the current task.milestone value. -->
        <v-menu
          v-model="menuOpen"
          :close-on-content-click="false"
          location="bottom start"
          @update:model-value="onMenuOpen"
        >
          <!-- #activator exposes the menu's open/close props to the button.
               v-bind="activatorProps" wires up the click handler and aria attributes
               that Vuetify needs to link the button to the menu. -->
          <template #activator="{ props: activatorProps }">
            <v-btn
              v-bind="activatorProps"
              :prepend-icon="
                task.milestone ? 'mdi-calendar-check-outline' : 'mdi-calendar-plus-outline'
              "
              :text="task.milestone ? formatDate(task.milestone) : 'Set date'"
              variant="tonal"
              size="small"
              :color="task.milestone ? 'default' : 'secondary'"
              class="task-card__date align-self-start mt-1"
              rounded="xl"
            />
          </template>

          <!-- Menu content: a small card with a date input and action buttons -->
          <v-card min-width="240" rounded="lg" class="pa-3">
            <v-text-field
              v-model="localDate"
              type="date"
              label="Milestone date"
              variant="outlined"
              density="compact"
              hide-details
              class="mb-3"
            />
            <div class="d-flex justify-end ga-2">
              <v-btn size="small" variant="text" @click="clearDate">Clear</v-btn>
              <v-btn size="small" color="primary" variant="tonal" @click="applyDate">Save</v-btn>
            </div>
          </v-card>
        </v-menu>
      </div>

      <!-- Right: action buttons -->
      <div class="d-flex align-center align-self-start flex-shrink-0" style="margin-top: 2px">
        <v-btn
          icon="mdi-pencil-outline"
          variant="text"
          size="small"
          title="Edit task"
          @click="router.push({ name: 'task-edit', params: { id: task.uuid } })"
        />
        <v-btn
          :icon="task.is_archived ? 'mdi-archive-off-outline' : 'mdi-archive-outline'"
          variant="text"
          size="small"
          :title="task.is_archived ? 'Unarchive' : 'Archive'"
          @click="emit('toggle-archive', task.uuid)"
        />
        <v-btn
          icon="mdi-delete-outline"
          color="error"
          variant="text"
          size="small"
          title="Delete task"
          @click="emit('delete', task)"
        />
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.task-card {
  transition: box-shadow 0.2s ease;
}

.task-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.task-card--done {
  opacity: 0.7;
}

.task-card--archived {
  opacity: 0.55;
  background-color: rgba(0, 0, 0, 0.02);
}

.task-card__row {
  padding: 10px 12px 10px 4px;
  min-height: 56px;
}

.task-card__content {
  min-width: 0;
  gap: 2px;
}

.task-card__title {
  line-height: 1.4;
  word-break: break-word;
}

.task-card__description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.task-card__date {
  text-transform: none;
  letter-spacing: 0;
  width: 120px;
}

.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>
