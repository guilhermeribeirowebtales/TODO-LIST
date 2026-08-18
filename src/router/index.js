import { createRouter, createWebHistory } from "vue-router";
import App from "../App.vue"; // You can replace this with a dedicated Home/Dashboard view later

const routes = [
  {
    path: "/",
    name: "home",
    component: App,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
