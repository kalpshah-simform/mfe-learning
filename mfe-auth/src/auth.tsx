import { createRoot, type Root } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AuthApp from "./auth-app";
import "./index.css";
import "bootstrap/dist/css/bootstrap.css";

let root: Root | null = null;
let bootstrapped = false;

export function bootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
}

export function mount(props: { container: HTMLElement; basename?: string }) {
  const { container, basename = "/" } = props;
  root = createRoot(container);
  root.render(
    <BrowserRouter basename={basename}>
      <AuthApp />
    </BrowserRouter>,
  );
}

export function unmount() {
  root?.unmount();
  root = null;
}
