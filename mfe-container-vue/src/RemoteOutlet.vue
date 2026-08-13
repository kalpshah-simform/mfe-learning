<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSession } from "./session";
import styles from "./App.module.css";

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
  settings: {
    prefix: "/settings",
    load: () => import("mfe-settings/Settings").then((m) => m.default),
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

// Loaded once, here at the top level, rather than by each remote itself: a
// remote that's also its own host for this same "shared" module hits a
// Module Federation race when nested inside this container (its dynamic
// import of "shared/store" intermittently rejects, which trips the
// preload-error auto-reload safety net into a reload loop). Loading it only
// from the outermost host — which is never itself loaded as someone else's
// remote — avoids that nested-host case entirely, and each remote just
// receives the already-resolved store as a mount() prop.
const sharedStorePromise: Promise<SharedStore> = import("shared/store").then(
  (m) => m.store,
);

const route = useRoute();
const router = useRouter();
const { isSignedIn, signIn, signOut } = useSession();

const containerRef = ref<HTMLDivElement | null>(null);
const bootstrapped = new Set<string>();
let mountedModule: RemoteModule | null = null;
let lastRemoteReportedPath: string | null = null;
const isLoading = ref(false);

const activeKey = computed(() => matchRemote(route.path));

// Mirrors mfe-container's RemoteOutlet mount effect: guards protected
// routes, loads + bootstraps + mounts the matched remote, and re-runs only
// when the active remote or sign-in state changes. This must be a `watch`
// with explicit sources rather than `watchEffect` — `watchEffect` would
// auto-track route.path (read below for initialPath/redirects) as a
// dependency too, so it would tear down and remount the remote on every
// in-remote navigation (e.g. Settings' own router reporting a path change
// back up via onNavigate), not just on real activeKey/isSignedIn changes.
//
// The container-ref/route-dependent work is deferred one tick via
// nextTick(): for a `watch(..., { immediate: true })`, Vue invokes the
// immediate first call synchronously during this component's setup(),
// before the template's `<div ref="containerRef">` has been patched into
// the DOM — so on a direct navigation/refresh into a remote route,
// containerRef.value would still be null right here. flush: "post" does
// NOT help with this, since it only affects later re-runs triggered by a
// dependency change, not the immediate invocation. nextTick does, since it
// always waits for the pending DOM patch regardless of why the callback ran.
watch(
  () => [activeKey.value, isSignedIn.value] as const,
  ([key, signedIn], _prev, onCleanup) => {
    let cancelled = false;
    onCleanup(() => {
      cancelled = true;
      isLoading.value = false;
      const moduleToUnmount = mountedModule;
      mountedModule = null;
      lastRemoteReportedPath = null;
      moduleToUnmount?.unmount();
    });

    nextTick(() => {
      if (cancelled || !key || !containerRef.value) return;

      if ((key === "dashboard" || key === "settings") && !signedIn) {
        router.replace(`/auth/login?redirect=${encodeURIComponent(route.path)}`);
        return;
      }

      if (key === "auth" && signedIn) {
        router.replace("/dashboard");
        return;
      }

      const remote = remotes[key];
      const initialPath = relativePathFor(remote.prefix, route.path);

      isLoading.value = true;
      Promise.all([remote.load(), sharedStorePromise]).then(
        ([module, store]) => {
          if (cancelled || !containerRef.value) return;
          if (!bootstrapped.has(key)) {
            module.bootstrap();
            bootstrapped.add(key);
          }
          module.mount({
            container: containerRef.value,
            basePath: remote.prefix,
            initialPath,
            onNavigate: (relativePath) => {
              const fullPath =
                relativePath === "/"
                  ? remote.prefix
                  : `${remote.prefix}${relativePath}`;
              lastRemoteReportedPath = fullPath;
              router.replace(fullPath);
            },
            onAuthChange: (payload) => {
              if (payload.isAuthenticated) {
                signIn(payload.userId);
                const redirect = route.query.redirect;
                router.replace(
                  typeof redirect === "string" ? redirect : "/dashboard",
                );
              } else {
                signOut();
              }
            },
            isSignedIn: signedIn,
            store,
          });
          mountedModule = module;
          isLoading.value = false;
        },
      );
    });
  },
  { immediate: true },
);

// Handles browser back/forward (and any other pathname change not caused
// by the remote itself): forwards the new path down to the mounted remote.
// The lastRemoteReportedPath guard prevents ping-ponging the navigation
// straight back out via onNavigate.
watch(
  () => route.path,
  (pathname) => {
    const key = activeKey.value;
    if (!key) return;
    if (pathname === lastRemoteReportedPath) return;

    const remote = remotes[key];
    const relativePath = relativePathFor(remote.prefix, pathname);
    mountedModule?.onParentNavigate(relativePath);
  },
);

// The watchEffect above only re-runs when activeKey/isSignedIn change, so
// it misses in-remote navigation (e.g. clicking a Signup link inside the
// already-mounted auth remote goes /auth/login -> /auth/signup without
// activeKey changing). This watcher re-checks on every pathname change to
// catch that case too.
watch(
  () => route.path,
  () => {
    if (isSignedIn.value && activeKey.value === "auth") {
      router.replace("/dashboard");
    }
  },
);
</script>

<template>
  <p v-if="!activeKey">Select a section above.</p>
  <template v-else>
    <output v-if="isLoading" :class="styles.spinner">
      <span :class="styles.visuallyHidden">Loading…</span>
    </output>
    <div ref="containerRef" v-show="!isLoading" data-testid="remote-mount" />
  </template>
</template>
