import "./index.css";
import { bootstrap, mount } from "./marketing-bootstrap";

bootstrap();
mount({ container: document.getElementById("root")!, basename: "/" });
