<template>
  <v-card
    class="pa-5 my-10 bg-surface"
    rounded="xl"
    style="box-shadow: 10px 10px 9px -5px rgba(0, 0, 0, 0.5)"
  >
    <div class="w-100 d-flex flex-row ga-4">
      <!-- Left column: search -->
      <div class="w-50 d-flex align-center flex-shrink-0">
        <v-text-field
          v-model="store.search"
          prepend-inner-icon="mdi-magnify"
          label="Search tasks..."
          variant="outlined"
          clearable
          rounded="xl"
          hide-details
          density="comfortable"
        />
      </div>

      <!-- Right column: chips on top, selects on bottom -->
      <div class="flex-grow-1 d-flex flex-column ga-3 justify-space-between filter-bar__right">
        <div class="d-flex ga-2 flex-wrap justify-space-between">
          <v-chip
            v-for="f in filters"
            :key="f.value"
            :prepend-icon="f.icon"
            :variant="store.activeFilter === f.value ? 'tonal' : 'outlined'"
            :color="store.activeFilter === f.value ? 'primary' : undefined"
            @click="store.activeFilter = f.value"
          >
            {{ f.label }}
          </v-chip>
        </div>

        <div class="d-flex ga-3 col-3 filter-bar__selects">
          <!-- v-model binds directly to store.sortBy -->
          <v-select
            v-model="store.sortBy"
            label="Sort By"
            :items="sort_filters"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            hide-details
          />

          <!-- v-model binds directly to store.priorityFilter -->
          <v-select
            v-model="store.priorityFilter"
            label="Priority Level"
            :items="priority_filters"
            item-title="label"
            item-value="value"
            multiple
            clearable
            variant="outlined"
            density="comfortable"
            hide-details
          >
            <template #selection="{ item, index }">
              <v-chip v-if="index < 2" size="small">{{ item.title }}</v-chip>
              <span v-if="index === 2" class="text-grey text-caption align-self-center">
                (+1 others)
              </span>
            </template>
          </v-select>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { useTaskStore } from "@/stores/taskStore";

const store = useTaskStore();

/** Filter mapping, assigning a value, a label and an icon if needed */

//Chip Filters
const filters = [
  { value: "all", label: "All Tasks" },
  { value: "undone", label: "To Do", icon: "mdi-format-list-bulleted" },
  { value: "done", label: "Done", icon: "mdi-check" },
  { value: "archived", label: "Archived", icon: "mdi-archive" },
];

//SortBy Filters
const sort_filters = [
  { label: "Default (drag & drop)", value: "manual" },
  { label: "Priority (High to Low)", value: "priority_desc" },
  { label: "Priority (Low to High)", value: "priority_asc" },
  { label: "Milestone (Earliest first)", value: "milestone_asc" },
  { label: "Milestone (Latest first)", value: "milestone_desc" },
];

//Select chip priority filters
const priority_filters = [
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
  { label: "Very High", value: "very_high" },
];
</script>

<style scoped>
/* min-width: 0 has no Vuetify utility but is required to prevent
   flex children from overflowing when content is wider than available space */
.filter-bar__right {
  min-width: 0;
}

.filter-bar__selects > * {
  flex-grow: 1;
  min-width: 0;
  max-width: 50%;
}
</style>
