interface RemoteMountProps {
  container: HTMLElement;
  basePath: string;
  initialPath: string;
  onNavigate: (relativePath: string) => void;
}

interface RemoteModule {
  bootstrap: () => void;
  mount: (props: RemoteMountProps) => void;
  unmount: () => void;
  onParentNavigate: (relativePath: string) => void;
}

declare module "mfe-auth/Auth" {
  const remote: RemoteModule;
  export default remote;
}

declare module "mfe-dashboard/Dashboard" {
  const remote: RemoteModule;
  export default remote;
}
