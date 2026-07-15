import './standalone-shell.css'
import { bootstrap, mount, onParentNavigate } from './auth'

bootstrap();
mount({
  container: document.getElementById('root')!,
  basePath: '',
  initialPath: window.location.pathname || '/',
  onNavigate: (path) => window.history.pushState(null, '', path),
  onAuthChange: (payload) => console.log('onAuthChange', payload),
});

window.addEventListener('popstate', () => {
  onParentNavigate(window.location.pathname || '/');
});
