import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: "/task/new",
    name: "task-new",
    component: () => import("../views/NewTaskView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/task/:id/edit",
    name: "task-edit",
    component: () => import("../views/EditTaskView.vue"), //This notation is called lazy import
    meta: { requiresAuth: true },
  },
  {
    path: "/auth/login",
    name: "login",
    component: () => import("../components/forms/LoginForm.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  // Use to.name instead of hardcoded paths
  if (to.meta.requiresAuth && !token) {
    next({ name: "login" }); // Sends them to /auth/login securely
  } else if (to.name === "login" && token) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;

//This page is where we define routes more specifically the url paths
//followed by the name which is what we'll use to reference this route in our code, like in a push
// and last the component which is essencially the View we created and the one we want the user to see.
//Here we also define the createWebHistory which cleans URL's removing #, increases SEO

//You can see that for the HomeView we import the component on top, but for the NewTaskView and for EditTaskView we use Lazy import
//This makes the Home View load eagerly, but NewTaskView and EditTaskView are only downloaded when first visited, saving the user RAM while browsing the website
//This doesn't make a lot of difference but it's a good practice to keep for larger projects where there will be a lot of views.
