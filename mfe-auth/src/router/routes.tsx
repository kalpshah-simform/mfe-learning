import type { RouteObject } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AuthLandingPage from "../pages/AuthLandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import NotFoundPage from "../pages/NotFoundPage";

export const authRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <AuthLandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password/:token", element: <ResetPasswordPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
