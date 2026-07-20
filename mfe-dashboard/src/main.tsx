import './standalone-shell.css'
import { bootstrap, mount, onParentNavigate } from './dashboard'

bootstrap();
mount({
  container: document.getElementById('root')!,
  basePath: '',
  initialPath: window.location.pathname || '/',
  onNavigate: (path) => window.history.pushState(null, '', path),
  isSignedIn: true,
});

window.addEventListener('popstate', () => {
  onParentNavigate(window.location.pathname || '/');
});
