# TODO List App — Implementation Plan

## Problem Statement

Build a fully featured TODO List SPA in Vue 3 + Vuetify 3 where users can create, edit, delete, archive, and organize daily tasks with priorities, milestones, and flexible filtering/sorting.

## Requirements

- Task management: create/edit (own route, async component), delete (confirmation dialog), archive, mark done/undone
- Task fields: title, description, priority (normal / high / very high), milestone date (optional)
- Home view: task list with search, filter by state/priority/archived, sort by priority or milestone, drag-and-drop reorder (deferred)
- Inline quick actions per card: done toggle, archive, delete, milestone shortcut (inline date picker)
- All data persisted to localStorage via Pinia + pinia-plugin-persistedstate
- Routes: `/` (list), `/tasks/new`, `/tasks/:id/edit` — form loaded as async component

## Background

- Project is already scaffolded: Vue 3, Vue Router 4, Pinia 4, Vuetify 3, MDI icons, pinia-plugin-persistedstate all installed and wired in `main.js`
- `plugins/vuetify.js` has theme configured (primary `#1867C0`, background `#F5F5F5`)
- `App.vue` has the app shell (app bar + router-view)
- `stores/taskStore.js` exists but is empty
- `views/HomeView.vue` exists as a placeholder
- No drag-and-drop library installed yet — deferred to later

## Data Structure

The CSV below defines the data contract (field names, types, and sample data).
Runtime storage is JSON in localStorage via Pinia + pinia-plugin-persistedstate.

### CSV Schema (data contract reference)

```
uuid,title,description,milestone,priority_level,order_id,is_done,is_archived
```

| Field            | Type    | Values                        | Notes                                  |
| ---------------- | ------- | ----------------------------- | -------------------------------------- |
| `uuid`           | string  | uuid-v4                       | Generated on task creation             |
| `title`          | string  | any                           | Required                               |
| `description`    | string  | any                           | Optional                               |
| `milestone`      | string  | ISO date (YYYY-MM-DD) or null | Optional                               |
| `priority_level` | string  | `normal`, `high`, `very_high` |                                        |
| `order_id`       | number  | integer ≥ 0                   | Used for manual drag-and-drop ordering |
| `is_done`        | boolean | true / false                  |                                        |
| `is_archived`    | boolean | true / false                  |                                        |

### Sample Data (CSV)

```csv
uuid,title,description,milestone,priority_level,order_id,is_done,is_archived
uuid-generated,Configurar Vue,Instalar Vue Router e Pinia manualmente,2026-08-19,very_high,0,true,false
uuid-generated,Criar Mockup UI,Desenhar a interface base para aprovação,,normal,1,true,true
uuid-generated,Implementar Drag and Drop,Adicionar lógica de ordenação manual,2026-08-22,high,2,false,false
uuid-generated,Testar Filtros,Testar estados e atalho de data,2026-08-25,normal,3,false,false
uuid-generated,Implementar Authentication,Make a fake database using users.json,2026-08-18,normal,4,false,false
```

### JSON Shape (runtime storage in localStorage)

```json
{
  "uuid": "uuid-v4",
  "title": "string",
  "description": "string",
  "milestone": "YYYY-MM-DD | null",
  "priority_level": "NORMAL | HIGH | VERY_HIGH",
  "order_pos": 0,
  "is_done": false,
  "is_archived": false
}
```

## Architecture

```
App.vue
├── HomeView
│   ├── FilterBar
│   ├── TaskList
│   │   └── TaskCard
│   │       ├── MilestoneShortcut (v-menu + date picker)
│   │       └── ConfirmDialog (delete)
└── TaskFormView (async)

taskStore (Pinia) → localStorage
```

---

## Tasks

### Task 1 — Pinia Task Store with persisted state

**Objective:** Define the task data model and all store actions.

**Implementation:**

- Fill `src/stores/taskStore.js` using `defineStore` with `persist: true`
- State: `tasks: []`
- Getters: `activeTasks` (not archived), `archivedTasks`, `getById(uuid)`
- Actions: `addTask`, `updateTask`, `deleteTask`, `toggleDone`, `toggleArchive`, `reorderTasks`
- `addTask` generates a `uuid` (via `crypto.randomUUID()`), assigns the next `order_id`, sets `is_done: false`, `is_archived: false`
- Seed the 5 sample tasks from the CSV above for development

**Demo:** Open Vue DevTools → Pinia tab, confirm tasks array is populated and survives a page refresh (localStorage persisted).

---

### Task 2 — Home view: basic task list

