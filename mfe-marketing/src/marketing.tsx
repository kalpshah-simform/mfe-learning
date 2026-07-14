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

export function bootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
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
