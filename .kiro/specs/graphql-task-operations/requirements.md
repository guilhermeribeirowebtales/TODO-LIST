# Requirements Document

## Introduction

Migrate the TODO-list frontend from local-only Pinia state (persisted via localStorage) to a GraphQL API backend for all task CRUD operations. After migration, tasks are authoritative on the server; the Pinia store becomes a client-side cache synchronised through Apollo Client mutations and queries. Filtering, sorting, and search remain client-side for responsiveness.

## Glossary

- **Task_Store**: The Pinia store (`taskStore.js`) that manages task state and exposes actions and getters to Vue components.
- **Apollo_Client**: The configured `@apollo/client` instance (`apollo.ts`) used to communicate with the GraphQL API.
- **GraphQL_API**: The Apollo Server running at `localhost:8080/graphql` that exposes task mutations and queries behind an `@auth` directive.
- **Auth_Store**: The Pinia store (`authStore.js`) that holds the JWT token obtained after login.
- **JWT_Token**: The JSON Web Token issued by the GraphQL_API upon successful login, required in the `Authorization` header for authenticated requests.
- **Task**: A data entity with fields: uuid, title, description, milestone, priority_level, order_id, is_done, is_archived.

## Requirements

### Requirement 1: Authenticated GraphQL Requests

**User Story:** As an authenticated user, I want my JWT token automatically attached to every GraphQL request, so that the API authorises my task operations without manual intervention.

#### Acceptance Criteria

1. WHEN the Auth_Store contains a valid JWT_Token, THE Apollo_Client SHALL include an `Authorization: Bearer <token>` header on every outgoing HTTP request to the GraphQL_API.
2. WHEN the Auth_Store does not contain a JWT_Token, THE Apollo_Client SHALL send requests without an `Authorization` header.
3. WHEN the JWT_Token in the Auth_Store changes (e.g., after login or logout), THE Apollo_Client SHALL use the updated token for subsequent requests without requiring a page reload.

### Requirement 2: Create Task via GraphQL

**User Story:** As a user, I want new tasks created through the GraphQL API, so that they are persisted on the server and available across devices.

#### Acceptance Criteria

1. WHEN the user submits a new task with title, description, milestone, and priority_level, THE Task_Store SHALL call the `createTask` mutation on the GraphQL_API with a `CreateTaskInput` containing those fields.
2. WHEN the GraphQL_API returns a successful `createTask` response, THE Task_Store SHALL add the returned Task (including its server-generated uuid) to the local tasks array.
3. IF the `createTask` mutation returns an error, THEN THE Task_Store SHALL preserve the local state unchanged and expose the error to the calling component.

### Requirement 3: Update Task via GraphQL

**User Story:** As a user, I want task edits saved to the server, so that changes are durable and consistent.

#### Acceptance Criteria

1. WHEN the user modifies one or more fields of an existing Task, THE Task_Store SHALL call the `updateTask` mutation on the GraphQL_API with the Task's uuid and an `UpdateTaskInput` containing only the changed fields.
2. WHEN the GraphQL_API returns a successful `updateTask` response, THE Task_Store SHALL merge the returned fields into the corresponding local Task object.
3. IF the `updateTask` mutation returns an error, THEN THE Task_Store SHALL revert the local Task to its pre-mutation state and expose the error to the calling component.

### Requirement 4: Toggle Task Done Status via GraphQL

**User Story:** As a user, I want toggling a task's completion status persisted on the server, so that progress is tracked durably.

#### Acceptance Criteria

1. WHEN the user toggles the done status of a Task, THE Task_Store SHALL call the `updateTask` mutation on the GraphQL_API with the Task's uuid and `{ is_done: <new_value> }`.
2. WHEN the GraphQL_API returns a successful response, THE Task_Store SHALL update the local Task's `is_done` field to match the returned value.
3. IF the mutation returns an error, THEN THE Task_Store SHALL revert the local `is_done` field and expose the error to the calling component.

### Requirement 5: Toggle Task Archive Status via GraphQL

**User Story:** As a user, I want archiving or unarchiving a task persisted on the server, so that my organisation choices are durable.

#### Acceptance Criteria

