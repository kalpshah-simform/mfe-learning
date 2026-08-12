declare module "shared/store" {
  export const store: {
    __id: number;
    getState(key: string): unknown;
    setState(key: string, value: unknown): void;
    subscribe(key: string, handler: (value: unknown) => void): () => void;
  };
}
