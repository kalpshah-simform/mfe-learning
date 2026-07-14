import "./standalone-shell.css";
import { bootstrap, mount } from "./marketing";

bootstrap();
mount({ container: document.getElementById("root")!, basename: "/" });
