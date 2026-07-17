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
  isSignedIn: boolean;
}

let root: Root | null = null;
let bootstrapped = false;
let router: ReturnType<typeof createMemoryRouter> | null = null;
let lastKnownPath: string | null = null;

// This listener is only ever attached while dashboard is mounted (see mount/unmount
// below). auth fires 'auth:login' once, 500ms after IT loads — a plain DOM
// CustomEvent has no memory, so if dashboard isn't mounted yet at that moment,
// the event is gone forever and this handler never runs, even though the user
// really did log in. Confirmed by: load container -> auth, let the event
// auto-fire, THEN navigate to /dashboard — "auth:login received" never logs.
// This is why durable state (e.g. "is the user logged in") can't be
// represented as a one-shot event; it needs to be propagated as state (a
// shared store, container-held state pushed via props/callbacks, etc.) that a
// late-mounting subscriber can read on mount instead of only reacting to a
// dispatch it may have missed.
function handleAuthLogin(event: Event) {
  console.log("auth:login received", (event as CustomEvent).detail);
}

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

  window.addEventListener("auth:login", handleAuthLogin);

  root = createRoot(container);
  root.render(<DashboardApp router={router} />);
}

export function unmount() {
  window.removeEventListener("auth:login", handleAuthLogin);
  root?.unmount();
  root = null;
  router = null;
}

export function onParentNavigate(relativePath: string) {
  if (!router || relativePath === lastKnownPath) return;
  lastKnownPath = relativePath;
  router.navigate(relativePath, { replace: true });
}
