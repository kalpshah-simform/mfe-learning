import "./standalone-shell.css";
import { bootstrap, mount, onParentNavigate } from "./marketing";

bootstrap();
mount({
  container: document.getElementById("root")!,
  basePath: "",
  initialPath: window.location.pathname || "/",
  onNavigate: (path) => window.history.pushState(null, "", path),
  isSignedIn: false,
});

window.addEventListener("popstate", () => {
  onParentNavigate(window.location.pathname || "/");
});
