<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { PRIORITY_OPTIONS } from "@/utils/constants";

const props = defineProps({
  taskData: {
    type: Object,
    default: () => null,
  },
});

const emit = defineEmits(["submit", "cancel"]);

const formRef = ref(null);
const isEditing = computed(() => !!props.taskData);

const formData = ref({
  title: "",
  description: "",
  priority_level: "normal",
  milestone: null,
});

const initForm = () => {
  if (props.taskData) {
    isEditing.value = true;
    formData.value = { ...props.taskData };
  } else {
    isEditing.value = false;
    formData.value = {
      title: "",
      description: "",
      priority_level: "normal",
      milestone: null,
    };
  }
};

//onMounted is a function that registeres a callback function as soon as
// the component, and all of its synchronous child components,
// have been rendered and inserted into the DOM
onMounted(initForm);

//watch here is correct, and can't be replaced by a computed
//because the form needs a mutable local state.
//computed would make formData read-only.

watch(() => props.taskData, initForm, { deep: true });

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (valid) {
    emit("submit", { ...formData.value });
  }
};
</script>

<template>
  <v-card class="pa-4" elevation="2" max-width="600" width="100%">
    <!-- Dynamic Header -->
    <v-card-title class="text-h5 font-weight-bold mb-4 text-primary">
      {{ isEditing ? "Edit Task" : "Create a new task" }}
    </v-card-title>

    <v-card-text>
      <!-- .prevent calls event.preventDefault()
       which stops the browser from executing a real form POST request,
       then ref="formRef" gives the script access to the Vuetify form instance -->

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
            :items="PRIORITY_OPTIONS"
            item-title="label"
            item-value="value"
            label="Priority Level"
            variant="outlined"
            color="primary"
            :rules="[(v) => !!v || 'Priority is required']"
            class="flex-grow-1"
            hide-details="auto"
          />

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
