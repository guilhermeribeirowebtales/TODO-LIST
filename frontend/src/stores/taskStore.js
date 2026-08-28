import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import router from "../router/index.js";
import { useAuthStore } from "./authStore";
import { apolloClient } from "../apollo";
import {
  GET_TASKS_QUERY,
  CREATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  REORDER_TASKS_MUTATION,
} from "../graphql/tasks";

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
    if (!err || typeof err !== "object") return "business";

    if (err.networkError) {
      const status = err.networkError.statusCode;
      if (status === 401 || status === 403) return "auth";
      return "network";
    }

    const gqlErrors = err.graphQLErrors || [];
    const isAuth = gqlErrors.some(
      (e) => e.extensions?.code === "UNAUTHENTICATED" || e.extensions?.code === "FORBIDDEN",
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

    error.value = err.graphQLErrors?.[0]?.message || err.message || "An unexpected error occurred.";
  }

  // --- ACTIONS ---

  /** Tracks the current in-flight fetch so we can cancel it when a newer one starts. */
  let activeFetchController = null;

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
    if (!uuid) return;
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
    if (!uuid) return;
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

  /**
   * Fetches tasks from the server with current filter/sort.
   * Cancels any in-flight fetch so only the latest request wins.
   */
  async function fetchTasks() {
    // Cancel previous in-flight request
    if (activeFetchController) {
      activeFetchController.abort();
    }

    const controller = new AbortController();
    activeFetchController = controller;

    loading.value = true;
    error.value = null;
    try {
      const variables = buildQueryVariables();
      const { data, errors } = await apolloClient.query({
        query: GET_TASKS_QUERY,
        variables,
        fetchPolicy: "network-only",
        errorPolicy: "all",
        context: { fetchOptions: { signal: controller.signal } },
      });

      // Only apply result if this is still the active request
      // Race Guard that ensures that even if the abort doesn't propagate fast enough, a stale response never overwrites a newer one.
      if (activeFetchController === controller) {
        const result = data?.tasks;
        // Filter out null entries and tasks with missing uuid (corrupt data)
        tasks.value = Array.isArray(result) ? result.filter((t) => t?.uuid).map(stripTypename) : [];

        // Show partial errors in the snackbar without discarding valid data
        if (errors?.length) {
          error.value = errors.map((e) => e.message).join("; ");
        }
      }
    } catch (err) {
      // Ignore aborted requests — a newer fetch replaced this one
      if (err.name === "AbortError" || controller.signal.aborted) {
        return;
      }
      handleError(err);
    } finally {
      // Only clear loading if this is still the active request
      if (activeFetchController === controller) {
        loading.value = false;
        activeFetchController = null;
      }
    }
  }

  async function reorderTasks(orderedUuids) {
    // Save previous state for revert
    const previousTasks = [...tasks.value];

    // Optimistic: reorder the tasks array to match the drag order
    const reordered = orderedUuids
      .map((uuid, index) => {
        const task = tasks.value.find((t) => t.uuid === uuid);
        if (task) task.order_id = index;
        return task;
      })
      .filter(Boolean);
    tasks.value = reordered;

    operationLoading.value["reorder"] = true;
    error.value = null;
    try {
      await apolloClient.mutate({
        mutation: REORDER_TASKS_MUTATION,
        variables: { orderedUuids },
      });
      await fetchTasks();
    } catch (err) {
      tasks.value = previousTasks;
      handleError(err);
    } finally {
      operationLoading.value["reorder"] = false;
    }
  }

  // --- WATCHERS ---
  // Debounce + cancel: waits 300ms after the last filter/sort change,
  // then fires fetchTasks which cancels any previous in-flight request.
  let debounceTimer = null;
  watch([activeFilter, sortBy, priorityFilter, search], () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchTasks(), 300);
  });

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
