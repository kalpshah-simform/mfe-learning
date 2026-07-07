interface RemoteMountProps {
  container: HTMLElement;
  basename?: string;
}

interface RemoteModule {
  bootstrap: () => void;
  mount: (props: RemoteMountProps) => void;
  unmount: () => void;
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
