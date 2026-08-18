<script setup>
import { useRouter } from 'vue-router'
import { PRIORITY_LEVELS } from '@/utils/constants'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle-done', 'toggle-archive', 'delete', 'update-milestone'])

const router = useRouter()

const priority = PRIORITY_LEVELS[props.task.priority_level] ?? PRIORITY_LEVELS.normal

/** Format ISO date string to a readable short date */
function formatDate(dateStr) {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}
</script>

<template>
  <v-card
    :class="['task-card', { 'task-card--done': task.is_done, 'task-card--archived': task.is_archived }]"
    variant="outlined"
    rounded="lg"
  >
    <v-card-text class="pb-2">
      <!-- Title row -->
      <div class="d-flex align-center justify-space-between mb-1">
        <span :class="['task-card__title', 'text-body-1', 'font-weight-medium', { 'text-decoration-line-through text-medium-emphasis': task.is_done }]">
          {{ task.title }}
        </span>
        <v-chip
          :color="priority.color"
          size="x-small"
          variant="tonal"
          class="ml-2 flex-shrink-0"
        >
          {{ priority.label }}
        </v-chip>
      </div>

      <!-- Description -->
      <p
        v-if="task.description"
        class="text-body-2 text-medium-emphasis mb-2 task-card__description"
      >
        {{ task.description }}
      </p>

      <!-- Milestone -->
      <div v-if="task.milestone" class="d-flex align-center text-caption text-medium-emphasis">
        <v-icon icon="mdi-calendar-outline" size="14" class="mr-1" />
        {{ formatDate(task.milestone) }}
      </div>
    </v-card-text>

    <v-divider />

    <!-- Action buttons -->
    <v-card-actions class="px-3 py-1">
      <!-- Done toggle -->
      <v-btn
        :icon="task.is_done ? 'mdi-check-circle' : 'mdi-check-circle-outline'"
        :color="task.is_done ? 'success' : 'default'"
        variant="text"
        size="small"
        :title="task.is_done ? 'Mark as undone' : 'Mark as done'"
        @click="emit('toggle-done', task.uuid)"
      />

      <!-- Milestone shortcut -->
      <v-btn
        icon="mdi-calendar-edit-outline"
        variant="text"
        size="small"
        title="Edit milestone"
        @click="emit('update-milestone', task)"
      />

      <v-spacer />

      <!-- Edit -->
      <v-btn
        icon="mdi-pencil-outline"
        variant="text"
        size="small"
        title="Edit task"
        @click="router.push({ name: 'task-edit', params: { id: task.uuid } })"
      />

      <!-- Archive -->
      <v-btn
        :icon="task.is_archived ? 'mdi-archive-off-outline' : 'mdi-archive-outline'"
        variant="text"
        size="small"
        :title="task.is_archived ? 'Unarchive' : 'Archive'"
        @click="emit('toggle-archive', task.uuid)"
      />

      <!-- Delete -->
      <v-btn
        icon="mdi-delete-outline"
        color="error"
        variant="text"
        size="small"
        title="Delete task"
        @click="emit('delete', task)"
      />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.task-card {
  transition: box-shadow 0.2s ease;
}

.task-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important;
}

.task-card--done {
  opacity: 0.75;
}

.task-card--archived {
  opacity: 0.6;
  background-color: rgba(0, 0, 0, 0.03);
}

.task-card__title {
  line-height: 1.4;
}

.task-card__description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
