import { RouterProvider, type createMemoryRouter } from "react-router-dom";
import { AuthChangeContext, type AuthChangePayload } from "./auth-change-context";

type MemoryRouter = ReturnType<typeof createMemoryRouter>;

export default function AuthApp({
  router,
  onAuthChange,
}: Readonly<{
  router: MemoryRouter;
  onAuthChange: (payload: AuthChangePayload) => void;
}>) {
  return (
    <AuthChangeContext.Provider value={onAuthChange}>
      <RouterProvider router={router} />
    </AuthChangeContext.Provider>
  );
}
