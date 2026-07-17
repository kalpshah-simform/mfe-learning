import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="mfe-auth-scope">
      <nav>
        <Link to="/">Back to Auth home</Link>
      </nav>
      <Outlet />
    </div>
  );
}
