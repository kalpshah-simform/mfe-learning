import { useEffect, useRef } from "react";
import { BrowserRouter, Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./App.module.css";

interface RemoteModule {
  bootstrap: () => void;
  mount: (props: {
    container: HTMLElement;
    basePath: string;
    initialPath: string;
    onNavigate: (relativePath: string) => void;
    onAuthChange: (payload: { isAuthenticated: boolean; userId: string }) => void;
  }) => void;
  unmount: () => void;
  onParentNavigate: (relativePath: string) => void;
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

function relativePathFor(prefix: string, pathname: string) {
  return pathname.slice(prefix.length) || "/";
}

function RemoteOutlet() {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const bootstrappedRef = useRef(new Set<string>());
  const mountedModuleRef = useRef<RemoteModule | null>(null);
  const lastRemoteReportedPathRef = useRef<string | null>(null);
  const activeKey = matchRemote(location.pathname);

  useEffect(() => {
    if (!activeKey || !containerRef.current) return;

    let cancelled = false;
    const remote = remotes[activeKey];
    const initialPath = relativePathFor(remote.prefix, location.pathname);

    remote.load().then((module) => {
      if (cancelled || !containerRef.current) return;
      if (!bootstrappedRef.current.has(activeKey)) {
        module.bootstrap();
        bootstrappedRef.current.add(activeKey);
      }
      module.mount({
        container: containerRef.current,
        basePath: remote.prefix,
        initialPath,
        onNavigate: (relativePath) => {
          const fullPath =
            relativePath === "/" ? remote.prefix : `${remote.prefix}${relativePath}`;
          lastRemoteReportedPathRef.current = fullPath;
          navigate(fullPath, { replace: true });
        },
        onAuthChange: (payload) => {
          console.log("onAuthChange", payload);
        },
      });
      mountedModuleRef.current = module;
    });

    return () => {
      cancelled = true;
      const moduleToUnmount = mountedModuleRef.current;
      mountedModuleRef.current = null;
      lastRemoteReportedPathRef.current = null;
      // Defer: the remote's root shares React's scheduler with the host (singleton
      // React), so unmounting it synchronously here can race the host's own
      // in-flight render/commit and trigger "unmount while rendering" warnings.
      queueMicrotask(() => moduleToUnmount?.unmount());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  // Handles browser back/forward (and any other pathname change not caused by
  // the remote itself): forwards the new path down to the mounted remote.
  // The lastRemoteReportedPathRef guard prevents ping-ponging the navigation
  // straight back out via onNavigate.
  useEffect(() => {
    if (!activeKey) return;
    if (location.pathname === lastRemoteReportedPathRef.current) return;

    const remote = remotes[activeKey];
    const relativePath = relativePathFor(remote.prefix, location.pathname);
    mountedModuleRef.current?.onParentNavigate(relativePath);
  }, [activeKey, location.pathname]);

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
            <h1>Exercise 3 — Late Subscriber Bug</h1>
          </Link>
          <nav className={styles.nav}>
            <Link to="/auth">Auth</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/marketing">Marketing</Link>
          </nav>
        </header>
        <main className={styles.main}>
          <p className={styles.hint}>
            Repro: open /auth, wait for the auto-fired auth:login event, then
            navigate to /dashboard. Dashboard mounts after the event already
            fired, so its listener never sees it — check the console.
          </p>
          <RemoteOutlet />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
