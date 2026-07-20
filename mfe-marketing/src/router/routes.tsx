import type { RouteObject } from "react-router-dom";
import MarketingLayout from "../layouts/MarketingLayout";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";

export const marketingRoutes: RouteObject[] = [
  {
    path: "/",
    element: <MarketingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "pricing",
        lazy: () =>
          import("../pages/PricingPage").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "about",
        lazy: () =>
          import("../pages/AboutPage").then((m) => ({ Component: m.default })),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
