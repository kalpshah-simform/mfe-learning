import './index.css'
import { bootstrap, mount } from './dashboard'

bootstrap();
mount({ container: document.getElementById('root')!, basename: '/' });
