# Implementation Plan: GraphQL Task Operations

## Overview

Migrate the TODO-list frontend from local-only Pinia persistence to a GraphQL API backend. The implementation reconfigures Apollo Client with an auth link chain, creates centralised GraphQL operation documents, rewrites the task store to delegate CRUD operations to the API, and wires fetchTasks into the view lifecycle. Filtering, sorting, and search remain client-side.

## Tasks

- [x] 1. Configure Apollo Client with Auth Link Chain
  - [x] 1.1 Rewrite `frontend/src/apollo.ts` to use an Apollo Link chain with `setContext` auth link
    - Import `ApolloLink` and `setContext` from `@apollo/client/link/context`
    - Create `authLink` that reads `token` from `useAuthStore()` and attaches `Authorization: Bearer <token>` header when token exists
    - Compose `ApolloLink.from([authLink, httpLink])` as the client link
    - Retain `InMemoryCache` and `http://localhost:8080/graphql` endpoint
    - _Requirements: 1.1, 1.2, 1.3, 11.1, 11.2, 11.3_

  - [x] 1.2 Create `frontend/src/graphql/tasks.ts` with all GraphQL operation documents
    - Define `CREATE_TASK_MUTATION` with `CreateTaskInput` variable returning all Task fields
    - Define `UPDATE_TASK_MUTATION` with `id: ID!` and `UpdateTaskInput` variable
    - Define `DELETE_TASK_MUTATION` with `id: ID!` variable
    - Define `GET_TASKS_QUERY` returning all Task fields
    - _Requirements: 2.1, 3.1, 6.1, 7.1_

- [x] 2. Rewrite Task Store for GraphQL Integration
  - [x] 2.1 Add loading and error state to the task store
    - Add `loading` ref (boolean, for initial fetch)
    - Add `operationLoading` ref (Record<string, boolean>, keyed by operation name or task uuid)
    - Add `error` ref (string | null)
    - Remove `persist: true` option from the store (tasks now come from server)
    - _Requirements: 7.3, 10.1, 10.2_

  - [x] 2.2 Implement error classification and auth error handling
    - Create `classifyError(error)` internal function that distinguishes network, auth, and business errors
    - For auth errors: call `authStore.cleanUser()` and redirect to `/auth/login` via router
    - For network errors: set `error` to user-readable connectivity message
    - For business errors: set `error` to server-provided message
    - _Requirements: 10.2, 10.3, 10.4_

  - [x] 2.3 Implement `fetchTasks()` action
    - Call `apolloClient.query()` with `GET_TASKS_QUERY` and `fetchPolicy: 'network-only'`
    - Set `loading = true` before and `loading = false` after
    - On success: replace `tasks.value` with the returned array
    - On error: retain existing local data, classify error and handle accordingly
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 2.4 Implement `addTask()` action with GraphQL mutation
    - Call `apolloClient.mutate()` with `CREATE_TASK_MUTATION` and `CreateTaskInput` variables
    - Set `operationLoading['create'] = true` during operation
    - On success: push the server-returned Task (with server-generated uuid) to `tasks.value`
    - On error: do not modify local state, classify error and expose it
    - _Requirements: 2.1, 2.2, 2.3, 10.1_

  - [x] 2.5 Implement `updateTask()` action with GraphQL mutation
    - Call `apolloClient.mutate()` with `UPDATE_TASK_MUTATION`, passing task uuid and changed fields
    - Set `operationLoading[uuid] = true` during operation
    - On success: merge returned fields into the local task object
    - On error: revert local task to pre-mutation state, classify error
    - _Requirements: 3.1, 3.2, 3.3, 10.1_

  - [x] 2.6 Implement `toggleDone()` action with optimistic update
    - Immediately flip `is_done` locally (optimistic)
    - Call `updateTask` mutation with `{ is_done: <new_value> }`
    - On success: confirm local state matches server response
    - On error: revert `is_done` to previous value, expose error
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 2.7 Implement `toggleArchive()` action with optimistic update
    - Immediately flip `is_archived` locally (optimistic)
    - Call `updateTask` mutation with `{ is_archived: <new_value> }`
    - On success: confirm local state matches server response
    - On error: revert `is_archived` to previous value, expose error
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.8 Implement `deleteTask()` action with GraphQL mutation
    - Call `apolloClient.mutate()` with `DELETE_TASK_MUTATION` and the task uuid
    - Set `operationLoading[uuid] = true` during operation
    - On success: remove the task from `tasks.value`
    - On error: keep the task in the array, classify error and expose it
    - _Requirements: 6.1, 6.2, 6.3, 10.1_

  - [x] 2.9 Implement `reorderTasks()` action with optimistic update
    - Immediately update local `order_id` values for responsive UI
    - Call the appropriate GraphQL mutation to persist new ordering
    - On error: revert `order_id` values to pre-drag state, expose error
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 3. Checkpoint - Core store logic
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Wire fetchTasks into View Lifecycle
  - [x] 4.1 Call `fetchTasks()` on HomeView mount
    - In `frontend/src/views/HomeView.vue`, import `onMounted` and call `store.fetchTasks()` when the component mounts
    - Add a loading indicator (e.g., `v-progress-linear`) while `store.loading` is true
    - Add an error alert (e.g., `v-alert`) when `store.error` is non-null
    - _Requirements: 7.1, 7.3, 10.2_

  - [x] 4.2 Ensure client-side filtering and sorting remain unchanged
    - Verify `visibleTasks`, `activeTasks`, `archivedTasks` computed properties still operate on the local `tasks` array
    - No GraphQL queries should be triggered by filter/sort/search changes
    - _Requirements: 9.1, 9.2_

