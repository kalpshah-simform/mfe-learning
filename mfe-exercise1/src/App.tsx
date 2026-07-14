import { useEffect, useRef } from "react";
import styles from "./App.module.css";

const loadAuth = () => import("mfe-auth/Auth").then((m) => m.default);
const loadDashboard = () =>
  import("mfe-dashboard/Dashboard").then((m) => m.default);

function useMountedRemote(
  load: () => Promise<RemoteModule>,
  basePath: string,
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let module: RemoteModule | null = null;

    load().then((mod) => {
      if (cancelled || !containerRef.current) return;
      mod.bootstrap();
      mod.mount({
        container: containerRef.current,
        basePath,
        initialPath: "/",
        onNavigate: () => {},
      });
      module = mod;
    });

    return () => {
      cancelled = true;
      queueMicrotask(() => module?.unmount());
    };
  }, [load, basePath]);

  return containerRef;
}

function App() {
  const authRef = useMountedRemote(loadAuth, "/auth");
  const dashboardRef = useMountedRemote(loadDashboard, "/dashboard");

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1>Exercise 1 — Cross-Remote Events</h1>
        <p>Auth and Dashboard are both mounted on this screen at the same time.</p>
      </header>
      <main className={styles.main}>
        <section className={styles.pane}>
          <h2>Auth</h2>
          <div ref={authRef} />
        </section>
        <section className={styles.pane}>
          <h2>Dashboard</h2>
          <div ref={dashboardRef} />
        </section>
      </main>
    </div>
  );
}

export default App;
