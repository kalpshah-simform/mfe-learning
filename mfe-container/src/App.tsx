import { useEffect, useRef } from "react";
import { BrowserRouter, Link, useLocation } from "react-router-dom";
import styles from "./App.module.css";

interface RemoteModule {
  bootstrap: () => void;
  mount: (props: { container: HTMLElement; basename?: string }) => void;
  unmount: () => void;
}

const remotes: Record<
  string,
  { prefix: string; load: () => Promise<RemoteModule> }
> = {
  auth: {
    prefix: "/auth",
    load: () => import("mfe-auth/Auth").then((m) => m.default),
  },
  dashboard: {
    prefix: "/dashboard",
    load: () => import("mfe-dashboard/Dashboard").then((m) => m.default),
  },
  marketing: {
    prefix: "/marketing",
    load: () => import("mfe-marketing/Marketing").then((m) => m.default),
  },
};

function matchRemote(pathname: string) {
  return Object.entries(remotes).find(
    ([, remote]) =>
      pathname === remote.prefix || pathname.startsWith(`${remote.prefix}/`),
  )?.[0];
}

function RemoteOutlet() {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const bootstrappedRef = useRef(new Set<string>());
  const activeKey = matchRemote(location.pathname);

  useEffect(() => {
    if (!activeKey || !containerRef.current) return;

    let cancelled = false;
    let mountedModule: RemoteModule | null = null;
    const remote = remotes[activeKey];

    remote.load().then((module) => {
      if (cancelled || !containerRef.current) return;
      if (!bootstrappedRef.current.has(activeKey)) {
        module.bootstrap();
        bootstrappedRef.current.add(activeKey);
      }
      module.mount({
        container: containerRef.current,
        basename: remote.prefix,
      });
      mountedModule = module;
    });

    return () => {
      cancelled = true;
      // Defer: the remote's root shares React's scheduler with the host (singleton
      // React), so unmounting it synchronously here can race the host's own
      // in-flight render/commit and trigger "unmount while rendering" warnings.
      queueMicrotask(() => mountedModule?.unmount());
    };
  }, [activeKey]);

  if (!activeKey) {
    return <p>Select a section above.</p>;
  }

  return <div ref={containerRef} />;
}

function App() {
  return (
    <BrowserRouter>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link to="/">
            <h1>Container</h1>
          </Link>
          <nav className={styles.nav}>
            <Link to="/auth">Auth</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/marketing">Marketing</Link>
          </nav>
        </header>
        <main className={styles.main}>
          <RemoteOutlet />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
