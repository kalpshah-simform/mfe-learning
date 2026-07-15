// Minimal shared singleton for verifying that Module Federation's "shared"
// config actually dedupes this module across remotes instead of bundling a
// separate copy into each one. __id is the identity check: if every app logs
// the same __id, they're all running the same loaded instance.
const state = new Map();
const listeners = new Map();

export const store = {
  __id: Math.random(),

  getState(key) {
    return state.get(key);
  },

  setState(key, value) {
    state.set(key, value);
    for (const handler of listeners.get(key) ?? []) {
      handler(value);
    }
  },

  subscribe(key, handler) {
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    listeners.get(key).add(handler);
    return () => listeners.get(key)?.delete(handler);
  },
};
