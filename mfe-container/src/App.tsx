import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import styles from "./App.module.css";

const SESSION_STORAGE_KEY = "mfe:session";
const SESSION_TTL_MS = 15 * 60 * 1000;
const SESSION_CHECK_INTERVAL_MS = 10_000;

interface Session {
  token: string;
  userId: string;
  expiresAt: number;
}

function readSession(): Session | null {
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (parsed.expiresAt > Date.now()) return parsed;
  } catch {
    // malformed storage value — treat as no session
  }
  return null;
}

function writeSession(session: Session) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

interface RemoteModule {
  bootstrap: () => void;
  mount: (props: {
    container: HTMLElement;
    basePath: string;
    initialPath: string;
    onNavigate: (relativePath: string) => void;
    onAuthChange: (payload: {
      isAuthenticated: boolean;
      userId: string;
    }) => void;
    isSignedIn: boolean;
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

function RemoteOutlet({
  isSignedIn,
  signIn,
  signOut,
}: Readonly<{
  isSignedIn: boolean;
  signIn: (userId: string) => void;
  signOut: () => void;
}>) {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const bootstrappedRef = useRef(new Set<string>());
  const mountedModuleRef = useRef<RemoteModule | null>(null);
  const lastRemoteReportedPathRef = useRef<string | null>(null);
  const locationRef = useRef(location);
  const activeKey = matchRemote(location.pathname);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    if (!activeKey || !containerRef.current) return;

    if (activeKey === "dashboard" && !isSignedIn) {
      navigate(
        `/auth/login?redirect=${encodeURIComponent(location.pathname)}`,
        { replace: true },
      );
      return;
    }

    if (activeKey === "auth" && isSignedIn) {
      navigate("/dashboard", { replace: true });
      return;
    }

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
            relativePath === "/"
              ? remote.prefix
              : `${remote.prefix}${relativePath}`;
          lastRemoteReportedPathRef.current = fullPath;
          navigate(fullPath, { replace: true });
        },
        onAuthChange: (payload) => {
          if (payload.isAuthenticated) {
            signIn(payload.userId);
            const redirect = new URLSearchParams(
              locationRef.current.search,
            ).get("redirect");
            navigate(redirect || "/dashboard", { replace: true });
          } else {
            signOut();
          }
        },
        isSignedIn,
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
  }, [activeKey, isSignedIn]);

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

  // The mount effect above only re-runs when activeKey/isSignedIn change, so it
  // misses in-remote navigation (e.g. clicking a Signup link inside the
  // already-mounted auth remote goes /auth/login -> /auth/signup without
  // activeKey changing). This effect re-checks on every pathname change to
  // catch that case too.
  useEffect(() => {
    if (isSignedIn && activeKey === "auth") {
      navigate("/dashboard", { replace: true });
    }
  }, [activeKey, location.pathname, isSignedIn, navigate]);

  if (!activeKey) {
    return <p>Select a section above.</p>;
  }

  return <div ref={containerRef} />;
}

function App() {
  const [session, setSession] = useState<Session | null>(() => readSession());
  const isSignedIn = session !== null;

  const signIn = (userId: string) => {
    const newSession: Session = {
      token: `token-${Date.now()}`,
      userId,
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    writeSession(newSession);
    setSession(newSession);
  };

  const signOut = () => {
    clearSession();
    setSession(null);
  };

  // Polls for token expiry while the tab is open — the guard effect in
  // RemoteOutlet only re-checks isSignedIn on route/state changes, so without
  // this an expired session on an already-mounted protected route would go
  // unnoticed until the next navigation.
  useEffect(() => {
    const interval = setInterval(() => {
      setSession((current) => {
        if (current && current.expiresAt <= Date.now()) {
          clearSession();
          return null;
        }
        return current;
      });
    }, SESSION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link to="/">
            <h1>Container</h1>
          </Link>
          <nav className={styles.nav}>
            {!isSignedIn && <Link to="/auth">Auth</Link>}
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/marketing">Marketing</Link>
            {isSignedIn && (
              <button type="button" onClick={signOut}>
                Log Out
              </button>
            )}
          </nav>
        </header>
        <main className={styles.main}>
          <RemoteOutlet
            isSignedIn={isSignedIn}
            signIn={signIn}
            signOut={signOut}
          />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
