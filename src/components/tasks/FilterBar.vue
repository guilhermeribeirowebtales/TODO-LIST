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

watch(localSearch, (val) => emit("update:search", val ?? ""));

function setFilter(value) {
  activeFilter.value = value;
  emit("update:filter", value);
}
</script>

<template>
  <div class="filter-bar">
    <v-text-field
      v-model="localSearch"
      prepend-inner-icon="mdi-magnify"
      label="Search tasks..."
      variant="solo"
      clearable
      hide-details
      density="comfortable"
    />

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
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-direction: row;
  gap: 12px;
  background-color: #fff;
  padding: 20px;
  margin: 40px;
  border-radius: 20px;
  box-shadow: 10px 10px 9px -5px rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: 10px 10px 9px -5px rgba(0, 0, 0, 0.5);
}

.filter-bar__chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-bar__chip {
  cursor: pointer;
}
</style>
