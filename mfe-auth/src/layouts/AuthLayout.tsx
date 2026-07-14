import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="mfe-auth-scope">
      <nav>
        <Link to="/">Auth home</Link> | <Link to="/login">Log in</Link> |{" "}
        <Link to="/signup">Sign up</Link> |{" "}
        <Link to="/forgot-password">Forgot password</Link>
      </nav>
      <Outlet />
    </div>
  );
}
