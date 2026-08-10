<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref } from "vue";
import {
  SESSION_CHECK_INTERVAL_MS,
  SESSION_TTL_MS,
  SessionKey,
  clearSession,
  readSession,
  writeSession,
  type Session,
} from "./session";
import styles from "./App.module.css";

const session = ref<Session | null>(readSession());
const isSignedIn = computed(() => session.value !== null);

function signIn(userId: string) {
  const newSession: Session = {
    token: `token-${Date.now()}`,
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  writeSession(newSession);
  session.value = newSession;
}

function signOut() {
  clearSession();
  session.value = null;
}

provide(SessionKey, { isSignedIn, signIn, signOut });

// Polls for token expiry while the tab is open — RemoteOutlet's mount
// watcher only re-checks isSignedIn on route/state changes, so without this
// an expired session on an already-mounted protected route would go
// unnoticed until the next navigation.
let interval: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  interval = setInterval(() => {
    if (session.value && session.value.expiresAt <= Date.now()) {
      clearSession();
      session.value = null;
    }
  }, SESSION_CHECK_INTERVAL_MS);
});
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <div :class="styles.shell">
    <header :class="styles.header">
      <RouterLink to="/">
        <h1>Container</h1>
      </RouterLink>
      <nav :class="styles.nav">
        <RouterLink v-if="!isSignedIn" to="/auth">Auth</RouterLink>
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/marketing">Marketing</RouterLink>
        <RouterLink v-if="isSignedIn" to="/settings">Settings</RouterLink>
        <button v-if="isSignedIn" type="button" @click="signOut">
          Log Out
        </button>
      </nav>
    </header>
    <main :class="styles.main">
      <RouterView />
    </main>
  </div>
</template>
