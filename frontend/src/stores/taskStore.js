import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import router from "../router/index.js";
import { useAuthStore } from "./authStore";
import { apolloClient } from "../apollo";
import { GET_TASKS_QUERY, CREATE_TASK_MUTATION, DELETE_TASK_MUTATION, UPDATE_TASK_MUTATION } from "../graphql/tasks";

export const useTaskStore = defineStore("tasks", () => {
  // --- STATE ---
  const tasks = ref([]);
  const loading = ref(false);
  const operationLoading = ref({});
  const error = ref(null);
  const sortBy = ref("manual");
  const priorityFilter = ref([]);
  const activeFilter = ref("all");
  const search = ref("");

  // --- HELPERS ---

  /** Strips Apollo's __typename from an object so it can be safely assigned to reactive state. */
  const stripTypename = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    const { __typename, ...rest } = obj;
    return rest;
  };

  /**
   * Maps frontend filter/sort state to backend GraphQL variables.
   */
  function buildQueryVariables() {
    const filter = {};
    const sort = {};

    switch (activeFilter.value) {
      case "done":
        filter.is_done = true;
        filter.is_archived = false;
        break;
      case "undone":
        filter.is_done = false;
        filter.is_archived = false;
        break;
      case "archived":
        filter.is_archived = true;
        break;
      case "all":
      default:
        filter.is_archived = false;
        break;
    }

    if (priorityFilter.value.length > 0) {
      filter.priority_level = [...priorityFilter.value];
    }

    if (search.value.trim()) {
      filter.search = search.value.trim();
    }

    switch (sortBy.value) {
      case "priority_desc":
        sort.field = "priority";
        sort.direction = "DESC";
        break;
      case "priority_asc":
        sort.field = "priority";
        sort.direction = "ASC";
        break;
      case "milestone_asc":
        sort.field = "milestone";
        sort.direction = "ASC";
        break;
      case "milestone_desc":
        sort.field = "milestone";
        sort.direction = "DESC";
        break;
      case "manual":
      default:
        sort.field = "manual";
        sort.direction = "ASC";
        break;
    }

    return {
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      sort,
    };
  }

  // --- GETTERS ---
  const visibleTasks = computed(() => tasks.value);

  const getTaskById = (uuid) => {
    return tasks.value.find((t) => t.uuid === uuid) ?? null;
  };

  // --- ERROR HANDLING ---

  function classifyError(err) {
    // Guard: if it's not an Apollo error, treat as business
    if (!err || typeof err !== "object") return "business";

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

  function handleError(err) {
    console.error("[taskStore] Error caught:", err);

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

    // business or unknown error
    error.value =
      err.graphQLErrors?.[0]?.message ||
      err.message ||
      "An unexpected error occurred.";
  }

  // --- ACTIONS ---
  async function addTask({ title, description = "", milestone = null, priority_level = "normal" }) {
    operationLoading.value["create"] = true;
    error.value = null;
    try {
      await apolloClient.mutate({
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
      await fetchTasks();
    } catch (err) {
      handleError(err);
    } finally {
      operationLoading.value["create"] = false;
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
    await fetchTasks();
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
      const variables = buildQueryVariables();
      const { data } = await apolloClient.query({
        query: GET_TASKS_QUERY,
        variables,
        fetchPolicy: "network-only",
      });
      const result = data?.tasks;
      tasks.value = Array.isArray(result) ? result.map(stripTypename) : [];
    } catch (err) {
      handleError(err);
    } finally {
      loading.value = false;
    }
  }

  async function reorderTasks(orderedUuids) {
    const previousOrders = {};
    tasks.value.forEach((t) => {
      previousOrders[t.uuid] = t.order_id;
    });

    orderedUuids.forEach((uuid, index) => {
      const task = tasks.value.find((t) => t.uuid === uuid);
      if (task) task.order_id = index;
    });

    operationLoading.value["reorder"] = true;
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
          }),
        ),
      );
    } catch (err) {
      tasks.value.forEach((t) => {
        if (previousOrders[t.uuid] !== undefined) {
          t.order_id = previousOrders[t.uuid];
        }
      });
      handleError(err);
    } finally {
      operationLoading.value["reorder"] = false;
    }
  }

  // --- WATCHERS ---
  // Re-fetch from server whenever filter/sort criteria change (debounced)
  let debounceTimer = null;
  watch(
    [activeFilter, sortBy, priorityFilter, search],
    () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchTasks();
      }, 300);
    },
  );

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
    // Error handling (exposed for testability)
    classifyError,
    handleError,
  };
});
