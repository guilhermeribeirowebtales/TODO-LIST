<script setup>
import { ref } from "vue";

const emit = defineEmits(["update:filter"]);

const localSearch = defineModel("search", {
  default: "",
  set: (val) => val ?? "",
});
const activeFilter = ref("all");

const filters = [
  { value: "all", label: "All Tasks" },
  { value: "undone", label: "To Do", icon: "mdi-format-list-bulleted" },
  { value: "done", label: "Done", icon: "mdi-check" },
  { value: "archived", label: "Archived", icon: "mdi-archive" },
];

//TODO: Aplicar filtros de Sort By e por prioridade

function setFilter(value) {
  activeFilter.value = value;
  emit("update:filter", value);
}
</script>

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
          v-model="localSearch"
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
            :variant="activeFilter === f.value ? 'tonal' : 'outlined'"
            :color="activeFilter === f.value ? 'primary' : undefined"
            @click="setFilter(f.value)"
          >
            {{ f.label }}
          </v-chip>
        </div>

        <div class="d-flex ga-3 filter-bar__selects">
          <v-select
            label="Sort By"
            :items="[
              'Drag and drop',
              'Priority (High to Low)',
              'Priority (Low to High)',
              'Milestone (High to Low)',
              'Milestone (Low to High)',
            ]"
            variant="outlined"
            density="comfortable"
            hide-details
          />

          <v-select
            label="Priority Level"
            :items="['Normal', 'High', 'Very High']"
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

<style scoped>
/* min-width: 0 has no Vuetify utility but is required to prevent
   flex children from overflowing when content is wider than available space */
.filter-bar__right {
  min-width: 0;
}

.filter-bar__selects > * {
  flex-grow: 1;
  min-width: 0;
}
</style>