1. WHEN the user toggles the archive status of a Task, THE Task_Store SHALL call the `updateTask` mutation on the GraphQL_API with the Task's uuid and `{ is_archived: <new_value> }`.
2. WHEN the GraphQL_API returns a successful response, THE Task_Store SHALL update the local Task's `is_archived` field to match the returned value.
3. IF the mutation returns an error, THEN THE Task_Store SHALL revert the local `is_archived` field and expose the error to the calling component.

### Requirement 6: Delete Task via GraphQL

**User Story:** As a user, I want task deletion persisted on the server, so that removed tasks do not reappear.

#### Acceptance Criteria

1. WHEN the user deletes a Task, THE Task_Store SHALL call the `deleteTask` mutation on the GraphQL_API with the Task's uuid.
2. WHEN the GraphQL_API returns a successful `deleteTask` response, THE Task_Store SHALL remove the Task from the local tasks array.
3. IF the `deleteTask` mutation returns an error, THEN THE Task_Store SHALL keep the Task in the local array and expose the error to the calling component.

### Requirement 7: Fetch Tasks from GraphQL on Load

**User Story:** As a user, I want my task list loaded from the server when the app starts, so that I always see up-to-date data.

#### Acceptance Criteria

1. WHEN the user is authenticated and navigates to a view that displays tasks, THE Task_Store SHALL query the GraphQL_API for the user's tasks.
2. WHEN the GraphQL_API returns a successful response, THE Task_Store SHALL replace the local tasks array with the returned list of Tasks.
3. WHILE the query is in progress, THE Task_Store SHALL expose a loading state that components can use to show a loading indicator.
4. IF the query returns an error, THEN THE Task_Store SHALL expose the error to components and retain any previously loaded local data.

### Requirement 8: Reorder Tasks via GraphQL

**User Story:** As a user, I want drag-and-drop reordering persisted on the server, so that my custom order is preserved across sessions and devices.

#### Acceptance Criteria

1. WHEN the user reorders tasks via drag-and-drop, THE Task_Store SHALL update local `order_id` values immediately for a responsive UI, then call the appropriate GraphQL_API mutation to persist the new ordering.
2. WHEN the GraphQL_API returns a successful response, THE Task_Store SHALL confirm the local order is consistent with the server response.
3. IF the reorder mutation returns an error, THEN THE Task_Store SHALL revert local `order_id` values to their pre-drag state and expose the error to the calling component.

### Requirement 9: Client-Side Filtering and Sorting

**User Story:** As a user, I want filtering and sorting to remain instant and responsive, so that I do not wait for network round-trips when browsing my tasks.

#### Acceptance Criteria

1. THE Task_Store SHALL perform all filtering (by priority, done/undone/archived status) and sorting (by milestone, priority, manual order) on the locally cached tasks array without additional GraphQL_API queries.
2. THE Task_Store SHALL perform text search against locally cached task titles and descriptions without additional GraphQL_API queries.

### Requirement 10: Error Handling and Loading State

**User Story:** As a user, I want clear feedback when operations fail or are in progress, so that I understand the current state of my actions.

#### Acceptance Criteria

1. WHILE a mutation is in progress, THE Task_Store SHALL expose a per-operation loading flag that components can use to disable UI controls or show spinners.
2. IF a GraphQL_API request fails due to a network error, THEN THE Task_Store SHALL expose a user-readable error message indicating connectivity failure.
3. IF a GraphQL_API request fails due to an authentication error (401/403 or GraphQL auth error), THEN THE Task_Store SHALL clear the authentication state and redirect the user to the login view.
4. WHEN a mutation error occurs, THE Task_Store SHALL expose the error for a minimum duration sufficient for the user to perceive it, and allow the user to retry the operation.

### Requirement 11: Apollo Client Configuration with Auth Link

**User Story:** As a developer, I want the Apollo Client configured with an authentication link, so that token injection is centralised and maintainable.

#### Acceptance Criteria

1. THE Apollo_Client SHALL use an Apollo Link chain that includes an auth link responsible for reading the current JWT_Token from the Auth_Store and attaching it as a header.
2. THE Apollo_Client SHALL retain the existing `InMemoryCache` configuration.
3. THE Apollo_Client SHALL continue targeting the `http://localhost:8080/graphql` endpoint.
