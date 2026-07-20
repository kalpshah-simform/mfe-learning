import type { RouteObject } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AuthLandingPage from "../pages/AuthLandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import NotFoundPage from "../pages/NotFoundPage";

export const authRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <AuthLandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      {
        path: "forgot-password",
        lazy: () =>
          import("../pages/ForgotPasswordPage").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "reset-password/:token",
        lazy: () =>
          import("../pages/ResetPasswordPage").then((m) => ({
            Component: m.default,
          })),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
