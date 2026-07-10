import './standalone-shell.css'
import { bootstrap, mount } from './dashboard'

bootstrap();
mount({ container: document.getElementById('root')!, basename: '/' });
