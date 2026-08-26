import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useTaskStore = defineStore(
  "tasks",
  () => {
    // --- STATE ---
    /** @type {import('vue').Ref<Array<{ uuid: string, title: string, description: string, milestone: string|null, priority_level: 'normal'|'high'|'very_high', order_id: number, is_done: boolean, is_archived: boolean }>>} */
    const tasks = ref([]);

    // --- FILTER & SORT STATE ---
    /** @type {import('vue').Ref<'manual'|'milestone_asc'|'milestone_desc'|'priority_asc'|'priority_desc'>} */
    const sortBy = ref("manual");

    /** @type {import('vue').Ref<Array<'normal'|'high'|'very_high'>>} */
    const priorityFilter = ref([]); // Empty array means "show all"

    /** @type {import('vue').Ref<'all'|'done'|'undone'|'archived'>} */
    const activeFilter = ref("all");

    /** @type {import('vue').Ref<string>} */
    const search = ref("");

    // --- HELPERS ---
    //Alterar niveis para 1,2,3 e adicionar labels
    //Mas pensando em escalabilidade, se eu quiser adicionar um novo filtro mais a frente
    // nao tenho numeros para tal, ou seja melhor ser 1,5,10
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
      // We create a shallow copy [...processedList] (the spread ... is the syntax that creats the copy ) to avoid mutating the original array
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

    // /** Archived tasks, filtered and sorted */
    const archivedTasks = computed(() => {
      const archived = tasks.value.filter((t) => t.is_archived);
      return applyFiltersAndSort(archived);
    });

    /** The final task list for the home view, driven by activeFilter and search */
    const visibleTasks = computed(() => {
      let list = activeFilter.value === "archived" ? archivedTasks.value : activeTasks.value;

      if (activeFilter.value === "done") list = list.filter((t) => t.is_done);
      if (activeFilter.value === "undone") list = list.filter((t) => !t.is_done);

      if (search.value.trim()) {
        const q = search.value.trim().toLowerCase();
        list = list.filter(
          (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q),
        );
      }

      return list;
    });

    /** Find a single task by uuid */
    /** The getById function essentialy returns a function
    If we removed the computed from it, it would rerun every call without caching.
    As a computed function, its result is cached */

    //Removed computed because there is no reactivity from this function
    //TODO: Understanding when to use computed and reactivity
    const getTaskById = (uuid) => {
      return tasks.value.find((t) => t.uuid === uuid) ?? null;
    };

    /** Find all the done Tasks */
    // const completedTasks = computed(() => {
    //   const done = tasks.value.filter((t) => t.is_done);
    //   return applyFiltersAndSort(done);
    // });

    // --- ACTIONS ---
    /** Add a new task */
    function addTask({ title, description = "", milestone = null, priority_level = "normal" }) {
      let trimedTitle = title.trim();
      const maxOrder = tasks.value.reduce((max, t) => Math.max(max, t.order_id), -1);

      tasks.value.push({
        uuid: crypto.randomUUID(),
        title: trimedTitle || "undefined",
        description,
        milestone,
        priority_level: priority_level.toLowerCase(),
        order_id: maxOrder + 1,
        prev_order_id: null,
        is_done: false,
        is_archived: false,
      });
    }

    /** Update fields of an existing task by uuid */
    //Possibilidade de ao inves fazer toggleDone e toggleArchive, passar um value numa função num botao
    //e fazer um update do objeto, assim reciclando o metodo
    function updateTask(uuid, fields) {
      let task = tasks.value.find((t) => t.uuid === uuid);
      if (!task) return;

      // Normalize priority_level casing if present in the update payload
      // if (fields.priority_level) {
      //   fields = { ...fields, priority_level: fields.priority_level.toLowerCase() };
      // }
      // task = { ...task, ...fields };

      Object.assign(task, fields);
    }

    /** Toggle is_done on a task */
    /** Added further functionality, when a task is toggled as done it puts it in last place on the array
     * some complexity was added and a new field was also added to the data model for the task
     * prev_order_id was added to save the the last position on the array of that task allowing
     * the user to toggle and untoggle the tasks
     */
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

    // Alternativa ao vuedraggable
    // Onde eu estou a passar uma lista de ids ordenados
    //Se forem a lista completa, ok, mas tbm enviou uma lista de ids filtrados
    // essa lista pode so ter 2 tasks, e assim fica apenas com duas posições
    //erroneamente filtrando mal as tasks relativamente ao array de tasks completo
    // optar por um approach de deteção de evento e swap entre as tasks alteradas

    return {
      // State
      tasks,
      sortBy,
      priorityFilter,
      activeFilter,
      search,
      // Getters
      //activeTasks,
      //archivedTasks,
      visibleTasks,
      //completedTasks,
      getTaskById,
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
    //The third argument enables pinia-plugin-persistedstate,
    //which automatically saves the store to localStorage and rehydrates on page reload.
    //Hydration means restauring data from localStorage to active memory
    //This works in the following way:
    /**
     * [Page is refreshed]
     * │
       ▼
       1. Pinia starts with an empty state
       │
       ▼
       2. Rehydration: The plugin reads the localStorage and injects the data saved on Pinia
       │
       ▼
       3. The app keeps working with the exact same data the user left it with
     */
    //
  },
);

// A store is global container that holds the application shared data and business logic.
// Acting as a single, centralized source of truth for you state (data), where your components can read and write to it.
// Avoids prop drilling and event complexity
