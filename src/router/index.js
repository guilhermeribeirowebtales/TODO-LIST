import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/task/new",
    name: "task-new",
    component: () => import("../views/NewTaskView.vue"),
  },
  {
    path: "/task/:id/edit",
    name: "task-edit",
    component: () => import("../views/EditTaskView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
