import type { RouteObject } from "react-router-dom";
import MarketingLayout from "../layouts/MarketingLayout";
import HomePage from "../pages/HomePage";
import PricingPage from "../pages/PricingPage";
import AboutPage from "../pages/AboutPage";
import NotFoundPage from "../pages/NotFoundPage";

export const marketingRoutes: RouteObject[] = [
  {
    path: "/",
    element: <MarketingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "pricing", element: <PricingPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
