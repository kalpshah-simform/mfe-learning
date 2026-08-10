import { createRouter, createWebHistory } from "vue-router";
import RemoteOutlet from "../RemoteOutlet.vue";

// A single catch-all route: remote matching/routing is done in JS (see
// RemoteOutlet.vue's matchRemote), the same way mfe-container's App.tsx
// reads react-router's useLocation() directly instead of declaring a
// <Route> per remote.
export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/:pathMatch(.*)*", component: RemoteOutlet }],
});
