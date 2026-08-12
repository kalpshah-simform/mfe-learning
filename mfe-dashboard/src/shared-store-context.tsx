import { createContext, useContext } from "react";
import type { store as SharedStoreType } from "shared/store";

export const SharedStoreContext = createContext<typeof SharedStoreType | null>(
  null,
);

export function useSharedStore() {
  return useContext(SharedStoreContext);
}
