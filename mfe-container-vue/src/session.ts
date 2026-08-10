import { inject, type InjectionKey, type Ref } from "vue";

const SESSION_STORAGE_KEY = "mfe:session";
export const SESSION_TTL_MS = 15 * 60 * 1000;
export const SESSION_CHECK_INTERVAL_MS = 10_000;

export interface Session {
  token: string;
  userId: string;
  expiresAt: number;
}

export function readSession(): Session | null {
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

export function writeSession(session: Session) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export interface SessionContext {
  isSignedIn: Ref<boolean>;
  signIn: (userId: string) => void;
  signOut: () => void;
}

export const SessionKey: InjectionKey<SessionContext> = Symbol("session");

export function useSession(): SessionContext {
  const session = inject(SessionKey);
  if (!session) {
    throw new Error("useSession() called outside of the App provider");
  }
  return session;
}
