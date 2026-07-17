interface RemoteMountProps {
  container: HTMLElement;
  basePath: string;
  initialPath: string;
  onNavigate: (relativePath: string) => void;
  onAuthChange: (payload: { isAuthenticated: boolean; userId: string }) => void;
  isSignedIn: boolean;
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

declare module "mfe-marketing/Marketing" {
  const remote: RemoteModule;
  export default remote;
}
