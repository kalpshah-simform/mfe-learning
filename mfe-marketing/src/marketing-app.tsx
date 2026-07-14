import { RouterProvider, type createMemoryRouter } from "react-router-dom";

type MemoryRouter = ReturnType<typeof createMemoryRouter>;

export default function MarketingApp({
  router,
}: Readonly<{ router: MemoryRouter }>) {
  return <RouterProvider router={router} />;
}
