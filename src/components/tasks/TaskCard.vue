<script setup>
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
      'task-card',
      { 'task-card--done': task.is_done, 'task-card--archived': task.is_archived },
    ]"
    variant="outlined"
    rounded="lg"
  >
    <div class="task-card__row">
      <!-- Left: done checkbox -->
      <v-checkbox
        :model-value="task.is_done"
        hide-details
        density="compact"
        class="task-card__checkbox flex-shrink-0"
        @update:model-value="emit('toggle-done', task.uuid)"
      />

      <!-- Center: text content -->
      <div class="task-card__content">
        <div class="d-flex align-center gap-2 flex-wrap">
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
          <v-chip :color="priority.color" size="x-small" variant="tonal" class="flex-shrink-0">
            {{ priority.label }}
          </v-chip>
        </div>

        <p
          v-if="task.description"
          class="text-caption text-medium-emphasis mb-0 task-card__description"
        >
          {{ task.description }}
        </p>
      </div>

      <!-- Date chip button -->
      <v-btn
        :prepend-icon="task.milestone ? 'mdi-calendar-check-outline' : 'mdi-calendar-plus-outline'"
        :text="task.milestone ? formatDate(task.milestone) : 'Set date'"
        variant="tonal"
        size="x-small"
        :color="task.milestone ? 'primary' : 'default'"
        class="task-card__date flex-shrink-0"
        @click="emit('update-milestone', task)"
      />

      <!-- Right: action buttons -->
      <div class="task-card__actions flex-shrink-0">
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
  width: 100%;
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 8px 4px;
  min-height: 56px;
}

.task-card__checkbox {
  margin: 0;
}

.task-card__content {
  flex: 1;
  min-width: 0; /* allows text truncation in flex children */
  display: flex;
  flex-direction: column;
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
}

.task-card__actions {
  display: flex;
  align-items: center;
  gap: 0;
}
</style>
