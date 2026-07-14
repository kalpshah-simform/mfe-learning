import { createRoot, type Root } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import MarketingApp from "./marketing-app";

let root: Root | null = null;
let bootstrapped = false;

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

export function mount(props: { container: HTMLElement; basename?: string }) {
  const { container, basename = "/" } = props;
  root = createRoot(container);
  root.render(
    <CacheProvider value={emotionCache}>
      <BrowserRouter basename={basename}>
        <MarketingApp />
      </BrowserRouter>
    </CacheProvider>,
  );
}

export function unmount() {
  root?.unmount();
  root = null;
}
