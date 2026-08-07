import { createRoot, type Root } from "react-dom/client";
import { createMemoryRouter } from "react-router-dom";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import MarketingApp from "./marketing-app";
import { marketingRoutes } from "./router/routes";

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

// Emotion's default cache is a module-level singleton. If this remote and
// the host (or another remote) each end up with their own copy of
// @emotion/react on the page, two singleton caches can insert into the
// same <head> with colliding class-name prefixes. A namespaced cache scopes
// every class/style-tag this remote generates to "mfe-marketing-*", so its
// output can't collide with another remote's or the container's.
const emotionCache = createCache({ key: "mfe-marketing" });

const PRELOAD_RELOAD_COUNT_KEY = "mfe-marketing:preload-reload-count";
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
  // A tab open since before a rebuild still holds route-lazy imports (e.g.
  // PricingPage) pointing at chunk hashes that no longer exist on disk once
  // the new build overwrote dist/. Vite fires this event when such a fetch
  // 404s. Reloading picks up the current build instead of leaving the tab
  // stuck on stale in-memory code; the counter caps retries so a genuinely
  // broken deploy doesn't reload forever, and the overlay makes the reload
  // legible instead of a silent, unexplained refresh.
  window.addEventListener("vite:preloadError", () => {
    const count = Number(sessionStorage.getItem(PRELOAD_RELOAD_COUNT_KEY) ?? "0");
    if (count >= MAX_PRELOAD_RELOADS) return;
    sessionStorage.setItem(PRELOAD_RELOAD_COUNT_KEY, String(count + 1));
    showUpdateOverlay();
    window.location.reload();
  });
}

export function mount(props: RemoteMountProps) {
  const { container, initialPath, onNavigate } = props;

  lastKnownPath = initialPath;
  router = createMemoryRouter(marketingRoutes, {
    initialEntries: [initialPath],
  });
  router.subscribe((state) => {
    const path = state.location.pathname;
    if (path === lastKnownPath) return;
    lastKnownPath = path;
    onNavigate(path);
  });

  root = createRoot(container);
  root.render(
    <CacheProvider value={emotionCache}>
      <MarketingApp router={router} />
    </CacheProvider>,
  );
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
