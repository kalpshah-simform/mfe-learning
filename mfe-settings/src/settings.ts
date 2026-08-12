import { createApp, type App } from "vue";
import { createRouter, createMemoryHistory, type Router } from "vue-router";
import SettingsApp from "./settings-app.vue";
import { settingsRoutes } from "./router/routes";
import type { store as SharedStoreType } from "shared/store";

interface RemoteMountProps {
  container: HTMLElement;
  basePath: string;
  initialPath: string;
  onNavigate: (relativePath: string) => void;
  isSignedIn: boolean;
  store: typeof SharedStoreType;
}

let app: App | null = null;
let bootstrapped = false;
let router: Router | null = null;
let lastKnownPath: string | null = null;

const PRELOAD_RELOAD_COUNT_KEY = "mfe-settings:preload-reload-count";
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
  router = createRouter({
    history: createMemoryHistory(),
    routes: settingsRoutes,
  });

  router.afterEach((to) => {
    const path = to.fullPath;
    if (path === lastKnownPath) return;
    lastKnownPath = path;
    onNavigate(path);
  });

  app = createApp(SettingsApp, { store });
  app.use(router);

  router.replace(initialPath);
  router.isReady().then(() => {
    app?.mount(container);
  });
}

export function unmount() {
  app?.unmount();
  app = null;
  router = null;
}

export function onParentNavigate(relativePath: string) {
  if (!router || relativePath === lastKnownPath) return;
  lastKnownPath = relativePath;
  router.replace(relativePath);
}
