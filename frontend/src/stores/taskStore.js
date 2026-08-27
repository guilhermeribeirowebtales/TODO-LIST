import { ref, computed } from "vue";
import { defineStore } from "pinia";
import router from "../router/index.js";
import { useAuthStore } from "./authStore";
import { apolloClient } from "../apollo";
import { GET_TASKS_QUERY, CREATE_TASK_MUTATION, DELETE_TASK_MUTATION, UPDATE_TASK_MUTATION } from "../graphql/tasks";

export const useTaskStore = defineStore("tasks", () => {
  // --- STATE ---
  /** @type {import('vue').Ref<Array<{ uuid: string, title: string, description: string, milestone: string|null, priority_level: 'normal'|'high'|'very_high', order_id: number, is_done: boolean, is_archived: boolean }>>} */
  const tasks = ref([]);

  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false);

  /** @type {import('vue').Ref<Record<string, boolean>>} */
  const operationLoading = ref({});

  /** @type {import('vue').Ref<string|null>} */
  const error = ref(null);

  /** @type {import('vue').Ref<'manual'|'milestone_asc'|'milestone_desc'|'priority_asc'|'priority_desc'>} */
  const sortBy = ref("manual");

  /** @type {import('vue').Ref<Array<'normal'|'high'|'very_high'>>} */
  const priorityFilter = ref([]);

  /** @type {import('vue').Ref<'all'|'done'|'undone'|'archived'>} */
  const activeFilter = ref("all");

  /** @type {import('vue').Ref<string>} */
  const search = ref("");

  // --- HELPERS ---

  /** Strips Apollo's __typename from an object so it can be safely assigned to reactive state. */
  const stripTypename = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    const { __typename, ...rest } = obj;
    return rest;
  };

  const priorityWeights = {
    very_high: 3,
    high: 2,
    normal: 1,
  };

  /** Applies the current priority filter and sorting logic to an array of tasks */
  const applyFiltersAndSort = (taskList) => {
    let processedList = taskList;
    if (priorityFilter.value.length > 0) {
      processedList = processedList.filter((t) =>
        priorityFilter.value.includes(t.priority_level),
      );
    }

    return [...processedList].sort((a, b) => {
      if (sortBy.value === "milestone_asc") {
        if (!a.milestone) return 1;
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

      return a.order_id - b.order_id;
    });
  };

  // --- GETTERS ---
  const activeTasks = computed(() => {
    const active = tasks.value.filter((t) => !t.is_archived);
    return applyFiltersAndSort(active);
  });

  const archivedTasks = computed(() => {
    const archived = tasks.value.filter((t) => t.is_archived);
    return applyFiltersAndSort(archived);
  });

  /** The final task list for the view, driven by activeFilter and search */
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

  const getTaskById = (uuid) => {
    return tasks.value.find((t) => t.uuid === uuid) ?? null;
  };

  // --- ERROR HANDLING (internal) ---

  /**
   * Classifies an Apollo error into network, auth, or business category.
   * @param {import('@apollo/client').ApolloError} err
   * @returns {'network' | 'auth' | 'business'}
   */
  function classifyError(err) {
    if (err.networkError) {
      const status = err.networkError.statusCode;
      if (status === 401 || status === 403) return "auth";
      return "network";
    }

    const gqlErrors = err.graphQLErrors || [];
    const isAuth = gqlErrors.some(
      (e) =>
        e.extensions?.code === "UNAUTHENTICATED" || e.extensions?.code === "FORBIDDEN",
    );
    if (isAuth) return "auth";

    return "business";
  }

  /**
   * Handles a classified error: redirects on auth errors, sets user-readable messages otherwise.
   * @param {import('@apollo/client').ApolloError} err
   */
  function handleError(err) {
    const kind = classifyError(err);

    if (kind === "auth") {
      const authStore = useAuthStore();
      authStore.cleanUser();
      router.push({ name: "login" });
      return;
    }

    if (kind === "network") {
      error.value = "Unable to connect to the server. Please check your connection.";
      return;
    }

    // business error
    error.value =
      err.graphQLErrors?.[0]?.message || "An unexpected error occurred.";
  }

  // --- ACTIONS ---
  async function addTask({ title, description = "", milestone = null, priority_level = "normal" }) {
    operationLoading.value['create'] = true;
    error.value = null;
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_TASK_MUTATION,
        variables: {
          input: {
            title: title.trim() || "undefined",
            description,
            milestone,
            priority_level: priority_level.toLowerCase(),
          },
        },
      });
      tasks.value.push(stripTypename(data.createTask));
    } catch (err) {
      handleError(err);
    } finally {
      operationLoading.value['create'] = false;
    }
  }

  async function updateTask(uuid, fields) {
    const task = tasks.value.find((t) => t.uuid === uuid);
    if (!task) return;

    const previousState = { ...task };

    operationLoading.value[uuid] = true;
    error.value = null;
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_TASK_MUTATION,
        variables: {
          id: uuid,
          input: fields,
        },
      });
      Object.assign(task, stripTypename(data.updateTask));
    } catch (err) {
      Object.assign(task, previousState);
      handleError(err);
    } finally {
      operationLoading.value[uuid] = false;
    }
  }

  async function toggleDone(uuid) {
    const task = tasks.value.find((t) => t.uuid === uuid);
    if (!task) return;
    await updateTask(uuid, { is_done: !task.is_done });
  }

  async function toggleArchive(uuid) {
    const task = tasks.value.find((t) => t.uuid === uuid);
    if (!task) return;
    await updateTask(uuid, { is_archived: !task.is_archived });
  }

  async function deleteTask(uuid) {
    operationLoading.value[uuid] = true;
    error.value = null;
    try {
      await apolloClient.mutate({
        mutation: DELETE_TASK_MUTATION,
        variables: { id: uuid },
      });
      const index = tasks.value.findIndex((t) => t.uuid === uuid);
      if (index !== -1) {
        tasks.value.splice(index, 1);
      }
    } catch (err) {
      handleError(err);
    } finally {
      operationLoading.value[uuid] = false;
    }
  }

  async function fetchTasks() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await apolloClient.query({
        query: GET_TASKS_QUERY,
        fetchPolicy: 'network-only',
      });
      tasks.value = data.getTasks.map(stripTypename);
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
    }
  }

  async function reorderTasks(orderedUuids) {
    // Save previous order for revert
    const previousOrders = {};
    tasks.value.forEach((t) => {
      previousOrders[t.uuid] = t.order_id;
    });

    // Optimistic: update order_id values immediately
    orderedUuids.forEach((uuid, index) => {
      const task = tasks.value.find((t) => t.uuid === uuid);
      if (task) task.order_id = index;
    });

    operationLoading.value['reorder'] = true;
    error.value = null;
    try {
      await Promise.all(
        orderedUuids.map((uuid, index) =>
          apolloClient.mutate({
            mutation: UPDATE_TASK_MUTATION,
            variables: {
              id: uuid,
              input: { order_id: index },
            },
          })
        )
      );
    } catch (err) {
      // Revert to previous order
      tasks.value.forEach((t) => {
        if (previousOrders[t.uuid] !== undefined) {
          t.order_id = previousOrders[t.uuid];
        }
      });
      handleError(err);
    } finally {
      operationLoading.value['reorder'] = false;
    }
  }

  return {
    // State
    tasks,
    loading,
    operationLoading,
    error,
    sortBy,
    priorityFilter,
    activeFilter,
    search,
    // Getters
    visibleTasks,
    getTaskById,
    // Actions
    fetchTasks,
    addTask,
    updateTask,
    toggleDone,
    toggleArchive,
    deleteTask,
    reorderTasks,
    // Error handling (internal, exposed for testability)
    classifyError,
    handleError,
  };
});
