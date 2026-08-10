import type { RouteRecordRaw } from "vue-router";

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("../layouts/SettingsLayout.vue"),
    children: [
      { path: "", component: () => import("../pages/OverviewPage.vue") },
      {
        path: "preferences",
        component: () => import("../pages/PreferencesPage.vue"),
      },
      {
        path: "/:pathMatch(.*)*",
        component: () => import("../pages/NotFoundPage.vue"),
      },
    ],
  },
];
