import { Link, Outlet, useNavigation } from "react-router-dom";

export default function AuthLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="mfe-auth-scope">
      <nav>
        <Link to="/">Back to Auth home</Link>
      </nav>
      {isLoading ? (
        <output className="spinner-border">
          <span className="visually-hidden">Loading…</span>
        </output>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
