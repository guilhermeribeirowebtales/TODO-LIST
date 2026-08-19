<template>
  <v-card class="pa-4" elevation="2" max-width="600" width="100%">
    <!-- Dynamic Header -->
    <v-card-title class="text-h5 font-weight-bold mb-4 text-primary">
      {{ isEditing ? "Edit Task" : "Create a new task" }}
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="handleSubmit" ref="formRef">
        <!-- Title Field -->
        <v-text-field
          v-model="formData.title"
          label="Title"
          placeholder="Task title"
          variant="outlined"
          color="primary"
          :rules="[(v) => !!v || 'Title is required']"
          required
          class="mb-2"
        ></v-text-field>

        <!-- Description Field -->
        <v-textarea
          v-model="formData.description"
          label="Description"
          placeholder="Task Description"
          variant="outlined"
          color="primary"
          rows="4"
          class="mb-2"
        ></v-textarea>

        <!-- Priority and Date Side-by-Side -->
        <div class="d-flex flex-column flex-sm-row gap-4 mb-4">
          <!-- Priority Select -->
          <v-select
            v-model="formData.priority_level"
            :items="['Normal', 'High', 'Very High']"
            label="Priority Level"
            variant="outlined"
            color="primary"
            :rules="[(v) => !!v || 'Priority is required']"
            class="flex-grow-1"
            hide-details="auto"
          ></v-select>

          <!-- Milestone Date -->
          <v-text-field
            v-model="formData.milestone"
            label="Milestone Date"
            type="date"
            variant="outlined"
            color="primary"
            clearable
            class="flex-grow-1"
            hide-details="auto"
          ></v-text-field>
        </div>

        <!-- Action Buttons -->
        <v-card-actions class="d-flex justify-end px-0 mt-4">
          <v-btn color="grey-darken-1" variant="text" @click="$emit('cancel')"> Cancel </v-btn>

          <v-btn
            color="primary"
            variant="elevated"
            type="submit"
            :prepend-icon="isEditing ? 'mdi-content-save' : 'mdi-plus'"
          >
            {{ isEditing ? "Update Task" : "Create Task" }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

// Accept initial data if we are editing an existing task
const props = defineProps({
  taskData: {
    type: Object,
    default: () => null,
  },
});

// Emit events back to the parent view (e.g., the page holding the form)
const emit = defineEmits(["submit", "cancel"]);

const formRef = ref(null);
const isEditing = ref(false);

// Our local state for the form inputs
const formData = ref({
  title: "",
  description: "",
  priority_level: "Normal",
  milestone: null,
});

// Function to populate or reset the form
const initForm = () => {
  if (props.taskData) {
    isEditing.value = true;
    // Create a shallow copy so we don't mutate the store directly before saving
    formData.value = { ...props.taskData };
  } else {
    isEditing.value = false;
    // Reset to defaults for a new task
    formData.value = {
      title: "",
      description: "",
      priority_level: "Normal",
      milestone: null,
    };
  }
};

// Run when component mounts and watch for prop changes (in case the same form is reused dynamically)
onMounted(initForm);
watch(() => props.taskData, initForm, { deep: true });

// Handle form submission
const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();

  if (valid) {
    // Send the data up to the parent component to handle the Pinia store save
    emit("submit", formData.value);
  }
};
</script>
