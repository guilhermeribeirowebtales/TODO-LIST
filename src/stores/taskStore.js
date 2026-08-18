import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useTaskStore = defineStore(
  "tasks",
  () => {
    // --- STATE ---
    /** @type {import('vue').Ref<Array<{ uuid: string, title: string, description: string, milestone: string|null, priority_level: 'normal'|'high'|'very_high', order_id: number, is_done: boolean, is_archived: boolean }>>} */
    const tasks = ref([
      {
        uuid: crypto.randomUUID(),
        title: "Configurar Vue",
        description: "Instalar Vue Router e Pinia manualmente",
        milestone: "2026-08-19",
        priority_level: "very_high",
        order_id: 0,
        is_done: true,
        is_archived: false,
      },
      {
        uuid: crypto.randomUUID(),
        title: "Criar Mockup UI",
        description: "Desenhar a interface base para aprovação",
        milestone: null,
        priority_level: "normal",
        order_id: 1,
        is_done: true,
        is_archived: true,
      },
      {
        uuid: crypto.randomUUID(),
        title: "Implementar Drag and Drop",
        description: "Adicionar lógica de ordenação manual",
        milestone: "2026-08-22",
        priority_level: "high",
        order_id: 2,
        is_done: false,
        is_archived: false,
      },
      {
        uuid: crypto.randomUUID(),
        title: "Testar Filtros",
        description: "Testar estados e atalho de data",
        milestone: "2026-08-25",
        priority_level: "normal",
        order_id: 3,
        is_done: false,
        is_archived: false,
      },
      {
        uuid: crypto.randomUUID(),
        title: "Implementar Authentication",
        description: "Make a fake database using users.json",
        milestone: "2026-08-18",
        priority_level: "normal",
        order_id: 4,
        is_done: false,
        is_archived: false,
      },
    ]);

    // --- FILTER & SORT STATE ---
    /** @type {import('vue').Ref<'manual'|'milestone_asc'|'milestone_desc'|'priority_asc'|'priority_desc'>} */
    const sortBy = ref("manual");

    /** @type {import('vue').Ref<Array<'normal'|'high'|'very_high'>>} */
    const priorityFilter = ref([]); // Empty array means "show all"

    // --- HELPERS ---
    const priorityWeights = {
      very_high: 3,
      high: 2,
      normal: 1,
    };

    /** Applies the current priority filter and sorting logic to an array of tasks */
    const applyFiltersAndSort = (taskList) => {
      // 1. Filter by Priority
      let processedList = taskList;
      if (priorityFilter.value.length > 0) {
        processedList = processedList.filter((t) =>
          priorityFilter.value.includes(t.priority_level),
        );
      }

      // 2. Sort
      // We create a shallow copy [...processedList] to avoid mutating the original array
      return [...processedList].sort((a, b) => {
        if (sortBy.value === "milestone_asc") {
          if (!a.milestone) return 1; // Push nulls to the bottom
          if (!b.milestone) return -1;
          return new Date(a.milestone) - new Date(b.milestone);
        }
        if (sortBy.value === "milestone_desc") {
          if (!a.milestone) return 1;
          if (!b.milestone) return -1;
          return new Date(b.milestone) - new Date(a.milestone);
        }
        if (sortBy.value === "priority_desc") {
          return priorityWeights[b.priority_level] - priorityWeights[a.priority_level];
        }
        if (sortBy.value === "priority_asc") {
          return priorityWeights[a.priority_level] - priorityWeights[b.priority_level];
        }

        // Default fallback: 'manual' (drag and drop order)
        return a.order_id - b.order_id;
      });
    };

    // --- GETTERS ---
    /** Active tasks (not archived), filtered and sorted */
    const activeTasks = computed(() => {
      const active = tasks.value.filter((t) => !t.is_archived);
      return applyFiltersAndSort(active);
    });

    /** Archived tasks, filtered and sorted */
    const archivedTasks = computed(() => {
      const archived = tasks.value.filter((t) => t.is_archived);
      return applyFiltersAndSort(archived);
    });

    /** Find a single task by uuid */
    const getById = computed(() => (uuid) => {
      return tasks.value.find((t) => t.uuid === uuid) ?? null;
    });

    /** Find all the done Tasks */
    const completedTasks = computed(() => {
      const done = tasks.value.filter((t) => t.is_done);
      return applyFiltersAndSort(done);
    });

    // --- ACTIONS ---
    /** Add a new task */
    function addTask({ title, description = "", milestone = null, priority_level = "normal" }) {
      const maxOrder = tasks.value.reduce((max, t) => Math.max(max, t.order_id), -1);

      tasks.value.push({
        uuid: crypto.randomUUID(),
        title: title || "undefined",
        description,
        milestone,
        priority_level,
        order_id: maxOrder + 1,
        is_done: false,
        is_archived: false,
      });
    }

    /** Update fields of an existing task by uuid */
    function updateTask(uuid, fields) {
      const task = tasks.value.find((t) => t.uuid === uuid);
      if (!task) return;
      Object.assign(task, fields);
    }

    /** Toggle is_done on a task */
    function toggleDone(uuid) {
      const task = tasks.value.find((t) => t.uuid === uuid);
      if (!task) return;
      task.is_done = !task.is_done;
    }

    /** Toggle is_archived on a task */
    function toggleArchive(uuid) {
      const task = tasks.value.find((t) => t.uuid === uuid);
      if (!task) return;
      task.is_archived = !task.is_archived;
    }

    /** Permanently delete a task */
    function deleteTask(uuid) {
      const index = tasks.value.findIndex((t) => t.uuid === uuid);
      if (index === -1) return;
      tasks.value.splice(index, 1);
    }

    /** Update order_id for all tasks after a drag-and-drop reorder.
     *  Pass the new ordered array of uuids. */
    function reorderTasks(orderedUuids) {
      orderedUuids.forEach((uuid, index) => {
        const task = tasks.value.find((t) => t.uuid === uuid);
        if (task) task.order_id = index;
      });
    }

    return {
      // State
      tasks,
      // Getters
      activeTasks,
      archivedTasks,
      completedTasks,
      getById,
      // Actions
      addTask,
      updateTask,
      toggleDone,
      toggleArchive,
      deleteTask,
      reorderTasks,
    };
  },
  {
    persist: true, // pinia-plugin-persistedstate options passed as 3rd argument
  },
);
