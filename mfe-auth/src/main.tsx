import './index.css'
import { bootstrap, mount } from './auth'

bootstrap();
mount({ container: document.getElementById('root')!, basename: '/' });
