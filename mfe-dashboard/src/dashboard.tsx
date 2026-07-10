import { createRoot, type Root } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import DashboardApp from "./dashboard-app";
import "./index.module.css";
import "destyle.css";

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
      <DashboardApp />
    </BrowserRouter>,
  );
}

export function unmount() {
  root?.unmount();
  root = null;
}
