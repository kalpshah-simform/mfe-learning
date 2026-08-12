import "./index.module.css";
import "destyle.css";
import { createRoot, type Root } from "react-dom/client";
import { createMemoryRouter } from "react-router-dom";
import DashboardApp from "./dashboard-app";
import { dashboardRoutes } from "./router/routes";
import type { store as SharedStoreType } from "shared/store";

interface RemoteMountProps {
  container: HTMLElement;
  basePath: string;
  initialPath: string;
  onNavigate: (relativePath: string) => void;
  isSignedIn: boolean;
  store: typeof SharedStoreType;
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

const PRELOAD_RELOAD_COUNT_KEY = "mfe-dashboard:preload-reload-count";
const MAX_PRELOAD_RELOADS = 3;

function showUpdateOverlay() {
  const overlay = document.createElement("div");
  overlay.textContent = "Updating to the latest version…";
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;" +
    "justify-content:center;background:rgba(15,15,20,0.92);color:#fff;" +
    "font:500 16px system-ui,sans-serif;";
  document.body.appendChild(overlay);
}

export function bootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
  // A tab open since before a rebuild still holds route-lazy imports pointing
  // at chunk hashes that no longer exist on disk once the new build
  // overwrote dist/. Vite fires this event when such a fetch 404s. Reloading
  // picks up the current build instead of leaving the tab stuck on stale
  // in-memory code; the counter caps retries so a genuinely broken deploy
  // doesn't reload forever, and the overlay makes the reload legible instead
  // of a silent, unexplained refresh.
  window.addEventListener("vite:preloadError", () => {
    const count = Number(
      sessionStorage.getItem(PRELOAD_RELOAD_COUNT_KEY) ?? "0",
    );
    if (count >= MAX_PRELOAD_RELOADS) return;
    sessionStorage.setItem(PRELOAD_RELOAD_COUNT_KEY, String(count + 1));
    showUpdateOverlay();
    window.location.reload();
  });
}

export function mount(props: RemoteMountProps) {
  const { container, initialPath, onNavigate, store } = props;

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
  root.render(<DashboardApp router={router} store={store} />);
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
