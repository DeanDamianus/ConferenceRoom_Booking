import { createRouter, createWebHistory } from "vue-router";
import App2 from "../App2.vue";
import Home from "../App.vue"; // halaman Home

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/app2", name: "App2", component: App2 },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