**Objective:** Render all active tasks as Vuetify cards on the home screen.

**Implementation:**

- Build `src/components/tasks/TaskCard.vue` — `v-card` showing title, description (truncated), priority chip (color-coded), and milestone date
- Priority chip colors: normal = default, high = orange, very_high = red
- Update `HomeView.vue` to import the store and render `TaskCard` components
- Empty state: centered message/illustration when no tasks exist

**Demo:** Home route `/` displays the seeded tasks as cards with correct priority colors and milestone dates.

---

### Task 3 — Async task form: create flow

**Objective:** Add the `/tasks/new` route with a lazily loaded form component.

**Implementation:**

- Create `src/views/TaskFormView.vue` with fields: title (`v-text-field`, required), description (`v-textarea`), priority (`v-btn-toggle` or `v-chip-group`), milestone (`v-text-field` type=date, optional)
- Add route: `{ path: '/tasks/new', name: 'task-new', component: () => import('../views/TaskFormView.vue') }`
- On submit: call `addTask`, redirect to `/`
- Validate: title is required; show `v-alert` on error
- The app bar "+" button already navigates to `/tasks/new`

**Demo:** Click "+" → form loads as a lazy chunk → fill fields → submit → new card appears on home screen.

---

### Task 4 — Async task form: edit flow

**Objective:** Add `/tasks/:id/edit` reusing the same async component.

**Implementation:**

- Add route: `{ path: '/tasks/:id/edit', name: 'task-edit', component: () => import('../views/TaskFormView.vue') }`
- Detect `route.params.id` in `TaskFormView.vue`; if present, load existing task via `getById`
- On submit: call `updateTask`, redirect to `/`
- Handle invalid ID: redirect to `/` with a snackbar error
- Add a `mdi-pencil` icon button to `TaskCard.vue` that navigates to `/tasks/:id/edit`

**Demo:** Click edit on a card → form pre-populated → change a field → save → card reflects the update.

---

### Task 5 — Inline task actions: done, archive, delete

**Objective:** Wire up all inline action buttons on `TaskCard.vue`.

**Implementation:**

- Done toggle: `mdi-check-circle` icon → calls `toggleDone` → toggles `is_done` → card gets strikethrough style and "Done" chip
- Archive: `mdi-archive` icon → calls `toggleArchive` → sets `is_archived: true` → card disappears from active list
- Delete: `mdi-delete` icon → opens `v-dialog` confirmation with Cancel/Confirm → on confirm calls `deleteTask`
- Create `src/components/common/ConfirmDialog.vue` as a reusable component

**Demo:** Toggle done → strikethrough. Archive → card disappears. Delete → dialog → confirm → card removed.

---

### Task 6 — Milestone shortcut: inline date picker on card

**Objective:** Allow quick milestone editing directly from the task card.

**Implementation:**

- Add a `mdi-calendar` icon button on `TaskCard.vue`
- On click: open a `v-menu` containing a date input
- On date select: call `updateTask` with the new milestone, close the menu
- Display: no date → shows "Set date"; date set → shows formatted date

**Demo:** Click calendar icon → date picker opens inline → pick a date → card updates without page navigation.

---

### Task 7 — Search, filter, and sort controls

**Objective:** Add a toolbar with search, filter chips, and sort options.

**Implementation:**

- Create `src/components/tasks/FilterBar.vue` with:
  - `v-text-field` for text search (filters by title + description)
  - `v-chip-group` for status filters: All / Undone / Done / Archived (maps to `is_done` and `is_archived` fields)
  - `v-select` for sort: Default (by `order_id`) / By Priority (`priority_level`) / By Milestone (`milestone`)
- All filtering/sorting as computed properties in `HomeView.vue` or a `useTaskFilter` composable in `src/utils/`
- Priority sort order: very_high → high → normal
- Milestone sort: tasks with dates first (ascending), then tasks without dates

**Demo:** Type in search → list filters live. Click "Done" chip → only done tasks show. Sort by Priority → cards reorder.

---

### Task 8 — Polish: empty states, snackbar feedback, responsive layout

**Objective:** Tie everything together with UX feedback and a clean layout.

**Implementation:**

- Global `v-snackbar` in `App.vue` driven by a `useNotification` composable for success/error messages
- `src/components/common/EmptyState.vue` shown when filtered list is empty
- Responsive layout: cards use `v-col` with appropriate breakpoints
- Remove or guard seed data so it isn't present in production builds

**Demo:** Full walkthrough — create, edit, done, archive, delete, search, filter, sort all working with toast feedback.
