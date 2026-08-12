import { RouterProvider, type createMemoryRouter } from "react-router-dom";
import {
  AuthChangeContext,
  type AuthChangePayload,
} from "./auth-change-context";
import { SharedStoreContext } from "./shared-store-context";
import type { store as SharedStoreType } from "shared/store";

type MemoryRouter = ReturnType<typeof createMemoryRouter>;

export default function AuthApp({
  router,
  onAuthChange,
  store,
}: Readonly<{
  router: MemoryRouter;
  onAuthChange: (payload: AuthChangePayload) => void;
  store: typeof SharedStoreType;
}>) {
  return (
    <SharedStoreContext.Provider value={store}>
      <AuthChangeContext.Provider value={onAuthChange}>
        <RouterProvider router={router} />
      </AuthChangeContext.Provider>
    </SharedStoreContext.Provider>
  );
}
