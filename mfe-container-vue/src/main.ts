import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";

const PRELOAD_RELOAD_COUNT_KEY = "mfe-container-vue:preload-reload-count";
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

// A tab open since before a rebuild still holds the container's own
// route-gated remote imports (RemoteOutlet.vue's import("mfe-marketing/Marketing")
// etc.) pointing at virtual loadRemote chunk hashes that no longer exist on
// disk once a new container build overwrote dist/. Vite fires this event
// when such a fetch 404s. Reloading picks up the current build instead of
// leaving the tab stuck on stale in-memory code; the counter caps retries so
// a genuinely broken deploy doesn't reload forever, and the overlay makes the
// reload legible instead of a silent, unexplained refresh.
window.addEventListener("vite:preloadError", () => {
  const count = Number(sessionStorage.getItem(PRELOAD_RELOAD_COUNT_KEY) ?? "0");
  if (count >= MAX_PRELOAD_RELOADS) return;
  sessionStorage.setItem(PRELOAD_RELOAD_COUNT_KEY, String(count + 1));
  showUpdateOverlay();
  window.location.reload();
});

createApp(App).use(router).mount("#app");
