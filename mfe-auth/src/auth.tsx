import { createRoot, type Root } from "react-dom/client";
import { createMemoryRouter } from "react-router-dom";
import AuthApp from "./auth-app";
import type { AuthChangePayload } from "./auth-change-context";
import { authRoutes } from "./router/routes";
import "./index.css";
import "bootstrap/dist/css/bootstrap.css";

interface RemoteMountProps {
  container: HTMLElement;
  basePath: string;
  initialPath: string;
  onNavigate: (relativePath: string) => void;
  onAuthChange: (payload: AuthChangePayload) => void;
  isSignedIn: boolean;
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
  const { container, initialPath, onNavigate, onAuthChange } = props;

  lastKnownPath = initialPath;
  router = createMemoryRouter(authRoutes, { initialEntries: [initialPath] });
  router.subscribe((state) => {
    const path = state.location.pathname;
    if (path === lastKnownPath) return;
    lastKnownPath = path;
    onNavigate(path);
  });

  root = createRoot(container);
  root.render(<AuthApp router={router} onAuthChange={onAuthChange} />);
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
