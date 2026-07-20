import type { RouteObject } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import OverviewPage from "../pages/OverviewPage";
import NotFoundPage from "../pages/NotFoundPage";

export const dashboardRoutes: RouteObject[] = [
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      {
        path: "reports",
        children: [
          {
            index: true,
            lazy: () =>
              import("../pages/ReportsListPage").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: ":id",
            lazy: () =>
              import("../pages/ReportDetailPage").then((m) => ({
                Component: m.default,
              })),
          },
        ],
      },
      {
        path: "settings",
        children: [
          {
            index: true,
            lazy: () =>
              import("../pages/SettingsPage").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "profile",
            lazy: () =>
              import("../pages/ProfileSettingsPage").then((m) => ({
                Component: m.default,
              })),
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
