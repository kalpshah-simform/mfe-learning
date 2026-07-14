import type { RouteObject } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import OverviewPage from "../pages/OverviewPage";
import ReportsListPage from "../pages/ReportsListPage";
import ReportDetailPage from "../pages/ReportDetailPage";
import SettingsPage from "../pages/SettingsPage";
import ProfileSettingsPage from "../pages/ProfileSettingsPage";
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
          { index: true, element: <ReportsListPage /> },
          { path: ":id", element: <ReportDetailPage /> },
        ],
      },
      {
        path: "settings",
        children: [
          { index: true, element: <SettingsPage /> },
          { path: "profile", element: <ProfileSettingsPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
