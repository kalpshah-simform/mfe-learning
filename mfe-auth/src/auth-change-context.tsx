import { createContext, useContext } from "react";

export interface AuthChangePayload {
  isAuthenticated: boolean;
  userId: string;
}

export const AuthChangeContext = createContext<
  ((payload: AuthChangePayload) => void) | null
>(null);

export function useAuthChange() {
  return useContext(AuthChangeContext);
}