- [x] 5. Checkpoint - Integration wiring
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Property-Based Tests
  - [ ]* 6.1 Write property test for auth link token injection
    - **Property 1: Auth link injects current token**
    - **Property 2: Auth link omits header when token is absent**
    - **Validates: Requirements 1.1, 1.2, 1.3, 11.1**

  - [ ]* 6.2 Write property test for successful create
    - **Property 3: Successful create adds exactly one task**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 6.3 Write property test for mutation error preservation
    - **Property 4: Mutation error preserves the tasks array**
    - **Validates: Requirements 2.3, 6.3, 7.4**

  - [ ]* 6.4 Write property test for update field merging
    - **Property 5: Update merges returned fields without affecting others**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 6.5 Write property test for optimistic revert on error
    - **Property 6: Optimistic mutation error reverts to pre-mutation state**
    - **Validates: Requirements 3.3, 4.3, 5.3, 8.3**

  - [ ]* 6.6 Write property test for toggle operations
    - **Property 7: Toggle operations invert the target boolean field**
    - **Validates: Requirements 4.1, 4.2, 5.1, 5.2**

  - [ ]* 6.7 Write property test for delete
    - **Property 8: Successful delete removes exactly the target task**
    - **Validates: Requirements 6.1, 6.2**

  - [ ]* 6.8 Write property test for fetch replacing local state
    - **Property 9: Fetch replaces local state with server response**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 6.9 Write property test for client-side filtering invariants
    - **Property 10: Client-side filtering never mutates the source array**
    - **Validates: Requirements 9.1, 9.2**

  - [ ]* 6.10 Write property test for reorder
    - **Property 11: Reorder applies new order_id values immediately**
    - **Validates: Requirements 8.1, 8.2**

- [ ] 7. Unit Tests
  - [ ]* 7.1 Write unit tests for error handling and loading states
    - Test auth error triggers `cleanUser()` and router redirect
    - Test `loading` flag lifecycle during fetchTasks
    - Test `operationLoading[uuid]` lifecycle during mutations
    - Test network error sets user-readable message
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 7.2 Write unit tests for mutation variable correctness
    - Test `addTask` sends correct `CreateTaskInput` variables
    - Test `updateTask` sends correct uuid and `UpdateTaskInput` variables
    - Test `deleteTask` sends correct uuid variable
    - Test `toggleDone` sends `{ is_done: <inverted_value> }`
    - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1_

  - [ ]* 7.3 Write smoke tests for Apollo Client configuration
    - Verify cache is instance of `InMemoryCache`
    - Verify HTTP link targets `http://localhost:8080/graphql`
    - _Requirements: 11.2, 11.3_

- [ ] 8. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The store removes `persist: true` for tasks since the server is now the source of truth
- `@vue/apollo-composable` is NOT used — all GraphQL calls go through `apolloClient.mutate()` / `apolloClient.query()` directly
- fast-check and vitest are available at the root project level

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "2.4", "2.8"] },
    { "id": 3, "tasks": ["2.5", "2.6", "2.7", "2.9"] },
    { "id": 4, "tasks": ["4.1", "4.2"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3", "6.9"] },
    { "id": 6, "tasks": ["6.4", "6.5", "6.6", "6.7", "6.8", "6.10"] },
    { "id": 7, "tasks": ["7.1", "7.2", "7.3"] }
  ]
}
```
