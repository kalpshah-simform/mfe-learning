import { RouterProvider, type createMemoryRouter } from "react-router-dom";
import { SharedStoreContext } from "./shared-store-context";
import type { store as SharedStoreType } from "shared/store";

type MemoryRouter = ReturnType<typeof createMemoryRouter>;

export default function DashboardApp({
  router,
  store,
}: Readonly<{ router: MemoryRouter; store: typeof SharedStoreType }>) {
  return (
    <SharedStoreContext.Provider value={store}>
      <RouterProvider router={router} />
    </SharedStoreContext.Provider>
  );
}
