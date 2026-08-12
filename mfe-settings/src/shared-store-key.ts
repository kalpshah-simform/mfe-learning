import type { InjectionKey } from "vue";
import type { store as SharedStoreType } from "shared/store";

export const sharedStoreKey: InjectionKey<typeof SharedStoreType> =
  Symbol("sharedStore");
