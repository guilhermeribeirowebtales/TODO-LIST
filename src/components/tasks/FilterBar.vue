<script setup>
import { ref, watch } from "vue";

const emit = defineEmits(["update:search", "update:filter"]);

const localSearch = ref("");
const activeFilter = ref("all");

const filters = [
  { value: "all", label: "All Tasks" },
  { value: "undone", label: "To Do", icon: "mdi-format-list-bulleted" },
  { value: "done", label: "Done", icon: "mdi-check" },
  { value: "archived", label: "Archived", icon: "mdi-archive" },
];

// Encontrar alternativa para watch
//
watch(localSearch, (val) => emit("update:search", val ?? ""));

function setFilter(value) {
  activeFilter.value = value;
  emit("update:filter", value);
}
</script>

<template>
  <div class="filter-bar">
    <!-- Left column: search -->
    <div class="filter-bar__search">
      <v-text-field
        v-model="localSearch"
        prepend-inner-icon="mdi-magnify"
        label="Search tasks..."
        variant="solo"
        clearable
        hide-details
        density="comfortable"
      />
    </div>

    <!-- Right column: chips on top, selects on bottom -->
    <div class="filter-bar__right">
      <div class="filter-bar__chips">
        <v-chip
          v-for="f in filters"
          :key="f.value"
          :prepend-icon="f.icon"
          :variant="activeFilter === f.value ? 'tonal' : 'outlined'"
          :color="activeFilter === f.value ? 'primary' : undefined"
          class="filter-bar__chip"
          @click="setFilter(f.value)"
        >
          {{ f.label }}
        </v-chip>
      </div>

      <div class="filter-bar__selects">
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
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: stretch;
  background-color: #fff;
  padding: 20px;
  margin: 40px 0;
  border-radius: 20px;
  box-shadow: 10px 10px 9px -5px rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: 10px 10px 9px -5px rgba(0, 0, 0, 0.5);
}

/* Left column — search bar centered vertically */
.filter-bar__search {
  width: 400px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* Right column — chips top, selects bottom */
.filter-bar__right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: space-between;
}

.filter-bar__chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.filter-bar__chip {
  cursor: pointer;
}

.filter-bar__selects {
  display: flex;
  gap: 12px;
  width: auto;
}

.filter-bar__selects > * {
  flex: 1;
  min-width: 0;
}
</style>
