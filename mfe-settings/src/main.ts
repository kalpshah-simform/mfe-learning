import "./standalone-shell.css";
import { bootstrap, mount, onParentNavigate } from "./settings";
import { store } from "shared/store";

bootstrap();
mount({
  container: document.getElementById("root")!,
  basePath: "",
  initialPath: window.location.pathname || "/",
  onNavigate: (path) => window.history.pushState(null, "", path),
  isSignedIn: false,
  store,
});

window.addEventListener("popstate", () => {
  onParentNavigate(window.location.pathname || "/");
});
