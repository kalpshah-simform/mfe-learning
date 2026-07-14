import { createRoot, type Root } from "react-dom/client";
import { createMemoryRouter } from "react-router-dom";
import DashboardApp from "./dashboard-app";
import { dashboardRoutes } from "./router/routes";
import "./index.module.css";
import "destyle.css";

interface RemoteMountProps {
  container: HTMLElement;
  basePath: string;
  initialPath: string;
  onNavigate: (relativePath: string) => void;
}

let root: Root | null = null;
let bootstrapped = false;
let router: ReturnType<typeof createMemoryRouter> | null = null;
let lastKnownPath: string | null = null;

export function bootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
}

export function mount(props: RemoteMountProps) {
  const { container, initialPath, onNavigate } = props;

  lastKnownPath = initialPath;
  router = createMemoryRouter(dashboardRoutes, {
    initialEntries: [initialPath],
  });
  router.subscribe((state) => {
    const path = state.location.pathname;
    if (path === lastKnownPath) return;
    lastKnownPath = path;
    onNavigate(path);
  });

  root = createRoot(container);
  root.render(<DashboardApp router={router} />);
}

export function unmount() {
  root?.unmount();
  root = null;
  router = null;
}

export function onParentNavigate(relativePath: string) {
  if (!router || relativePath === lastKnownPath) return;
  lastKnownPath = relativePath;
  router.navigate(relativePath, { replace: true });
}
